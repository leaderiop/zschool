import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import { fixedHolidayDatesForYear, movableReligiousHolidays, publishedBreaksByYear } from "./CalendarTemplate.ts"
import { SchoolId } from "./Ids.ts"
import { authorized, EntityNotFoundError, requireOwnedRow } from "./Ownership.ts"

export class PeriodOverlapError extends Schema.TaggedError<PeriodOverlapError>()("PeriodOverlapError", {
  periodId: Schema.String,
  conflictingPeriodId: Schema.String
}) {}

const EvaluationPeriodRow = Schema.Struct({ id: Schema.String, academic_year_id: Schema.String })

/** `Schema.Class` instead of a plain interface (issue #34) — decoded once, at the start of the handler below. */
export class SetEvaluationPeriodDatesCommand
  extends Schema.Class<SetEvaluationPeriodDatesCommand>("SetEvaluationPeriodDatesCommand")({
    schoolId: SchoolId,
    academicYearId: Schema.String,
    periodId: Schema.String,
    startDate: Schema.String,
    endDate: Schema.String
  })
{}

export class AddSubPeriodCommand extends Schema.Class<AddSubPeriodCommand>("AddSubPeriodCommand")({
  schoolId: SchoolId,
  academicYearId: Schema.String,
  evaluationPeriodId: Schema.String,
  code: Schema.NonEmptyString,
  name: Schema.NonEmptyString,
  subPeriodType: Schema.Literals(["exam", "mock_exam", "standardized_test"]),
  startDate: Schema.String,
  endDate: Schema.String
}) {}

/**
 * BEH-ZS-054 / REQ-ZS-056: sets a period's dates, refusing an overlap with
 * any other period in the same academic year (fr-ped-04's "Overlapping
 * periods refused" scenario) rather than silently accepting inconsistent
 * dates.
 */
export const setEvaluationPeriodDates = Effect.fn("Calendar.setEvaluationPeriodDates")(function*(
  rawCommand: (typeof SetEvaluationPeriodDatesCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(SetEvaluationPeriodDatesCommand)(rawCommand)
  return yield* authorized(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        // Trust the period's own `academic_year_id`, not the caller-supplied
        // one, for the overlap search — a stale/mismatched `academicYearId`
        // alongside a valid `periodId` must not search the wrong year and
        // find zero conflicts.
        const period = yield* requireOwnedRow(
          sql,
          "evaluation_periods",
          "evaluation_period",
          command.periodId,
          command.schoolId,
          EvaluationPeriodRow,
          "id, academic_year_id"
        )

        const overlapping = yield* sql<{ id: string }>`
          SELECT id FROM evaluation_periods
          WHERE academic_year_id = ${period.academic_year_id} AND id != ${command.periodId}
            AND start_date IS NOT NULL AND end_date IS NOT NULL
            AND start_date <= ${command.endDate} AND end_date >= ${command.startDate}
        `
        if (overlapping.length > 0) {
          return yield* Effect.fail(
            new PeriodOverlapError({ periodId: command.periodId, conflictingPeriodId: overlapping[0].id })
          )
        }

        yield* sql`
          UPDATE evaluation_periods SET start_date = ${command.startDate}, end_date = ${command.endDate}
          WHERE id = ${command.periodId} AND school_id = ${command.schoolId}
        `
      })
    )
  )
})

/** BEH-ZS-054: a dated sub-period (exam, mock exam, standardized test) within an evaluation period. */
export const addSubPeriod = Effect.fn("Calendar.addSubPeriod")(function*(
  rawCommand: (typeof AddSubPeriodCommand)["Encoded"]
) {
  const command = yield* Schema.decodeEffect(AddSubPeriodCommand)(rawCommand)
  return yield* authorized(
    command.schoolId,
    withSchool(
      command.schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        // Insert the period's OWN academic_year_id, never the caller-supplied
        // one — a mismatched command.academicYearId must not create a row
        // whose evaluation_period_id and academic_year_id disagree.
        const period = yield* requireOwnedRow(
          sql,
          "evaluation_periods",
          "evaluation_period",
          command.evaluationPeriodId,
          command.schoolId,
          EvaluationPeriodRow,
          "id, academic_year_id"
        )

        const [row] = yield* sql<{ id: string }>`
          INSERT INTO evaluation_sub_periods
            (school_id, academic_year_id, evaluation_period_id, code, name, sub_period_type, start_date, end_date)
          VALUES (
            ${command.schoolId}, ${period.academic_year_id}, ${command.evaluationPeriodId},
            ${command.code}, ${command.name}, ${command.subPeriodType}, ${command.startDate}, ${command.endDate}
          )
          RETURNING id
        `
        return row.id
      })
    )
  )
})

