import * as Effect from "effect/Effect"
import { SqlClient } from "effect/unstable/sql/SqlClient"

/**
 * Enables RLS on `table` and installs the standard `tenant_isolation` policy
 * every school-scoped table in this schema carries (ADR-ZS-092). Shared
 * across every migration so a copy-pasted block can't typo the GUC name or
 * drop `FORCE` for one table without the reuse making that structurally
 * impossible instead of test-detected.
 */
export const applyTenantIsolation = (sql: SqlClient, table: string) =>
  Effect.gen(function*() {
    yield* sql`ALTER TABLE ${sql(table)} ENABLE ROW LEVEL SECURITY`
    yield* sql`ALTER TABLE ${sql(table)} FORCE ROW LEVEL SECURITY`
    yield* sql`
      CREATE POLICY tenant_isolation ON ${sql(table)}
        USING (school_id = current_setting('app.current_school_id', true)::uuid)
    `
  })

/**
 * For a table with no `school_id` of its own, keyed instead to a `persons`
 * row via `person_id` (ADR-ZS-107: `Person`, and anything hung off it, is
 * global — a school's visibility into it is derived, not owned). Visibility
 * is delegated entirely to `persons`' own `person_select` policy (migration
 * 0008) rather than duplicated here, so a future change to who may see a
 * Person doesn't need a matching edit in every profile table.
 *
 * INSERT is deliberately left unconditional (`WITH CHECK (true)`) rather
 * than reusing the SELECT predicate: at the moment a brand-new person's
 * profile row is created, no `Enrollment` linking that person to this school
 * exists yet — the same visibility check applied to INSERT would refuse the
 * very row that's supposed to become visible once the rest of the import
 * transaction (relationships, then the `Enrollment` itself) lands. Every
 * writer is `zschool_service`, already gated by `@qadi` before it reaches
 * SQL — RLS's job here is restricting cross-tenant reads, not creation.
 */
export const applyPersonScopedIsolation = (sql: SqlClient, table: string) =>
  Effect.gen(function*() {
    yield* sql`ALTER TABLE ${sql(table)} ENABLE ROW LEVEL SECURITY`
    yield* sql`ALTER TABLE ${sql(table)} FORCE ROW LEVEL SECURITY`
    yield* sql`
      CREATE POLICY person_scoped_select ON ${sql(table)}
        FOR SELECT
        USING (EXISTS (SELECT 1 FROM persons WHERE persons.id = ${sql(table)}.person_id))
    `
    yield* sql`
      CREATE POLICY person_scoped_insert ON ${sql(table)}
        FOR INSERT
        WITH CHECK (true)
    `
  })
