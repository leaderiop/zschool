import { type CycleCode, instantiateNationalTemplate, type InstantiateNationalTemplateResult } from "@zschool/domain"
import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { asDirectorOf } from "../layers/auth.ts"

export interface CreateInstantiatedSchoolOptions {
  readonly name?: string
  readonly academicYearLabel?: string
  readonly authorizedCycles?: ReadonlyArray<CycleCode>
}

export interface InstantiatedSchool extends InstantiateNationalTemplateResult {
  readonly schoolId: string
}

/**
 * "Insert a school, then instantiate the national template" (issue #34) —
 * every `.steps.test.ts` file except `fr-ped-01-instantiate-national-template`
 * (which tests `instantiateNationalTemplate` itself, and needs full control
 * over each call) used to reimplement this exact two-statement setup, with
 * only the school name / year label / authorized cycles varying.
 *
 * `Effect.orDie`: every scenario using this fixture is authorized as the
 * instantiating school's own director, so `UnauthorizedCycleError` can never
 * actually occur here — collapsing it to a defect keeps every step in a
 * Feature sharing one error union instead of each having to know about a
 * business error only a misconfigured test setup could ever raise.
 */
export const createInstantiatedSchool = (options?: CreateInstantiatedSchoolOptions) =>
  Effect.gen(function*() {
    const sql = yield* SqlClient
    const name = options?.name ?? "Test school"
    const academicYearLabel = options?.academicYearLabel ?? "2026-2027"
    const authorizedCycles = options?.authorizedCycles
      ?? (["preschool", "primary", "middle", "upper_secondary"] as const)

    const [school] = yield* sql<{ id: string }>`INSERT INTO schools (name) VALUES (${name}) RETURNING id`
    const result = yield* instantiateNationalTemplate({
      schoolId: school.id,
      academicYearLabel,
      authorizedCycles
    }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

    return { schoolId: school.id, ...result }
  })
