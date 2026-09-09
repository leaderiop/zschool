#!/usr/bin/env bash
#
# Verifies the structural integrity of spec/.
#
# Ported from /Users/mohammadalmechkor/Projects/Perso/qadi/spec/scripts/verify-traceability.sh,
# adapted to this repo's layout (spec/, single-level features/<mod>/ instead of
# qadi's features/features/) and extended with two ZSchool-specific checks (7
# and 8) that qadi's own script has no need for.
#
# Usage: bash spec/scripts/verify-traceability.sh [--strict]
#   --strict  treat SKIP as FAIL (the merge gate always passes it)

set -uo pipefail

STRICT=0
[[ "${1:-}" == "--strict" ]] && STRICT=1

SPEC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "$SPEC_DIR/.." && pwd)"

PASS=0
FAIL=0
SKIP=0

report() { # status, check, detail
  printf '| %-6s | %-42s | %s\n' "$1" "$2" "$3"
  case "$1" in
    PASS) PASS=$((PASS + 1)) ;;
    FAIL) FAIL=$((FAIL + 1)) ;;
    SKIP) if [[ $STRICT -eq 1 ]]; then FAIL=$((FAIL + 1)); else SKIP=$((SKIP + 1)); fi ;;
  esac
}

echo
echo "ZSchool specification verification"
echo "| Status | Check                                      | Detail"
echo "| ------ | ------------------------------------------ | ------"

