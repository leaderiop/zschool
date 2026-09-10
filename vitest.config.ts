import { gherkinTags, gherkinWatchTriggers } from "@effect-cucumber/vitest"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: [
      { test: { name: "unit", include: ["packages/*/src/**/*.test.ts", "apps/*/src/**/*.test.ts"] } },
      {
        plugins: [gherkinWatchTriggers("features/**/*.feature", { cwd: process.cwd() })],
        test: {
          name: "bdd",
          include: ["features/**/*.steps.test.ts"],
          // Every step is a real network round trip to Postgres (Neon), not a
          // mock — a Scenario that instantiates the full national template
          // issues on the order of a hundred sequential statements, which
          // comfortably exceeds vitest's 5s default.
          testTimeout: 60_000,
          // `@skip`/`@only` are declared unconditionally so either is usable
          // even before a `.feature` file uses it; deduped by name against
          // `gherkinTags`'s own discovery since a tag already in use there
          // (e.g. `@skip`) would otherwise be declared twice. The stub
          // entries come FIRST in the array below and `gherkinTags`' own
          // discoveries LAST — `Map` keeps the last value per key, so a real
          // discovered tag (with whatever metadata `@effect-cucumber/vitest`
          // attaches) wins over the bare stub, never the other way around.
          tags: [
            ...new Map(
              [{ name: "@skip" }, { name: "@only" }, ...gherkinTags("features/**/*.feature", { cwd: process.cwd() })]
                .map((tag) => [tag.name, tag] as const)
            ).values()
          ]
        }
      }
    ]
  }
})
