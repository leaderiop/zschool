import { NodeCrypto } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { makeSubject } from "@qadi/core/AuthSubject"
import { currentSubjectLayer } from "@qadi/core/CurrentSubject"
import { EvaluationServicesNone } from "@qadi/core/EvaluationServicesNone"
import { AppSqlLive, withSchool } from "@zschool/db"
import * as Crypto from "effect/Crypto"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Result from "effect/Result"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { findCommendationsForStudent, recordCommendation } from "./Commendation.ts"

const randomUUID = Effect.flatMap(Crypto.Crypto, (crypto) => crypto.randomUUIDv4)

const asTeacher = (schoolId: string, teacherPersonId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({
        id: teacherPersonId,
        roles: ["teacher"],
        attributes: { school_id: schoolId, person_id: teacherPersonId }
      })
    )
  )

const asTeacherOfDifferentSchool = (teacherPersonId: string) =>
  Layer.merge(
    EvaluationServicesNone,
    currentSubjectLayer(
      makeSubject({
        id: teacherPersonId,
        roles: ["teacher"],
        attributes: { school_id: "a-different-school-id", person_id: teacherPersonId }
      })
    )
  )

const withCommendationFixture = Effect.fn(function*<A, E, R>(
  use: (seed: { schoolId: string; teacherPersonId: string; studentPersonId: string }) => Effect.Effect<A, E, R>
) {
  const sql = yield* SqlClient
  const [school] = yield* sql<{ id: string }>`
    INSERT INTO schools (name) VALUES ('Ticket #106 test school') RETURNING id
  `
  return yield* withSchool(
    school.id,
    Effect.gen(function*() {
      const teacherPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${teacherPersonId}, 'Samira', 'Teacher', '1985-01-01')
      `
      const studentPersonId = yield* randomUUID
      yield* sql`
        INSERT INTO persons (id, first_name, last_name, date_of_birth)
        VALUES (${studentPersonId}, 'Nadia', 'Student', '2010-01-01')
      `
      return yield* use({ schoolId: school.id, teacherPersonId, studentPersonId })
    })
  )
}, Effect.provide(Layer.mergeAll(AppSqlLive, NodeCrypto.layer)))

describe("Commendation (ticket #106)", () => {
  it.effect("a teacher can record a commendation for a student directly, no investigation step", () =>
    withCommendationFixture(({ schoolId, studentPersonId, teacherPersonId }) =>
      Effect.gen(function*() {
        const commendation = yield* recordCommendation(
          schoolId,
          studentPersonId,
          "Academic excellence",
          "Top of class in mathematics",
          "2020-09-15",
          teacherPersonId
        ).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))
        expect(commendation.category).toBe("Academic excellence")
      })
    ))

  it.effect("a teacher from a different school cannot record a commendation", () =>
    withCommendationFixture(({ schoolId, studentPersonId, teacherPersonId }) =>
      Effect.gen(function*() {
        const result = yield* Effect.result(
          recordCommendation(
            schoolId,
            studentPersonId,
            "Academic excellence",
            "Top of class",
            "2020-09-15",
            teacherPersonId
          ).pipe(Effect.provide(asTeacherOfDifferentSchool(teacherPersonId)))
        )
        expect(Result.isFailure(result)).toBe(true)
      })
    ))

  it.effect("a recorded commendation is findable for the student", () =>
    withCommendationFixture(({ schoolId, studentPersonId, teacherPersonId }) =>
      Effect.gen(function*() {
        yield* recordCommendation(
          schoolId,
          studentPersonId,
          "Sportsmanship",
          "Helped a teammate up",
          "2020-09-16",
          teacherPersonId
        ).pipe(Effect.provide(asTeacher(schoolId, teacherPersonId)))

        const commendations = yield* findCommendationsForStudent(schoolId, studentPersonId)
        expect(commendations).toHaveLength(1)
        expect(commendations[0].category).toBe("Sportsmanship")
      })
    ))
})
