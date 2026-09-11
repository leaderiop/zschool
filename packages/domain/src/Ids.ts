import * as Brand from "effect/Brand"

/**
 * Compile-time-only identifier types (`Brand.nominal`, zero runtime check —
 * these values still flow through the database as plain strings). Distinct
 * types here catch a call site passing the wrong kind of id where the
 * previous plain-`string` signatures could not — e.g. a guardian and a
 * student person id sitting side by side in `recordGuardianRelationship`.
 */

export type SchoolId = Brand.Branded<string, "SchoolId">
export const SchoolId = Brand.nominal<SchoolId>()

export type ClassId = Brand.Branded<string, "ClassId">
export const ClassId = Brand.nominal<ClassId>()

export type LevelId = Brand.Branded<string, "LevelId">
export const LevelId = Brand.nominal<LevelId>()

export type TrackId = Brand.Branded<string, "TrackId">
export const TrackId = Brand.nominal<TrackId>()

export type GuardianPersonId = Brand.Branded<string, "GuardianPersonId">
export const GuardianPersonId = Brand.nominal<GuardianPersonId>()

export type StudentPersonId = Brand.Branded<string, "StudentPersonId">
export const StudentPersonId = Brand.nominal<StudentPersonId>()
