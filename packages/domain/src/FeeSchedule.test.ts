import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import {
  addFeeItem,
  createFeeSchedule,
  DuplicateFeeScheduleError,
  EntityNotFoundError,
  findFeeItems,
  findFeeScheduleForLevel,
  MandatoryJustificationRequiredError
} from "./FeeSchedule.ts"

/** Same `authorized`-gating context as `ImportBatch.test.ts`'s own `asDirectorOf`. */
const asDirectorOf = (schoolId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(makeSubject({ id: "director-1", roles: ["director"], attributes: { school_id: schoolId } }))
  )

/** Same school → year → section → cycle → level (→ track) chain as `AcademicTree.test.ts`'s `withSeededClass`, without pre-creating a class. */
const withSeededLevel = Effect.fn(function*<A, E, R>(
  use: (
    seed: { schoolId: string; academicYearId: string; levelId: string; trackId: string }
  ) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<
    { id: string }
  >`INSERT INTO schools (name) VALUES ('FeeSchedule test school') RETURNING id`
  return yield* withSchool(
    school.id,
    Effect.gen(function*() {
      const [year] = yield* sql<{ id: string }>`
        INSERT INTO academic_years (school_id, label) VALUES (${school.id}, '2026-2027') RETURNING id
      `
      const [section] = yield* sql<{ id: string }>`
        INSERT INTO sections (school_id, academic_year_id, template, name)
        VALUES (${school.id}, ${year.id}, 'national', 'National') RETURNING id
      `
      const [cycle] = yield* sql<{ id: string }>`
        INSERT INTO cycles (school_id, academic_year_id, section_id, code, name, sort_order)
        VALUES (${school.id}, ${year.id}, ${section.id}, 'PRIM', 'Primary', 1) RETURNING id
      `
      const [level] = yield* sql<{ id: string }>`
        INSERT INTO levels (school_id, academic_year_id, cycle_id, code, name, sort_order)
        VALUES (${school.id}, ${year.id}, ${cycle.id}, '6AP', '6ème Année Primaire', 1) RETURNING id
      `
      const [track] = yield* sql<{ id: string }>`
        INSERT INTO tracks (school_id, academic_year_id, level_id, code, name)
        VALUES (${school.id}, ${year.id}, ${level.id}, 'SCI', 'Sciences') RETURNING id
      `
      return yield* use({ schoolId: school.id, academicYearId: year.id, levelId: level.id, trackId: track.id })
    })
  )
}, Effect.provide(AppSqlLive))

