import { NodeRuntime } from "@effect/platform-node"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { MigratorLive } from "./Migrator.ts"
import { SqlLive } from "./Sql.ts"

const program = Effect.gen(function*() {
  yield* Effect.log("Running pending migrations against DATABASE_URL")
  yield* Effect.log("Migrations applied")
}).pipe(Effect.withSpan("runMigrations"), Effect.provide(Layer.provide(MigratorLive, SqlLive)))

NodeRuntime.runMain(program)
