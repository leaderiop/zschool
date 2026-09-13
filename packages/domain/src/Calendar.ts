import { withSchool } from "@zschool/db"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { SqlClient } from "effect/unstable/sql/SqlClient"
import * as SqlModel from "effect/unstable/sql/SqlModel"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { fixedHolidayDatesForYear, movableReligiousHolidays, publishedBreaksByYear } from "./CalendarTemplate.ts"
import { CalendarEventId, EvaluationPeriodId, EvaluationSubPeriodId, SchoolId } from "./Ids.ts"
import { optionalOnUpdate } from "./ModelVariants.ts"
import { authorized, EntityNotFoundError, requireOwnedRow, RowWithId } from "./Ownership.ts"

export class PeriodOverlapError extends Schema.TaggedError<PeriodOverlapError>()("PeriodOverlapError", {
  periodId: Schema.String,
  conflictingPeriodId: Schema.String
}) {}

const EvaluationPeriodRow = Schema.Struct({ id: Schema.String, academic_year_id: Schema.String })

/**
 * `Model.Class` for `evaluation_periods`/`evaluation_sub_periods`/
 * `calendar_events` (issue #41), matching migrations 0001/0004's DDL. Every
 * date column is a plain `Schema.String` (Postgres `date`, no time-of-day —
 * the audit confirmed this domain's plain-`date` handling is already correct
 * and deliberate; this migration doesn't introduce `DateTime` usage).
 *
 * None of these three tables has a natural single-column unique key besides
 * the surrogate `id` (`evaluation_periods`' `UNIQUE (section_id, code)` and
 * `evaluation_sub_periods`' `UNIQUE (evaluation_period_id, code)` are both
 * composite; `calendar_events`' `UNIQUE (academic_year_id, code)` likewise),
 * so `id` is each repository's `idColumn` and needs the same custom
 * `Model.Field` variant as `ComputationRule.id` (issue #36) / `Class.id`
 * (issue #39) rather than `Model.GeneratedByDb` — `makeRepository` requires
 * `idColumn` to be part of `update`'s Type regardless of whether `.update`
 * is ever actually called on a given repository (`EvaluationSubPeriod`'s
 * never is; `EvaluationPeriod`'s and `CalendarEvent`'s both are).
 */
