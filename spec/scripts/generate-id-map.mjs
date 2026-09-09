#!/usr/bin/env node
// Deterministic old-ID -> new-ID crosswalk generator for the ZSchool spec
// migration (see /Users/mohammadalmechkor/.claude/plans/snappy-percolating-lecun.md).
//
// Rule (from the plan):
//   new_seq(file, ordinal) = block_start(file) + ordinal - 1
//   block_start(file)      = 1 + sum(block_size(f)) for every file f allocated
//                            earlier, in that prefix's existing prd/ file order
//   block_size(file)       = max(10, ceil(count(file) / 10) * 10)
//
// Extraction rule: for each owning file, walk the file top-to-bottom and
// collect each DISTINCT old ID in order of first appearance. First appearance
// is always the definition (a heading or a table-row definition), since every
// citation of an ID elsewhere in the same file necessarily comes after its
// own definition in these documents. This gives a stable, deterministic
// ordinal per file without needing to special-case heading vs. table syntax
// per prefix family.
//
// Running this script twice must produce byte-identical output.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../../", import.meta.url).pathname;
const prd = (p) => join(ROOT, "prd", p);
const root = (p) => join(ROOT, p);

const read = (path) => readFileSync(path, "utf8");

// ---------------------------------------------------------------------------
// Generic ordered-distinct-match extraction: first appearance = definition.
// ---------------------------------------------------------------------------
function extractOrdered(text, regex) {
  const seen = new Set();
  const ordered = [];
  for (const m of text.matchAll(regex)) {
    const id = m[0];
    if (!seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  }
  return ordered;
}

function blockSize(count) {
  return Math.max(10, Math.ceil(count / 10) * 10);
}

// Given an ordered list of {file, ids[]} in canonical file order, compute
// block_start/new IDs for every id and return rows.
function allocateBlocks(fileGroups, newPrefix, targetFileFor) {
  const rows = [];
  let cursor = 1;
  for (const group of fileGroups) {
    if (group.ids.length === 0) continue;
    const start = cursor;
    group.ids.forEach((oldId, idx) => {
      const n = start + idx;
      rows.push({
        oldId,
        newId: `${newPrefix}-${String(n).padStart(3, "0")}`,
        sourceFile: group.sourceFile,
        targetFile: targetFileFor(group),
        note: group.note ?? "",
      });
    });
    cursor = start + blockSize(group.ids.length);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Canonical file orders (matching prd/README.md's own chapter ordering).
// ---------------------------------------------------------------------------
const MODULES = [
  ["10-administration-onboarding-subscription", "ADM", "01-administration-onboarding-subscription.md"],
  ["11-admissions-enrollment-reenrollment", "INS", "02-admissions-enrollment-reenrollment.md"],
  ["12-academic-structure-timetables", "PED", "03-academic-structure-timetables.md"],
  ["13-attendance-student-life-discipline", "VSC", "04-attendance-student-life-discipline.md"],
  ["14-assessments-grades-report-cards", "EVA", "05-assessments-grades-report-cards.md"],
  ["15-documents-certificates", "DOC", "06-documents-certificates.md"],
  ["16-finance-billing-collections", "FIN", "07-finance-billing-collections.md"],
  ["17-communication-notifications", "COM", "08-communication-notifications.md"],
  ["18-transfers-mobility", "TRA", "09-transfers-mobility.md"],
  ["19-teacher-career-network", "CAR", "10-teacher-career-network.md"],
  ["20-dashboards-reporting", "RAP", "11-dashboards-reporting.md"],
  ["21-massar-regulatory-exports", "MAS", "12-massar-regulatory-exports.md"],
  ["22-ancillary-services-transport-canteen-activities", "SAN", "13-ancillary-services.md"],
  ["23-health-sensitive-data", "HEA", "14-health-sensitive-data.md"],
];

const JOURNEYS = [
  ["01-school-group-director", "DIR", "01-school-group-director.md"],
  ["02-secretary-cashier", "SEC", "02-secretary-cashier.md"],
  ["03-head-supervisor", "SUR", "03-head-supervisor.md"],
  ["04-part-time-teacher", "ENS", "04-part-time-teacher.md"],
  ["05-multi-school-parent", "PAR", "05-multi-school-parent.md"],
  ["06-custodial-mother-and-guardian", "GAR", "06-custodial-mother-and-guardian.md"],
  ["07-students-minor-and-adult", "ELE", "07-students-minor-and-adult.md"],
];

const CROSS_CUTTING = [
  ["30-roles-permissions-matrix", "01-permissions.md"],
  ["31-security-privacy", "02-security-privacy.md"],
  ["32-non-functional-requirements", "03-non-functional-requirements.md"],
  ["33-business-model-packaging", "04-business-model-packaging.md"],
  ["34-ux-ui-mobile-first-rtl", "05-ux-ui-mobile-first-rtl.md"],
  ["35-external-integrations", "06-external-integrations.md"],
  ["36-legal-compliance-data-protection", "07-legal-compliance-data-protection.md"],
  ["37-roadmap-mvp-v1-v2", null], // -> roadmap.md, see below
  ["38-kpi-success-metrics", null], // -> metrics.md
  ["39-risks-mitigations", null], // -> risks.md
  ["40-assumptions-open-questions-tracker", null], // -> open-questions.md
  ["41-glossary", null], // unchanged, no live-ID family owned here
  ["42-review-arbitrations", null], // -> decisions/ (ARB, ESC)
];

const rows = []; // all crosswalk rows across every family
const notes = []; // free-form generator notes for the report

// ---------------------------------------------------------------------------
// FR-<MOD>-NN -> BEH-ZS-NNN
// ---------------------------------------------------------------------------
{
  // Restricted to the file's OWN module code: a module file frequently cites
  // other modules' FR IDs in cross-references, which a generic \bFR-[A-Z]+-\d+\b
  // would wrongly pick up as if they were defined here too.
  const groups = MODULES.map(([oldFile, mod, newFile]) => {
    const text = read(prd(`modules/${oldFile}.md`));
    const re = new RegExp(`\\bFR-${mod}-\\d+\\b`, "g");
    // Definitions are "### FR-<MOD>-NN" headings specifically, not just any
    // occurrence -- a requirement's own body can reference a *later* sibling
    // FR in the same module before that sibling's heading appears.
    const headingText = text.split("\n").filter((l) => l.startsWith("### FR-")).join("\n");
    const ids = extractOrdered(headingText, re);
    return { sourceFile: `prd/modules/${oldFile}.md`, ids, newFile, mod };
  });
  rows.push(...allocateBlocks(groups, "BEH-ZS", (g) => `spec/behaviors/${g.newFile}`));
}

// ---------------------------------------------------------------------------
// ECR-<MOD>-NN (excluding ECR-UX) -> SCR-ZS-NNN, inline per behaviors file
// ECR-UX-NN -> SCR-ZS-NNN, owned by cross-cutting/05-ux-ui-mobile-first-rtl.md
// ---------------------------------------------------------------------------
{
  const groups = MODULES.map(([oldFile, mod, newFile]) => {
    const text = read(prd(`modules/${oldFile}.md`));
    const re = new RegExp(`\\bECR-${mod}-\\d+\\b`, "g");
    const ids = extractOrdered(text, re);
    return { sourceFile: `prd/modules/${oldFile}.md`, ids, newFile };
  });
  const uxText = read(prd("cross-cutting/34-ux-ui-mobile-first-rtl.md"));
  const uxIds = extractOrdered(uxText, /\bECR-UX-\d+\b/g);
  // ECR-UX-NN continues the SAME SCR-ZS sequence after the module blocks
  // (screens are one flat namespace regardless of owner), so both source
  // groups are allocated together in one pass.
  const allScrGroups = [...groups, { sourceFile: "prd/cross-cutting/34-ux-ui-mobile-first-rtl.md", ids: uxIds, newFile: "05-ux-ui-mobile-first-rtl.md" }];
  const scrRows = allocateBlocks(allScrGroups, "SCR-ZS", (g) =>
    g.newFile === "05-ux-ui-mobile-first-rtl.md"
      ? `spec/cross-cutting/05-ux-ui-mobile-first-rtl.md#screens`
      : `spec/behaviors/${g.newFile}#screens`
  );
  rows.push(...scrRows);
  notes.push(
    "SCR-ZS: ECR-<MOD>-NN (121 defs, one block per module) and ECR-UX-NN (9 defs) share ONE flat SCR-ZS sequence; ECR-UX-NN is owned by cross-cutting/05, not a behaviors file — discovered during generation, not in the plan's original table."
  );
}

// ---------------------------------------------------------------------------
// INV-NN + RG-NN -> INV-ZS-NNN (unified), target: spec/invariants.md
// INV block first (03-domain-data-model.md), then RG block (PROJECT.md).
// ---------------------------------------------------------------------------
{
  const invText = read(prd("03-domain-data-model.md"));
  const invIds = extractOrdered(invText, /\bINV-\d+\b/g);
  const rgText = read(root("PROJECT.md"));
  const rgIds = extractOrdered(rgText, /\bRG-\d+[a-z]?\b/g);
  const groups = [
    { sourceFile: "prd/03-domain-data-model.md", ids: invIds, tag: "INV" },
    { sourceFile: "PROJECT.md", ids: rgIds, tag: "RG" },
  ];
  rows.push(...allocateBlocks(groups, "INV-ZS", () => "spec/invariants.md"));
}

// ---------------------------------------------------------------------------
// BES-<PERS>-NN -> URS-ZS-NNN, target: spec/urs.md
// ---------------------------------------------------------------------------
{
  const text = read(prd("02-actors-personas.md"));
  const ids = extractOrdered(text, /\bBES-[A-Z]+-\d+\b/g);
  const groups = [{ sourceFile: "prd/02-actors-personas.md", ids }];
  rows.push(...allocateBlocks(groups, "URS-ZS", () => "spec/urs.md"));
}

// ---------------------------------------------------------------------------
// DEC-NN + ARB-NN + ESC-NN -> ADR-ZS-NNN (unified), target: spec/decisions/
// Order: DEC block (PROJECT.md) -> ARB block -> ESC block (both cross-cutting/42).
// STACK.md's own architectural decisions are NOT in this crosswalk: they have
// no old ID to map from and are minted fresh in Phase 1.5.
// ---------------------------------------------------------------------------
{
  const decText = read(root("PROJECT.md"));
  const decIds = extractOrdered(decText, /\bDEC-\d+\b/g);
  const arbEscText = read(prd("cross-cutting/42-review-arbitrations.md"));
  const arbIds = extractOrdered(arbEscText, /\bARB-\d+\b/g);
  const escIds = extractOrdered(arbEscText, /\bESC-\d+\b/g);
  const groups = [
    { sourceFile: "PROJECT.md", ids: decIds, tag: "DEC" },
    { sourceFile: "prd/cross-cutting/42-review-arbitrations.md", ids: arbIds, tag: "ARB" },
    { sourceFile: "prd/cross-cutting/42-review-arbitrations.md", ids: escIds, tag: "ESC", note: "Status: Escalated - pending product owner" },
  ];
  rows.push(...allocateBlocks(groups, "ADR-ZS", () => "spec/decisions/ (file TBD in Phase 1.5)"));
  notes.push(
    "ADR-ZS: lettered ARB citations (e.g. ARB-20h, ARB-25j) found in the corpus are sub-references to a single arbitration row, not distinct top-level IDs -- only bare ARB-NN (26 total) got new IDs, matching prd/README.md's stated count."
  );
}

// ---------------------------------------------------------------------------
// PJ-<PERS>-NN -> JNY-ZS-NNN, target: spec/journeys/0N-*.md
// Sub-steps like PJ-SEC-01.7 fold into their parent PJ-SEC-01 automatically:
// the regex only matches the integer-suffixed parent form.
// ---------------------------------------------------------------------------
{
  // Same restriction as FR above: only this file's own persona code, only
  // from "### PJ-<PERS>-NN" headings, not cross-persona citations in prose.
  const groups = JOURNEYS.map(([oldFile, pers, newFile]) => {
    const text = read(prd(`journeys/${oldFile}.md`));
    const re = new RegExp(`\\bPJ-${pers}-\\d+\\b`, "g");
    const headingText = text.split("\n").filter((l) => l.startsWith("### PJ-")).join("\n");
    const ids = extractOrdered(headingText, re);
    return { sourceFile: `prd/journeys/${oldFile}.md`, ids, newFile };
  });
  rows.push(...allocateBlocks(groups, "JNY-ZS", (g) => `spec/journeys/${g.newFile}`));
}

// ---------------------------------------------------------------------------
// PC-NN -> JMP-ZS-NNN, target: spec/journeys/00-journey-map.md
// ---------------------------------------------------------------------------
{
  const text = read(prd("journeys/00-journey-map.md"));
  const ids = extractOrdered(text, /\bPC-\d+\b/g);
  const groups = [{ sourceFile: "prd/journeys/00-journey-map.md", ids }];
  rows.push(...allocateBlocks(groups, "JMP-ZS", () => "spec/journeys/00-journey-map.md"));
}

// ---------------------------------------------------------------------------
// Single-owner cross-cutting families: PER, SEC, NFR, PAK, UX, INT, CNF, JAL, KPI, R
// ---------------------------------------------------------------------------
function singleOwnerFamily(oldFile, regex, newPrefix, targetFile) {
  const text = read(prd(`cross-cutting/${oldFile}.md`));
  const ids = extractOrdered(text, regex);
  const groups = [{ sourceFile: `prd/cross-cutting/${oldFile}.md`, ids }];
  rows.push(...allocateBlocks(groups, newPrefix, () => targetFile));
}

singleOwnerFamily("30-roles-permissions-matrix", /\bPER-\d+\b/g, "PER-ZS", "spec/cross-cutting/01-permissions.md");
singleOwnerFamily("31-security-privacy", /\bSEC-\d+\b/g, "SEC-ZS", "spec/cross-cutting/02-security-privacy.md");
singleOwnerFamily("32-non-functional-requirements", /\bNFR-[A-Z0-9]+-\d+\b/g, "NFR-ZS", "spec/cross-cutting/03-non-functional-requirements.md");
singleOwnerFamily("33-business-model-packaging", /\bPAK-\d+\b/g, "PAK-ZS", "spec/cross-cutting/04-business-model-packaging.md");
singleOwnerFamily("34-ux-ui-mobile-first-rtl", /(?<!ECR-)\bUX-\d+\b/g, "UX-ZS", "spec/cross-cutting/05-ux-ui-mobile-first-rtl.md");
singleOwnerFamily("35-external-integrations", /\bINT-[A-Z]+-\d+\b/g, "INT-ZS", "spec/cross-cutting/06-external-integrations.md");
singleOwnerFamily("36-legal-compliance-data-protection", /\bCNF-\d+\b/g, "CNF-ZS", "spec/cross-cutting/07-legal-compliance-data-protection.md");
singleOwnerFamily("37-roadmap-mvp-v1-v2", /\bJAL-\d+\b/g, "RDM-ZS", "spec/roadmap.md");
singleOwnerFamily("38-kpi-success-metrics", /\bKPI-\d+\b/g, "KPI-ZS", "spec/metrics.md");
singleOwnerFamily("39-risks-mitigations", /\bR-\d+\b/g, "RSK-ZS", "spec/risks.md");

// ---------------------------------------------------------------------------
// OQ-NN (file-local!) -> OQ-ZS-NNN (global), target: spec/open-questions.md
// Every .md file under prd/** (+ PROJECT.md) that defines its own local
// "| OQ-NN | ... |" table rows gets one block, in prd/README.md's own
// chapter-listing order. Files with zero OQ rows are skipped (no block).
// ---------------------------------------------------------------------------
{
  const OQ_FILE_ORDER = [
    "PROJECT.md",
    "prd/00-conventions.md",
    "prd/01-context-vision-scope.md",
    "prd/02-actors-personas.md",
    "prd/03-domain-data-model.md",
    ...MODULES.map(([f]) => `prd/modules/${f}.md`),
    "prd/journeys/00-journey-map.md",
    ...JOURNEYS.map(([f]) => `prd/journeys/${f}.md`),
    ...CROSS_CUTTING.map(([f]) => `prd/cross-cutting/${f}.md`),
    "prd/research/00-baseline-corrections.md",
    "prd/research/01-market-competition.md",
    "prd/research/02-regulatory-data.md",
    "prd/research/03-payments-communications.md",
    "prd/research/04-pedagogy-massar-calendar.md",
    "prd/research/05-infrastructure-usage.md",
  ];
  const groups = OQ_FILE_ORDER.map((rel) => {
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) return { sourceFile: rel, ids: [] };
    const text = read(abs);
    const ids = extractOrdered(text, /^\| OQ-\d+ \|/gm).map((m) => m.slice(2, -2).trim());
    return { sourceFile: rel, ids };
  });
  rows.push(...allocateBlocks(groups, "OQ-ZS", () => "spec/open-questions.md"));
  const total = groups.reduce((n, g) => n + g.ids.length, 0);
  notes.push(
    `OQ-ZS: ${total} distinct (file, OQ-NN) definitions found across ${groups.filter((g) => g.ids.length).length} owning files (file-local numbering re-keyed to one global sequence). prd/README.md states "256 local OQs consolidated in cross-cutting/40 section 4.1" -- prd/cross-cutting/40-assumptions-open-questions-tracker.md itself additionally owns 9 of its own local OQ-01..09 (top-level monitoring items, distinct content from the 256 it consolidates from other chapters), which is why the total here is 256 + 9 = 265, not 256. Verified by inspection: cross-cutting/40's own OQ-01..09 rows describe genuinely different questions (Massar file formats, Fatourati pricing, etc.) than any other chapter's OQ-NN, so all 265 are real distinct entries, not duplicates.`
  );
}

// ---------------------------------------------------------------------------
// H-NN, G-NN, C-NN, Q-NN -> unchanged, non-normative, relocated as-is.
// D1..D10 -> no new ID, folded into the superseding ADR's Context section.
// ---------------------------------------------------------------------------
{
  const text = read(root("PROJECT.md"));
  for (const [tag, re] of [
    ["H", /\bH-\d+\b/g],
    ["G", /\bG-\d+\b/g],
    ["C", /\bC-\d+\b/g],
    ["Q", /\bQ-\d+\b/g],
  ]) {
    const ids = extractOrdered(text, re);
    for (const oldId of ids) {
      rows.push({
        oldId,
        newId: "unchanged (non-normative)",
        sourceFile: "PROJECT.md",
        targetFile: "spec/appendices/01-review-history.md",
        note: `${tag}- series: closed baseline-review record, not remapped per plan §0.`,
      });
    }
  }
  for (let i = 1; i <= 10; i++) {
    rows.push({
      oldId: `D${i}`,
      newId: "none (folded into superseding ADR)",
      sourceFile: "prd/README.md / prd/cross-cutting/42-review-arbitrations.md",
      targetFile: "spec/decisions/*.md (Context section, as a historical-alias note)",
      note: "Informal README-level arbitration shorthand, already 1:1 aliased to an ARB in the source corpus.",
    });
  }
}

// ---------------------------------------------------------------------------
// Write spec/process/id-migration-map.md
// ---------------------------------------------------------------------------
const PREFIX_ORDER = [
  "BEH-ZS", "SCR-ZS", "INV-ZS", "URS-ZS", "ADR-ZS", "JNY-ZS", "JMP-ZS",
  "PER-ZS", "SEC-ZS", "NFR-ZS", "PAK-ZS", "UX-ZS", "INT-ZS", "CNF-ZS",
  "RDM-ZS", "KPI-ZS", "RSK-ZS", "OQ-ZS",
];
function familyOf(row) {
  if (row.newId.startsWith("unchanged")) return "H-G-C-Q (unchanged)";
  if (row.newId.startsWith("none")) return "D1-D10 (folded)";
  return row.newId.split("-").slice(0, 2).join("-");
}
const grouped = new Map();
for (const r of rows) {
  const fam = familyOf(r);
  if (!grouped.has(fam)) grouped.set(fam, []);
  grouped.get(fam).push(r);
}
const orderKey = (fam) => {
  const i = PREFIX_ORDER.indexOf(fam);
  return i === -1 ? PREFIX_ORDER.length + (fam.startsWith("H-G") ? 0 : 1) : i;
};
const families = [...grouped.keys()].sort((a, b) => orderKey(a) - orderKey(b));

let out = `# ZSchool ID migration map

> **Document Control**
>
> | Property       | Value                                                        |
> | -------------- | ------------------------------------------------------------- |
> | Document ID    | ZSCHOOL-PROC-03                                                |
> | Revision       | 1.0                                                            |
> | Effective Date | 2026-09-09                                                     |
> | Status         | Effective                                                      |
> | Author         | ZSchool Product                                                |
> | Classification | Process — Migration Record                                     |
> | Change History | 1.0 (2026-09-09): Generated by \`spec/scripts/generate-id-map.mjs\` for Phase 0 of the qadi-style spec migration (CCR-ZS-001) |

Generated by \`spec/scripts/generate-id-map.mjs\`. **Permanent record — append-only.**
Once reviewed and frozen at the end of Phase 0, a row is never edited or
renumbered; a later-discovered ID gets a new row. See
\`spec/process/requirement-id-scheme.md\` for the permanence rule this record
exists to satisfy.

Total rows: ${rows.length}.

`;

for (const fam of families) {
  const famRows = grouped.get(fam);
  out += `## ${fam} (${famRows.length} rows)\n\n`;
  out += `| old_id | new_id | source_file | target_file | note |\n`;
  out += `|---|---|---|---|---|\n`;
  for (const r of famRows) {
    out += `| ${r.oldId} | ${r.newId} | ${r.sourceFile} | ${r.targetFile} | ${r.note ?? ""} |\n`;
  }
  out += `\n`;
}

if (notes.length) {
  out += `## Generator notes\n\n`;
  for (const n of notes) out += `- ${n}\n`;
  out += `\n`;
}

writeFileSync(join(ROOT, "spec/process/id-migration-map.md"), out, "utf8");

// ---------------------------------------------------------------------------
// Console summary
// ---------------------------------------------------------------------------
console.log(`Wrote ${rows.length} rows to spec/process/id-migration-map.md\n`);
for (const fam of families) {
  console.log(`${fam.padEnd(20)} ${grouped.get(fam).length}`);
}
if (notes.length) {
  console.log("\nNotes:");
  for (const n of notes) console.log(`- ${n}`);
}
