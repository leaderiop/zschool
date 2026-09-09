# Support — claims of absence

`support/` is where step definitions, deterministic test layers (TestClock,
transport stubs), and fixtures would live once ZSchool has a wired-up BDD
runner, per `reports/2026-09-09-organizing-bdd-gherkin-tests.html` and
`spec/stack.md` (`@effect-cucumber/vitest`).

None of that exists yet. Explicitly, as of this migration:

| What | Status |
|---|---|
| `support/steps/*.steps.ts` (step definitions) | **Does not exist.** No glue code has been written for any `.feature` file in this tree. |
| `support/layers/*.ts` (TestClock, SMS/WhatsApp/CMI stubs, DB layer) | **Does not exist.** |
| `support/fixtures/*` (builders, anonymized test sets) | **Does not exist.** |
| `support/hooks.ts` (global hooks, ephemeral Neon branch lifecycle) | **Does not exist.** |
| `package.json` / any installed test runner | **Does not exist anywhere in this repo.** `@effect-cucumber/vitest` is a stated intent in `spec/stack.md`, not an installed dependency. |
| CI wiring that runs `.feature` files | **Does not exist.** |

This table is the registry for those absence-claims, following the pattern
`/Users/mohammadalmechkor/Projects/Perso/qadi/spec/devtools-spec/` uses for
"not yet built" statements: when any row above becomes false, update the row
and delete it together in the same change — don't let a stale "does not
exist" line sit next to code that now exists.

The `.feature` files under `features/**` are still valuable on their own as
executable-shaped acceptance criteria, correctly tagged and traceable — they
just aren't executed by anything yet.