export class EvaluationPeriod extends Model.Class<EvaluationPeriod>("EvaluationPeriod")({
  id: Model.Field({
    select: EvaluationPeriodId,
    update: EvaluationPeriodId,
    json: EvaluationPeriodId,
    jsonUpdate: EvaluationPeriodId
  }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  academic_year_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  section_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  code: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  name: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  sequence: Schema.Int.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  status: Schema.Literals(["upcoming", "in_progress", "closed"]).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  start_date: Schema.NullOr(Schema.String),
  end_date: Schema.NullOr(Schema.String),
  // Ticket #109 (BEH-ZS-112, migration 0035): a semester-based section sets
  // `massar_semester` directly on each of its own periods (no split ever
  // needed). A trimester section's T2 is the one period that can actually
  // split mid-way — `massar_semester_2_starts_at` carries that threshold
  // date only there; every other period leaves it null. Resolving a given
  // grade's date against this mapping is Massar export's own job (#118,
  // unbuilt) — this ticket only stores the mapping's shape. `optionalOnUpdate`
  // (not plain, unlike `start_date`/`end_date`) so `setEvaluationPeriodDates`'s
  // existing `repo.update({id, start_date, end_date})` call keeps working
  // without also having to touch these two unrelated fields.
  massar_semester: optionalOnUpdate(Schema.NullOr(Schema.Literals(["S1", "S2"]))),
  massar_semester_2_starts_at: optionalOnUpdate(Schema.NullOr(Schema.String))
}) {}

/** `evaluation_sub_periods` is insert-only from this file's perspective — no update path exists for it, unchanged by this ticket — but its repository's `idColumn` is still `"id"`, so it needs the same custom `Model.Field` treatment as `EvaluationPeriod.id` above. */
export class EvaluationSubPeriod extends Model.Class<EvaluationSubPeriod>("EvaluationSubPeriod")({
  id: Model.Field({
    select: EvaluationSubPeriodId,
    update: EvaluationSubPeriodId,
    json: EvaluationSubPeriodId,
    jsonUpdate: EvaluationSubPeriodId
  }),
  school_id: SchoolId,
  academic_year_id: Schema.String,
  evaluation_period_id: Schema.String,
  code: Schema.String,
  name: Schema.String,
  sub_period_type: Schema.Literals(["exam", "mock_exam", "standardized_test"]),
  start_date: Schema.String,
  end_date: Schema.String
}) {}

/**
 * `school_id`/`academic_year_id`/`code`/`name`/`event_type`/`is_movable` are
 * identity, fixed at creation — excluded from `update`/`jsonUpdate` the same
 * way `SubjectLevelConfig`'s identity columns are (issue #40), so
 * `confirmMovableHoliday`'s update payload can never accidentally carry one
 * of them. `confirmation_status`/`start_date`/`end_date` stay plain
 * (required on both `insert` and `update`): `seedCalendarEvents` always sets
 * all three on insert, and `confirmMovableHoliday` always sets all three
 * together on update, so neither side needs the `optionalOnUpdate` partial-
 * update treatment.
 */
export class CalendarEvent extends Model.Class<CalendarEvent>("CalendarEvent")({
  id: Model.Field({
    select: CalendarEventId,
    update: CalendarEventId,
    json: CalendarEventId,
    jsonUpdate: CalendarEventId
  }),
  school_id: SchoolId.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  academic_year_id: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  code: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  name: Schema.String.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  event_type: Schema.Literals(["holiday", "break"]).pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  is_movable: Schema.Boolean.pipe(Model.FieldExcept(["update", "jsonUpdate"])),
  confirmation_status: Schema.Literals(["confirmed", "to_confirm"]),
  start_date: Schema.NullOr(Schema.String),
  end_date: Schema.NullOr(Schema.String)
}) {}

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

const evaluationPeriodRepo = SqlModel.makeRepository(EvaluationPeriod, {
  tableName: "evaluation_periods",
  spanPrefix: "Calendar",
  idColumn: "id"
})
const evaluationSubPeriodRepo = SqlModel.makeRepository(EvaluationSubPeriod, {
  tableName: "evaluation_sub_periods",
  spanPrefix: "Calendar",
  idColumn: "id"
})
const calendarEventRepo = SqlModel.makeRepository(CalendarEvent, {
  tableName: "calendar_events",
  spanPrefix: "Calendar",
  idColumn: "id"
})

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

        const validPeriodId = yield* Schema.decodeEffect(EvaluationPeriodId)(command.periodId)
        const overlapping = yield* SqlSchema.findAll({
          Request: Schema.Struct({
            academicYearId: Schema.String,
            periodId: Schema.String,
            startDate: Schema.String,
            endDate: Schema.String
          }),
          Result: EvaluationPeriod,
          execute: (req) =>
            sql`
              SELECT * FROM evaluation_periods
              WHERE academic_year_id = ${req.academicYearId} AND id != ${req.periodId}
                AND start_date IS NOT NULL AND end_date IS NOT NULL
                AND start_date <= ${req.endDate} AND end_date >= ${req.startDate}
            `
        })({
          academicYearId: period.academic_year_id,
          periodId: command.periodId,
          startDate: command.startDate,
          endDate: command.endDate
        })
        if (overlapping.length > 0) {
          return yield* Effect.fail(
            new PeriodOverlapError({ periodId: command.periodId, conflictingPeriodId: overlapping[0].id })
          )
        }

        const repo = yield* evaluationPeriodRepo
        yield* repo.update({ id: validPeriodId, start_date: command.startDate, end_date: command.endDate })
      })
    )
  )
})