/**
 * BEH-ZS-066 / REQ-ZS-064: preloads the ministry calendar for a newly
 * created academic year — fixed-date national holidays (computed), the
 * published break schedule (only for years the ministry has published,
 * `CalendarTemplate.ts`), and the movable religious holidays as
 * `to_confirm` placeholders with no date yet (OQ-ZS-068).
 *
 * Split from `preloadNationalCalendar` below so `InstantiateNationalTemplate.ts`
 * can seed the calendar from inside its OWN already-`authorized`/`withSchool`
 * scope at year-creation time, instead of nesting a second authorization
 * check and transaction inside the one it's already in.
 */
export const seedCalendarEvents = Effect.fn("Calendar.seedCalendarEvents")(function*(
  schoolId: string,
  academicYearId: string,
  academicYearLabel: string
) {
  const sql = yield* SqlClient
  const rows: Array<Record<string, unknown>> = []

  for (const holiday of fixedHolidayDatesForYear(academicYearLabel)) {
    rows.push({
      school_id: schoolId,
      academic_year_id: academicYearId,
      code: holiday.code,
      name: holiday.name,
      event_type: "holiday",
      is_movable: false,
      confirmation_status: "confirmed",
      start_date: holiday.date,
      end_date: holiday.date
    })
  }

  for (const brk of publishedBreaksByYear[academicYearLabel] ?? []) {
    rows.push({
      school_id: schoolId,
      academic_year_id: academicYearId,
      code: brk.code,
      name: brk.name,
      event_type: "break",
      is_movable: false,
      confirmation_status: "confirmed",
      start_date: brk.startDate,
      end_date: brk.endDate
    })
  }

  for (const holiday of movableReligiousHolidays) {
    rows.push({
      school_id: schoolId,
      academic_year_id: academicYearId,
      code: holiday.code,
      name: holiday.name,
      event_type: "holiday",
      is_movable: true,
      confirmation_status: "to_confirm",
      start_date: null,
      end_date: null
    })
  }

  if (rows.length > 0) {
    yield* sql`INSERT INTO calendar_events ${sql.insert(rows)}`
  }
})

/**
 * Public, standalone entry point for preloading a calendar outside of
 * `instantiateNationalTemplate` (e.g. a year created some other way). NOT
 * safe to call twice for the same year — `calendar_events` has a
 * `UNIQUE (academic_year_id, code)` constraint (migration 0004) and this
 * does no `ON CONFLICT` handling, so a second call fails with a raw
 * `SqlError` rather than silently no-oping.
 */
export const preloadNationalCalendar = Effect.fn("Calendar.preloadNationalCalendar")(function*(
  schoolId: string,
  academicYearId: string,
  academicYearLabel: string
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      seedCalendarEvents(schoolId, academicYearId, academicYearLabel)
    )
  )
})

/** Confirms a movable holiday's actual date once officially announced (OQ-ZS-068's confirmation mechanism is still open — this only records the date and flips the flag). */
export const confirmMovableHoliday = Effect.fn("Calendar.confirmMovableHoliday")(function*(
  schoolId: string,
  eventId: string,
  confirmedDate: string
) {
  const validSchoolId = yield* Schema.decodeEffect(SchoolId)(schoolId)
  return yield* authorized(
    validSchoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        // Only a movable, still-`to_confirm` event may be confirmed — a
        // fixed, already-confirmed holiday's dates must never be
        // overwritable through this call.
        const confirmable = yield* sql`
          SELECT id FROM calendar_events
          WHERE id = ${eventId} AND school_id = ${schoolId} AND is_movable AND confirmation_status = 'to_confirm'
        `
        if (confirmable.length === 0) {
          return yield* Effect.fail(new EntityNotFoundError({ entityType: "calendar_event", entityId: eventId }))
        }
        yield* sql`
          UPDATE calendar_events
          SET start_date = ${confirmedDate}, end_date = ${confirmedDate}, confirmation_status = 'confirmed'
          WHERE id = ${eventId} AND school_id = ${schoolId}
        `
      })
    )
  )
})
