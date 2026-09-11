import { describe, expect, it } from "@effect/vitest"
import { qadiTestLayer, subjectWith } from "@qadi/testing"
import { AppSqlLive, MigratorLive, SqlLive } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { GradingScales } from "./GradingScales.ts"
import { EntityNotFoundError } from "./Ownership.ts"

const DbLive = Layer.orDie(Layer.merge(MigratorLive.pipe(Layer.provide(SqlLive)), AppSqlLive))

/**
 * Issue #36's one required regression test: `updateGradingScale`'s not-found
 * path — now backed by the repository's own `findById` instead of a
 * hand-written pre-check `SELECT` — still raises the same `EntityNotFoundError`
 * shape as before the `Model.Class` migration.
 */
describe("GradingScales.updateGradingScale (issue #36)", () => {
  it.effect("raises EntityNotFoundError for a section with no grading scale", () =>
    Effect.gen(function*() {
      const gradingScales = yield* GradingScales
      const error = yield* Effect.flip(
        gradingScales.updateGradingScale({
          schoolId: "00000000-0000-0000-0000-000000000000",
          academicYearId: "00000000-0000-0000-0000-000000000000",
          sectionId: "00000000-0000-0000-0000-000000000000",
          maxScore: 100
        }).pipe(
          Effect.provide(
            qadiTestLayer(
              subjectWith({ roles: ["director"], attributes: { school_id: "00000000-0000-0000-0000-000000000000" } })
            )
          )
        )
      )
      expect(error).toBeInstanceOf(EntityNotFoundError)
      if (!(error instanceof EntityNotFoundError)) return
      expect(error.entityType).toBe("grading_scale")
    }).pipe(Effect.provide(Layer.merge(DbLive, GradingScales.layer))))
})