/**
 * BEH-ZS-112: sets one period's Massar-semester mapping — the default
 * one-to-one case (a semester-based section's own periods, or a trimester
 * section's T1/T3) leaves `massarSemester2StartsAt` null; T2, the one
 * period that actually splits mid-way, sets it to the ministry's own
 * semester-1 end date. Only the mapping's shape is stored here — resolving
 * a specific grade's date against it is Massar export's own job (#118).
 */
export const setMassarSemesterMapping = Effect.fn("Calendar.setMassarSemesterMapping")(function*(
  rawSchoolId: string,
  periodId: string,
  massarSemester: "S1" | "S2",
  massarSemester2StartsAt: string | null
) {
  const schoolId = yield* Schema.decodeEffect(SchoolId)(rawSchoolId)
  return yield* authorized(
    schoolId,
    withSchool(
      schoolId,
      Effect.gen(function*() {
        const sql = yield* SqlClient
        yield* requireOwnedRow(sql, "evaluation_periods", "evaluation_period", periodId, schoolId, RowWithId)

        // Raw SQL, not `evaluationPeriodRepo.update` — that repository's
        // `update` type requires every non-excluded field (`start_date`/
        // `end_date` included, per `SqlModel.makeRepository`'s single-row
        // update semantics), and this function only ever touches the two
        // Massar-mapping columns.
        yield* sql`
          UPDATE evaluation_periods
          SET massar_semester = ${massarSemester}, massar_semester_2_starts_at = ${massarSemester2StartsAt}
          WHERE id = ${periodId} AND school_id = ${schoolId}
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

        const repo = yield* evaluationSubPeriodRepo
        const subPeriod = yield* repo.insert({
          school_id: command.schoolId,
          academic_year_id: period.academic_year_id,
          evaluation_period_id: command.evaluationPeriodId,
          code: command.code,
          name: command.name,
          sub_period_type: command.subPeriodType,
          start_date: command.startDate,
          end_date: command.endDate
        })
        return subPeriod.id
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
 *
 * Still one batched `sql.insert` for the whole seed set, not N
 * `calendarEventRepo.insert` calls, for the same round-trip reason
 * `GradingScales.ts`'s `seedDefaultComputationRules` does — the row shape is
 * now checked against `CalendarEvent.insert`'s Encoded shape instead of an
 * untyped `Record<string, unknown>`.
 */
export const seedCalendarEvents = Effect.fn("Calendar.seedCalendarEvents")(function*(
  schoolId: string,
  academicYearId: string,
  academicYearLabel: string
) {
  const sql = yield* SqlClient
  const rows: Array<(typeof CalendarEvent)["insert"]["Encoded"]> = []

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
        const repo = yield* calendarEventRepo

        const notFound = () => Effect.fail(new EntityNotFoundError({ entityType: "calendar_event", entityId: eventId }))

        const validEventId = yield* Schema.decodeEffect(CalendarEventId)(eventId)
        const event = yield* repo.findById(validEventId).pipe(
          Effect.catchTag("NoSuchElementError", notFound)
        )
        // Only a movable, still-`to_confirm` event may be confirmed — a
        // fixed, already-confirmed holiday's dates must never be
        // overwritable through this call. `findById` only filters by `id`
        // (RLS is the sole backstop otherwise) — `school_id` is re-checked
        // explicitly here, per `Ownership.ts`'s own stated invariant that
        // every domain module scopes its lookups by `school_id` explicitly
        // rather than relying solely on RLS.
        if (event.school_id !== schoolId || !event.is_movable || event.confirmation_status !== "to_confirm") {
          return yield* notFound()
        }

        yield* repo.update({
          id: validEventId,
          confirmation_status: "confirmed",
          start_date: confirmedDate,
          end_date: confirmedDate
        })
      })
    )
  )
})