describe("FeeSchedule (ticket #55 / BEH-ZS-151)", () => {
  it.effect("a director creates a fee schedule and adds typed fee lines", () =>
    withSeededLevel(({ academicYearId, levelId, schoolId }) =>
      Effect.gen(function*() {
        const scheduleId = yield* createFeeSchedule({
          schoolId,
          academicYearId,
          levelId
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const tuitionId = yield* addFeeItem({
          schoolId,
          feeScheduleId: scheduleId,
          nature: "tuition",
          labelFr: "Scolarité",
          labelAr: "الرسوم الدراسية",
          frequency: "monthly",
          amountMad: 1200,
          isMandatory: true
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        yield* addFeeItem({
          schoolId,
          feeScheduleId: scheduleId,
          nature: "registration",
          labelFr: "Inscription",
          labelAr: "التسجيل",
          frequency: "one_time",
          amountMad: 500,
          isMandatory: true
        }).pipe(Effect.provide(asDirectorOf(schoolId)))

        const items = yield* findFeeItems(schoolId, scheduleId)
        expect(items).toHaveLength(2)
        const tuition = items.find((item) => item.id === tuitionId)
        expect(tuition?.amount_mad).toBe(1200)
        expect(tuition?.nature).toBe("tuition")

        const found = yield* findFeeScheduleForLevel(schoolId, academicYearId, levelId, null)
        expect(Option.isSome(found)).toBe(true)
        if (Option.isSome(found)) expect(found.value.id).toBe(scheduleId)
      })
    ))

  it.effect("a second fee schedule for the same (year, level, track) is refused", () =>
    withSeededLevel(({ academicYearId, levelId, schoolId }) =>
      Effect.gen(function*() {
        yield* createFeeSchedule({ schoolId, academicYearId, levelId }).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const result = yield* Effect.result(
          createFeeSchedule({ schoolId, academicYearId, levelId }).pipe(Effect.provide(asDirectorOf(schoolId)))
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) {
          expect(result.failure).toBeInstanceOf(DuplicateFeeScheduleError)
        }
      })
    ))

  it.effect("a level from a different academic year than the command's is refused, not silently mixed", () =>
    withSeededLevel(({ levelId, schoolId }) =>
      Effect.gen(function*() {
        const sql = yield* SqlClient
        const [otherYear] = yield* sql<{ id: string }>`
          INSERT INTO academic_years (school_id, label) VALUES (${schoolId}, '2027-2028') RETURNING id
        `
        const result = yield* Effect.result(
          createFeeSchedule({ schoolId, academicYearId: otherYear.id, levelId }).pipe(
            Effect.provide(asDirectorOf(schoolId))
          )
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) {
          expect(result.failure).toBeInstanceOf(EntityNotFoundError)
        }
      })
    ))

  it.effect("a tracked schedule and its level's untracked schedule coexist independently", () =>
    withSeededLevel(({ academicYearId, levelId, schoolId, trackId }) =>
      Effect.gen(function*() {
        const untracked = yield* createFeeSchedule({ schoolId, academicYearId, levelId }).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        const tracked = yield* createFeeSchedule({ schoolId, academicYearId, levelId, trackId }).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )
        expect(untracked).not.toBe(tracked)

        const foundUntracked = yield* findFeeScheduleForLevel(schoolId, academicYearId, levelId, null)
        const foundTracked = yield* findFeeScheduleForLevel(schoolId, academicYearId, levelId, trackId)
        expect(Option.isSome(foundUntracked) && foundUntracked.value.id).toBe(untracked)
        expect(Option.isSome(foundTracked) && foundTracked.value.id).toBe(tracked)
      })
    ))

  it.effect("marking a uniform line mandatory without a justification is refused", () =>
    withSeededLevel(({ academicYearId, levelId, schoolId }) =>
      Effect.gen(function*() {
        const scheduleId = yield* createFeeSchedule({ schoolId, academicYearId, levelId }).pipe(
          Effect.provide(asDirectorOf(schoolId))
        )

        const result = yield* Effect.result(
          addFeeItem({
            schoolId,
            feeScheduleId: scheduleId,
            nature: "uniform",
            labelFr: "Uniforme",
            labelAr: "الزي المدرسي",
            frequency: "annual",
            amountMad: 300,
            isMandatory: true
          }).pipe(Effect.provide(asDirectorOf(schoolId)))
        )
        expect(Result.isFailure(result)).toBe(true)
        if (Result.isFailure(result)) {
          expect(result.failure).toBeInstanceOf(MandatoryJustificationRequiredError)
        }

        const withJustification = yield* addFeeItem({
          schoolId,
          feeScheduleId: scheduleId,
          nature: "uniform",
          labelFr: "Uniforme",
          labelAr: "الزي المدرسي",
          frequency: "annual",
          amountMad: 300,
          isMandatory: true,
          mandatoryJustification: "School board decision 2026-09-01, on file"
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        expect(withJustification).toBeTruthy()

        const optional = yield* addFeeItem({
          schoolId,
          feeScheduleId: scheduleId,
          nature: "uniform",
          labelFr: "Uniforme (optionnel)",
          labelAr: "الزي المدرسي (اختياري)",
          frequency: "annual",
          amountMad: 300,
          isMandatory: false
        }).pipe(Effect.provide(asDirectorOf(schoolId)))
        expect(optional).toBeTruthy()
      })
    ))
})
