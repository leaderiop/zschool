/**
 * BEH-ZS-066: the preloaded ministry calendar. Fixed-date national holidays
 * are genuinely computable for any school year (they never move); the
 * school-break schedule and the Baccalaureate exam window are published by
 * the ministry one year at a time and are only known here for the
 * documented 2026-2027 example — a later year needs its own entry once
 * published, same as any other calendar the ministry hasn't issued yet.
 */

export interface FixedHoliday {
  readonly code: string
  readonly name: string
  readonly month: number
  readonly day: number
}

export interface MovableHoliday {
  readonly code: string
  readonly name: string
}

export interface DatedBreak {
  readonly code: string
  readonly name: string
  readonly startDate: string
  readonly endDate: string
}

/** Gregorian-dated, never move — safe to compute for any school year. */
export const fixedNationalHolidays: ReadonlyArray<FixedHoliday> = [
  { code: "NEW_YEAR", name: "New Year's Day", month: 1, day: 1 },
  { code: "INDEPENDENCE_MANIFESTO", name: "Anniversary of the Independence Manifesto", month: 1, day: 11 },
  { code: "LABOUR_DAY", name: "Labour Day", month: 5, day: 1 },
  { code: "THRONE_DAY", name: "Throne Day", month: 7, day: 30 },
  { code: "OUED_ED_DAHAB_DAY", name: "Oued Ed-Dahab Day", month: 8, day: 14 },
  { code: "REVOLUTION_DAY", name: "Revolution of the King and the People Day", month: 8, day: 20 },
  { code: "YOUTH_DAY", name: "Youth Day", month: 8, day: 21 },
  { code: "GREEN_MARCH_DAY", name: "Green March Day", month: 11, day: 6 },
  { code: "INDEPENDENCE_DAY", name: "Independence Day", month: 11, day: 18 }
]

/** Lunar-calendar dated — preloaded "to confirm" (OQ-ZS-068) until announced. */
export const movableReligiousHolidays: ReadonlyArray<MovableHoliday> = [
  { code: "RAMADAN_START", name: "Start of Ramadan" },
  { code: "EID_AL_FITR", name: "Eid al-Fitr" },
  { code: "EID_AL_ADHA", name: "Eid al-Adha" },
  { code: "MUHARRAM", name: "1st of Muharram" },
  { code: "MAWLID", name: "Mawlid" }
]

/** Published school-break schedules, by academic year label. Add the next year's entry once the ministry publishes it. */
export const publishedBreaksByYear: Readonly<Record<string, ReadonlyArray<DatedBreak>>> = {
  "2026-2027": [
    { code: "BREAK_1", name: "Autumn break", startDate: "2026-10-18", endDate: "2026-10-25" },
    { code: "BREAK_2", name: "Winter break", startDate: "2026-12-06", endDate: "2026-12-13" },
    { code: "MID_YEAR_BREAK", name: "Mid-year break", startDate: "2027-01-24", endDate: "2027-01-31" },
    { code: "BREAK_3", name: "Spring break", startDate: "2027-03-21", endDate: "2027-03-28" },
    { code: "BREAK_4", name: "May break", startDate: "2027-05-09", endDate: "2027-05-16" }
  ]
}

/**
 * The school year runs September (`startYear`) through August (`endYear`) —
 * a fixed holiday is included only if its Gregorian date actually falls in
 * that window, so e.g. New Year's Day (Jan 1) resolves to `endYear`, not
 * `startYear`.
 */
export const fixedHolidayDatesForYear = (
  academicYearLabel: string
): ReadonlyArray<{ code: string; name: string; date: string }> => {
  const [startYear, endYear] = academicYearLabel.split("-").map(Number)
  return fixedNationalHolidays.map((holiday) => {
    const year = holiday.month >= 9 ? startYear : endYear
    const date = `${year}-${String(holiday.month).padStart(2, "0")}-${String(holiday.day).padStart(2, "0")}`
    return { code: holiday.code, name: holiday.name, date }
  })
}
