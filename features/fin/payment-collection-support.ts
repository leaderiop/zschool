import { SqlLive, withSchool } from "@zschool/db"
import {
  addFeeItem,
  attachGuardianProfile,
  createFeeSchedule,
  createPerson,
  designateFinancialGuardian,
  GuardianPersonId,
  GuardianQualitiesSchema,
  insertEnrollment,
  recordGuardianRelationship,
  StudentPersonId
} from "@zschool/domain"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { asDirectorOf } from "../support/layers/auth.ts"

/** Same reasoning as `fr-fin-04-sibling-discount.steps.test.ts`'s own `asOwner` — every seeding query here runs as the migration-time superuser, never the RLS/@qadi-gated app role a Scenario's real steps exercise. */
export const asOwner = <A, E>(effect: Effect.Effect<A, E, SqlClient>): Effect.Effect<A> =>
  effect.pipe(Effect.provide(SqlLive), Effect.orDie)

export const TUITION_AMOUNT_MAD = 1200

/**
 * A fresh mobile number per call, from a block no other `.steps.test.ts` or
 * `.test.ts` file in this repo uses (`+212700000001`..`0099` and the
 * `+2126...` block are already claimed elsewhere) — every `.steps.test.ts`
 * file shares ONE testcontainers Postgres for the whole `bdd` run, and
 * `find_guardian_by_mobile` matches globally across tenants (ADR-ZS-050/108),
 * so reusing a number causes real cross-scenario bleed, not just a harmless
 * duplicate insert (this exact bug hit ticket #56's own CI run).
 */
let nextMobileNumberOffset = 101
const nextMobileNumber = (): string => `+212700${String(nextMobileNumberOffset++).padStart(6, "0")}`

/**
 * Shared by every `fr-fin-{07,10,13,17,30}` scenario (ticket #59): a school
 * with a monthly-tuition fee schedule, one enrolled student whose enrollment
 * activates on `effectiveDate` (so its first installment is due that same
 * day — every scenario in this ticket's scope needs an already-due
 * installment to collect against, never a future one), and a financial
 * guardian designated on the resulting account.
 */
export const seedStudentWithDueInstallment = (
  studentName: string,
  guardianName: string,
  effectiveDate = "2026-09-01"
) =>
  asOwner(Effect.gen(function*() {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`
      INSERT INTO schools (name) VALUES ('Payment collection feature school') RETURNING id
    `
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
        const [cls] = yield* sql<{ id: string }>`
          INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
          VALUES (${school.id}, ${year.id}, ${level.id}, '6AP-1', 30) RETURNING id
        `

        const feeScheduleId = yield* createFeeSchedule({
          schoolId: school.id,
          academicYearId: year.id,
          levelId: level.id
        }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

        yield* addFeeItem({
          schoolId: school.id,
          feeScheduleId,
          nature: "tuition",
          labelFr: "Scolarité",
          labelAr: "الرسوم الدراسية",
          frequency: "monthly",
          amountMad: TUITION_AMOUNT_MAD,
          isMandatory: true
        }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

        const studentPersonId = yield* sql<{ id: string }>`
          INSERT INTO persons (id, first_name, last_name, date_of_birth)
          VALUES (gen_random_uuid(), ${studentName}, 'Student', '2015-01-01') RETURNING id
        `.pipe(Effect.map((rows) => rows[0].id))

        const guardianPersonId = yield* createPerson({
          firstName: guardianName,
          lastName: "Guardian",
          dateOfBirth: "1980-01-01"
        }).pipe(Effect.orDie)
        yield* attachGuardianProfile(guardianPersonId, nextMobileNumber()).pipe(Effect.orDie)
        const qualities = yield* Schema.decodeEffect(GuardianQualitiesSchema)({
          relationshipType: "father",
          isLegalGuardian: true,
          isFinancialGuardian: true,
          isCustodialGuardian: true,
          isEmergencyContact: true,
          isAuthorizedForPickup: true
        }).pipe(Effect.orDie)
        yield* recordGuardianRelationship(
          GuardianPersonId.make(guardianPersonId),
          StudentPersonId.make(studentPersonId),
          qualities
        ).pipe(Effect.orDie)

        const enrollment = yield* insertEnrollment({
          schoolId: school.id,
          academicYearId: year.id,
          studentPersonId,
          classId: cls.id,
          effectiveDate,
          hasLegalGuardian: true,
          hasFinancialGuardian: true
        }).pipe(Effect.orDie)

        yield* designateFinancialGuardian(school.id, enrollment.id, guardianPersonId).pipe(
          Effect.provide(asDirectorOf(school.id)),
          Effect.orDie
        )

        const [financialAccount] = yield* sql<{ id: string }>`
          SELECT id FROM financial_accounts WHERE enrollment_id = ${enrollment.id}
        `
        const [installment] = yield* sql<{ id: string }>`
          SELECT id FROM installments WHERE financial_account_id = ${financialAccount.id} ORDER BY due_date ASC LIMIT 1
        `

        return {
          schoolId: school.id,
          enrollmentId: enrollment.id,
          studentPersonId,
          guardianPersonId,
          financialAccountId: financialAccount.id,
          installmentId: installment.id
        }
      })
    )
  }))