# ---------------------------------------------------------------------------
# 1. Every index.yaml entry resolves to a file on disk, and vice versa.
# ---------------------------------------------------------------------------
for index in "$SPEC_DIR"/*/index.yaml; do
  [[ -e "$index" ]] || continue
  dir="$(dirname "$index")"
  name="$(basename "$dir")"

  missing=""
  declared=""
  while IFS= read -r file; do
    declared="${declared} ${file}"
    [[ -f "$dir/$file" ]] || missing="${missing} ${file}"
  done < <(grep -oE '^\s+file:\s*"[^"]+"' "$index" | sed -E 's/.*"([^"]+)".*/\1/')

  if [[ -n "$missing" ]]; then
    report FAIL "$name/index.yaml -> disk" "missing:${missing}"
  else
    count=$(wc -w <<< "$declared" | tr -d ' ')
    report PASS "$name/index.yaml -> disk" "$count entr(y|ies) resolve"
  fi

  # Reverse: any .md on disk not declared in the registry is an orphan.
  orphans=""
  for f in "$dir"/*.md; do
    [[ -e "$f" ]] || continue
    base="$(basename "$f")"
    [[ "$base" == "README.md" ]] && continue
    grep -q "\"$base\"" "$index" || orphans="${orphans} ${base}"
  done

  if [[ -n "$orphans" ]]; then
    report FAIL "$name/ disk -> index.yaml" "orphaned:${orphans}"
  else
    report PASS "$name/ disk -> index.yaml" "no orphans"
  fi
done

# ---------------------------------------------------------------------------
# 2. Every INV-ZS-NNN in invariants.md appears in traceability.md.
# ---------------------------------------------------------------------------
if [[ -f "$SPEC_DIR/invariants.md" && -f "$SPEC_DIR/traceability.md" ]]; then
  untraced=""
  count=0
  while IFS= read -r inv; do
    count=$((count + 1))
    grep -q "$inv" "$SPEC_DIR/traceability.md" || untraced="${untraced} ${inv}"
  done < <(grep -oE 'INV-ZS-[0-9]{3}' "$SPEC_DIR/invariants.md" | sort -u)

  if [[ -n "$untraced" ]]; then
    report FAIL "invariants -> traceability" "untraced:${untraced}"
  else
    report PASS "invariants -> traceability" "all $count invariant(s) traced"
  fi
else
  report SKIP "invariants -> traceability" "invariants.md or traceability.md absent"
fi

# ---------------------------------------------------------------------------
# 3. Every ADR file maps to an ADR-ZS-NNN present in traceability.md.
# ---------------------------------------------------------------------------
if [[ -d "$SPEC_DIR/decisions" && -f "$SPEC_DIR/traceability.md" ]]; then
  untraced=""
  found=0
  for f in "$SPEC_DIR"/decisions/[0-9][0-9][0-9]-*.md; do
    [[ -e "$f" ]] || continue
    found=$((found + 1))
    num="$(basename "$f" | cut -c1-3)"
    grep -q "ADR-ZS-$num" "$SPEC_DIR/traceability.md" || untraced="${untraced} ADR-ZS-$num"
  done

  if [[ $found -eq 0 ]]; then
    report SKIP "decisions -> traceability" "no ADR files yet"
  elif [[ -n "$untraced" ]]; then
    report FAIL "decisions -> traceability" "untraced:${untraced}"
  else
    report PASS "decisions -> traceability" "$found ADR(s) traced"
  fi
else
  report SKIP "decisions -> traceability" "decisions/ or traceability.md absent"
fi

# ---------------------------------------------------------------------------
# 4. Every requirement-family ID declared in its owning file is mentioned at
#    least twice in that file (heading + at least one traceability-table row).
#    Generalized from qadi's urs.md-only check: ZSchool's requirement families
#    live in several owning files, not one.
# ---------------------------------------------------------------------------
declare -a REQ_FAMILIES=(
  "urs.md:URS-ZS"
  "cross-cutting/01-permissions.md:PER-ZS"
  "cross-cutting/02-security-privacy.md:SEC-ZS"
  "cross-cutting/03-non-functional-requirements.md:NFR-ZS"
  "cross-cutting/04-business-model-packaging.md:PAK-ZS"
  "cross-cutting/05-ux-ui-mobile-first-rtl.md:UX-ZS"
  "cross-cutting/06-external-integrations.md:INT-ZS"
  "cross-cutting/07-legal-compliance-data-protection.md:CNF-ZS"
)
# behaviors/*.md (BEH-ZS) and journeys/*.md (JNY-ZS + JMP-ZS) are dynamically
# named across Phase 2/3 forks, so their filenames can't be hardcoded above --
# check every file present under each directory instead.
for f in "$SPEC_DIR"/behaviors/*.md; do
  [[ -f "$f" ]] || continue
  REQ_FAMILIES+=("behaviors/$(basename "$f"):BEH-ZS")
done
for f in "$SPEC_DIR"/journeys/*.md; do
  [[ -f "$f" ]] || continue
  REQ_FAMILIES+=("journeys/$(basename "$f"):JNY-ZS")
  REQ_FAMILIES+=("journeys/$(basename "$f"):JMP-ZS")
done
any_req_family_file=0
for entry in "${REQ_FAMILIES[@]}"; do
  file="${entry%%:*}"
  prefix="${entry##*:}"
  path="$SPEC_DIR/$file"
  [[ -f "$path" ]] || continue
  any_req_family_file=1
  untraced=""
  declared=0
  while IFS= read -r id; do
    declared=$((declared + 1))
    n=$(grep -c "$id" "$path")
    [[ "$n" -ge 2 ]] || untraced="${untraced} ${id}"
  done < <(grep -oE "${prefix}-[0-9]{3}" "$path" | sort -u)

  if [[ $declared -eq 0 ]]; then
    report SKIP "$file -> self-traceability" "no $prefix requirements declared"
  elif [[ -n "$untraced" ]]; then
    report FAIL "$file -> self-traceability" "untraced:${untraced}"
  else
    report PASS "$file -> self-traceability" "$declared requirement(s) traced"
  fi
done
[[ $any_req_family_file -eq 1 ]] || report SKIP "requirement-family self-traceability" "no owning files exist yet"

# ---------------------------------------------------------------------------
# 5. Every @REQ-ZS-NNN tag used in a .feature file is defined in traceability.md.
# ---------------------------------------------------------------------------
if [[ -d "$ROOT_DIR/features" && -f "$SPEC_DIR/traceability.md" ]]; then
  undefined=""
  tags=$(grep -rhoE '@REQ-ZS-[0-9]{3}' "$ROOT_DIR/features" 2>/dev/null | sort -u)
  if [[ -z "$tags" ]]; then
    report SKIP "features -> traceability" "no .feature tags yet"
  else
    while IFS= read -r tag; do
      grep -q "${tag#@}" "$SPEC_DIR/traceability.md" || undefined="${undefined} ${tag}"
    done <<< "$tags"
    if [[ -n "$undefined" ]]; then
      report FAIL "features -> traceability" "undefined:${undefined}"
    else
      report PASS "features -> traceability" "all REQ tags defined"
    fi
  fi
else
  report SKIP "features -> traceability" "features/ or traceability.md absent"
fi

# ---------------------------------------------------------------------------
# 6. No broken relative markdown links under spec/, gitignore-aware.
#
# A target that exists but is gitignored counts as broken: it resolves on the
# author's machine and nowhere else, which is not a passing state (same
# rationale as qadi's own script, which added this after exactly that failure
# mode shipped in two of its own ADRs).
# ---------------------------------------------------------------------------
broken=""
untracked=""
checked=0
while IFS= read -r md; do
  dir="$(dirname "$md")"
  while IFS= read -r target; do
    [[ -z "$target" ]] && continue
    case "$target" in
      http*|mailto*|\#*) continue ;;
    esac
    path="${target%%#*}"
    [[ -z "$path" ]] && continue
    checked=$((checked + 1))
    if [[ ! -e "$dir/$path" ]]; then
      broken="${broken} $(basename "$md")->${path}"
    elif git -C "$ROOT_DIR" check-ignore -q "$dir/$path" 2>/dev/null; then
      untracked="${untracked} $(basename "$md")->${path}"
    fi
  done < <(awk '/^[[:space:]]*```/ { fence = !fence; next } !fence' "$md" \
    | grep -oE '\]\([^)]+\)' | sed -E 's/^\]\((.*)\)$/\1/')
done < <(find "$SPEC_DIR" -name '*.md' -type f)

if [[ -n "$broken" ]]; then
  report FAIL "relative link integrity" "broken:${broken}"
elif [[ -n "$untracked" ]]; then
  report FAIL "relative link integrity" "gitignored, so broken for everyone else:${untracked}"
elif [[ $checked -eq 0 ]]; then
  report SKIP "relative link integrity" "no relative links found yet"
else
  report PASS "relative link integrity" "$checked link(s) resolve, none gitignored"
fi

# ---------------------------------------------------------------------------
# 7. Every SCR-ZS-NNN cited in a behaviors file's Screens subsection (or in
#    cross-cutting/05's, for the ECR-UX-derived screens — see
#    process/requirement-id-scheme.md §3) appears in traceability.md §7.
# ---------------------------------------------------------------------------
scr_sources=()
[[ -d "$SPEC_DIR/behaviors" ]] && while IFS= read -r f; do scr_sources+=("$f"); done < <(find "$SPEC_DIR/behaviors" -name '*.md' -type f 2>/dev/null)
[[ -f "$SPEC_DIR/cross-cutting/05-ux-ui-mobile-first-rtl.md" ]] && scr_sources+=("$SPEC_DIR/cross-cutting/05-ux-ui-mobile-first-rtl.md")

if [[ ${#scr_sources[@]} -gt 0 && -f "$SPEC_DIR/traceability.md" ]]; then
  all_scr=$(grep -hoE 'SCR-ZS-[0-9]{3}' "${scr_sources[@]}" 2>/dev/null | sort -u)
  if [[ -z "$all_scr" ]]; then
    report SKIP "screens -> traceability" "no SCR-ZS citations yet"
  else
    section="$(awk '/^## §7 /{flag=1; next} /^## §8 /{flag=0} flag' "$SPEC_DIR/traceability.md")"
    undefined=""
    count=0
    while IFS= read -r scr; do
      count=$((count + 1))
      grep -q "$scr" <<< "$section" || undefined="${undefined} ${scr}"
    done <<< "$all_scr"
    if [[ -n "$undefined" ]]; then
      report FAIL "screens -> traceability" "untraced:${undefined}"
    else
      report PASS "screens -> traceability" "$count screen(s) traced"
    fi
  fi
else
  report SKIP "screens -> traceability" "no behaviors/ or cross-cutting/05 yet"
fi

# ---------------------------------------------------------------------------
# 8. No legacy identifier pattern remains anywhere under spec/ that a
#    completed migration phase claims to have fully migrated.
#
# process/ is exempt: it is documentation ABOUT the migration (the ID scheme,
# the migration map) and legitimately quotes old-scheme identifiers as data
# and as explanatory examples. appendices/ is exempt for the same reason:
# 01-review-history.md deliberately preserves H-/G-/C-/Q- IDs unchanged,
# non-normative, per process/requirement-id-scheme.md §2. Every OTHER
# normative document must be clean, EXCEPT for the ADR template's own
# "Historical aliases:" line (decisions/*.md) and every file's own Document
# Control "Change History" line, both of which legitimately cite the old
# id(s) a document was migrated from (the plan's own header template does
# this on every single file, e.g. "old FR-SAN-01..13 -> BEH-ZS-281..293") --
# both line shapes are stripped from the scanned text before matching.
LEGACY_PATTERN='FR-[A-Z]{3}-[0-9]+|PJ-[A-Z]{3}-[0-9]+|\bINV-[0-9]+\b|\bRG-[0-9]+|\bDEC-[0-9]+\b|\bARB-[0-9]+\b|\bESC-[0-9]+\b|BES-[A-Z]+-[0-9]+|\bPER-[0-9]+\b|ECR-[A-Z]+-[0-9]+|\bJAL-[0-9]+\b|\bKPI-[0-9]+\b|\bR-[0-9]+\b|\bOQ-[0-9]+\b'
ALIAS_LINE_PATTERN='[Hh]istorical alias(es)?|Change History'

legacy_hits=""
scan_count=0
while IFS= read -r md; do
  scan_count=$((scan_count + 1))
  hit=$(grep -v -E "$ALIAS_LINE_PATTERN" "$md" 2>/dev/null | grep -noE "$LEGACY_PATTERN" | head -1)
  [[ -n "$hit" ]] && legacy_hits="${legacy_hits} $(basename "$md"):${hit}"
done < <(find "$SPEC_DIR" -name '*.md' -type f \
  -not -path "$SPEC_DIR/process/*" \
  -not -path "$SPEC_DIR/appendices/*")

if [[ $scan_count -eq 0 ]]; then
  report SKIP "no legacy identifiers" "no normative files exist yet"
elif [[ -n "$legacy_hits" ]]; then
  report FAIL "no legacy identifiers" "found:${legacy_hits}"
else
  report PASS "no legacy identifiers" "$scan_count file(s) clean"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo
echo "PASS: $PASS   FAIL: $FAIL   SKIP: $SKIP$([[ $STRICT -eq 1 ]] && echo ' (strict: skips count as failures)')"
echo

[[ $FAIL -eq 0 ]] || exit 1
