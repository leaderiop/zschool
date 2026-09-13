import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import * as Qadi from "@qadi/core/Qadi"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import {
  canRecordJustification,
  canTakeRollCall,
  canValidateJustification,
  canViewStudentLifeDashboard
} from "./Policies.ts"

const asSubject = (config: Parameters<typeof makeSubject>[0]) =>
  Layer.merge(EvaluationServicesNone, currentSubjectLayer(makeSubject(config)))

const allows = (policy: Parameters<typeof Qadi.check>[0], resource: Record<string, unknown>, action: string) =>
  Qadi.check(policy, { resource, action })

describe("canTakeRollCall (ticket #94 / wayfinder #83)", () => {
  it.effect("a director allows for their own school", () =>
    Effect.gen(function*() {
      const result = yield* allows(canTakeRollCall, { school_id: "school-1", cycle_id: "cycle-1" }, "take-roll-call")
      expect(result).toBe(true)
    }).pipe(Effect.provide(asSubject({ id: "d1", roles: ["director"], attributes: { school_id: "school-1" } }))))

  it.effect("a director denies for a different school", () =>
    Effect.gen(function*() {
      const result = yield* allows(canTakeRollCall, { school_id: "school-2", cycle_id: "cycle-1" }, "take-roll-call")
      expect(result).toBe(false)
    }).pipe(Effect.provide(asSubject({ id: "d1", roles: ["director"], attributes: { school_id: "school-1" } }))))

  it.effect("a whole-school (unscoped) student-life membership allows for any cycle in their school", () =>
    Effect.gen(function*() {
      const result = yield* allows(canTakeRollCall, { school_id: "school-1", cycle_id: "cycle-1" }, "take-roll-call")
      expect(result).toBe(true)
    }).pipe(
      Effect.provide(
        asSubject({ id: "sl1", roles: ["student_life"], attributes: { school_id: "school-1", cycle_ids: [] } })
      )
    ))

  it.effect("a cycle-scoped student-life membership allows only for their assigned cycle", () =>
    Effect.gen(function*() {
      const allowed = yield* allows(
        canTakeRollCall,
        { school_id: "school-1", cycle_id: "cycle-1" },
        "take-roll-call"
      )
      const denied = yield* allows(canTakeRollCall, { school_id: "school-1", cycle_id: "cycle-2" }, "take-roll-call")
      expect(allowed).toBe(true)
      expect(denied).toBe(false)
    }).pipe(
      Effect.provide(
        asSubject({
          id: "sl1",
          roles: ["student_life"],
          attributes: { school_id: "school-1", cycle_ids: ["cycle-1"] }
        })
      )
    ))

  it.effect("a teacher with no assignment for the course is denied", () =>
    Effect.gen(function*() {
      const result = yield* allows(
        canTakeRollCall,
        { school_id: "school-1", assigned_teacher_person_ids: [] },
        "take-roll-call"
      )
      expect(result).toBe(false)
    }).pipe(
      Effect.provide(
        asSubject({ id: "t1", roles: ["teacher"], attributes: { school_id: "school-1", person_id: "t1" } })
      )
    ))

  it.effect("a teacher assigned to the course is allowed", () =>
    Effect.gen(function*() {
      const result = yield* allows(
        canTakeRollCall,
        { school_id: "school-1", assigned_teacher_person_ids: ["t1"] },
        "take-roll-call"
      )
      expect(result).toBe(true)
    }).pipe(
      Effect.provide(
        asSubject({ id: "t1", roles: ["teacher"], attributes: { school_id: "school-1", person_id: "t1" } })
      )
    ))

  it.effect("a teacher declared as the session's substitute is allowed even without a TeacherAssignment", () =>
    Effect.gen(function*() {
      const result = yield* allows(
        canTakeRollCall,
        { school_id: "school-1", assigned_teacher_person_ids: [], substitute_teacher_person_id: "t1" },
        "take-roll-call"
      )
      expect(result).toBe(true)
    }).pipe(
      Effect.provide(
        asSubject({ id: "t1", roles: ["teacher"], attributes: { school_id: "school-1", person_id: "t1" } })
      )
    ))
})

describe("canRecordJustification / canValidateJustification (ticket #94)", () => {
  it.effect("front-office may record but not validate a justification", () =>
    Effect.gen(function*() {
      const canRecord = yield* allows(
        canRecordJustification,
        { school_id: "school-1", cycle_id: "cycle-1" },
        "record-justification"
      )
      const canValidate = yield* allows(
        canValidateJustification,
        { school_id: "school-1", cycle_id: "cycle-1" },
        "validate-justification"
      )
      expect(canRecord).toBe(true)
      expect(canValidate).toBe(false)
    }).pipe(
      Effect.provide(
        asSubject({ id: "fo1", roles: ["front_office"], attributes: { school_id: "school-1", cycle_ids: [] } })
      )
    ))

  it.effect("student-life may both record and validate a justification", () =>
    Effect.gen(function*() {
      const canRecord = yield* allows(
        canRecordJustification,
        { school_id: "school-1", cycle_id: "cycle-1" },
        "record-justification"
      )
      const canValidate = yield* allows(
        canValidateJustification,
        { school_id: "school-1", cycle_id: "cycle-1" },
        "validate-justification"
      )
      expect(canRecord).toBe(true)
      expect(canValidate).toBe(true)
    }).pipe(
      Effect.provide(
        asSubject({ id: "sl1", roles: ["student_life"], attributes: { school_id: "school-1", cycle_ids: [] } })
      )
    ))
})

describe("canViewStudentLifeDashboard (ticket #94)", () => {
  it.effect("denies a teacher", () =>
    Effect.gen(function*() {
      const result = yield* allows(canViewStudentLifeDashboard, { school_id: "school-1" }, "view-dashboard")
      expect(result).toBe(false)
    }).pipe(
      Effect.provide(
        asSubject({ id: "t1", roles: ["teacher"], attributes: { school_id: "school-1", person_id: "t1" } })
      )
    ))

  it.effect("allows student-life scoped to their own school", () =>
    Effect.gen(function*() {
      const result = yield* allows(canViewStudentLifeDashboard, { school_id: "school-1" }, "view-dashboard")
      expect(result).toBe(true)
    }).pipe(
      Effect.provide(
        asSubject({ id: "sl1", roles: ["student_life"], attributes: { school_id: "school-1", cycle_ids: [] } })
      )
    ))
})