/**
 * `fr-fin-30-family-payment.feature` (BEH-ZS-180): one guardian, several
 * children, each on their OWN level (and so their own `FeeSchedule`) so each
 * can carry a different tuition amount — a single fee schedule can't produce
 * two different amounts for the same nature, and the scenario's own numbers
 * (1,200 DH / 1,000 DH) require exactly that.
 */
export const seedFamilyWithDueInstallments = (
  guardianName: string,
  children: ReadonlyArray<{ readonly name: string; readonly tuitionAmountMad: number }>,
  effectiveDate = "2026-10-01"
) =>
  asOwner(Effect.gen(function*() {
    const sql = yield* SqlClient
    const [school] = yield* sql<{ id: string }>`
      INSERT INTO schools (name) VALUES ('Family payment feature school') RETURNING id
    `
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

        const guardianPersonId = yield* createPerson({
          firstName: guardianName,
          lastName: "Guardian",
          dateOfBirth: "1980-01-01"
        }).pipe(Effect.orDie)
        yield* attachGuardianProfile(guardianPersonId, nextMobileNumber()).pipe(Effect.orDie)

        const seededChildren: Array<
          { name: string; enrollmentId: string; financialAccountId: string; installmentId: string }
        > = []
        for (let i = 0; i < children.length; i++) {
          const child = children[i]
          const [level] = yield* sql<{ id: string }>`
            INSERT INTO levels (school_id, academic_year_id, cycle_id, code, name, sort_order)
            VALUES (${school.id}, ${year.id}, ${cycle.id}, ${`L${i}`}, ${`Level ${i}`}, ${i + 1}) RETURNING id
          `
          const [cls] = yield* sql<{ id: string }>`
            INSERT INTO classes (school_id, academic_year_id, level_id, label, capacity)
            VALUES (${school.id}, ${year.id}, ${level.id}, ${`L${i}-1`}, 30) RETURNING id
          `
          const feeScheduleId = yield* createFeeSchedule({
            schoolId: school.id,
            academicYearId: year.id,
            levelId: level.id
          }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)
          yield* addFeeItem({
            schoolId: school.id,
            feeScheduleId,
            nature: "tuition",
            labelFr: "Scolarité",
            labelAr: "الرسوم الدراسية",
            frequency: "monthly",
            amountMad: child.tuitionAmountMad,
            isMandatory: true
          }).pipe(Effect.provide(asDirectorOf(school.id)), Effect.orDie)

          const studentPersonId = yield* sql<{ id: string }>`
            INSERT INTO persons (id, first_name, last_name, date_of_birth)
            VALUES (gen_random_uuid(), ${child.name}, 'Student', '2015-01-01') RETURNING id
          `.pipe(Effect.map((rows) => rows[0].id))

          const qualities = yield* Schema.decodeEffect(GuardianQualitiesSchema)({
            relationshipType: "father",
            isLegalGuardian: true,
            isFinancialGuardian: true,
            isCustodialGuardian: true,
            isEmergencyContact: true,
            isAuthorizedForPickup: true
          }).pipe(Effect.orDie)
          yield* recordGuardianRelationship(
            GuardianPersonId.make(guardianPersonId),
            StudentPersonId.make(studentPersonId),
            qualities
          ).pipe(Effect.orDie)

          const enrollment = yield* insertEnrollment({
            schoolId: school.id,
            academicYearId: year.id,
            studentPersonId,
            classId: cls.id,
            effectiveDate,
            hasLegalGuardian: true,
            hasFinancialGuardian: true
          }).pipe(Effect.orDie)

          yield* designateFinancialGuardian(school.id, enrollment.id, guardianPersonId).pipe(
            Effect.provide(asDirectorOf(school.id)),
            Effect.orDie
          )

          const [financialAccount] = yield* sql<{ id: string }>`
            SELECT id FROM financial_accounts WHERE enrollment_id = ${enrollment.id}
          `
          const [installment] = yield* sql<{ id: string }>`
            SELECT id FROM installments WHERE financial_account_id = ${financialAccount.id} ORDER BY due_date ASC LIMIT 1
          `

          seededChildren.push({
            name: child.name,
            enrollmentId: enrollment.id,
            financialAccountId: financialAccount.id,
            installmentId: installment.id
          })
        }

        return { schoolId: school.id, guardianPersonId, children: seededChildren }
      })
    )
  }))
