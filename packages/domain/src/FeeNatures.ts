/**
 * `BEH-ZS-151`'s typed fee-line natures — split out of `FeeSchedule.ts` into
 * this dependency-free leaf module (ticket #58) purely so `SiblingDiscount.ts`
 * can reference the same closed vocabulary for `applies_to_natures` without
 * creating a module cycle: `FeeSchedule.ts` sits behind `AcademicTree.ts` ->
 * `Enrollment.ts` -> `SiblingDiscount.ts` in the import graph, so a direct
 * `SiblingDiscount.ts` -> `FeeSchedule.ts` import for this one constant would
 * close that cycle and leave `FEE_NATURES` `undefined` at the moment
 * `SiblingDiscount.ts`'s own `Model.Class` field definitions evaluate it —
 * this module has no imports of its own, so it can never be part of any
 * cycle. `FeeSchedule.ts` re-exports both names unchanged so no other file's
 * `import { FEE_NATURES } from "./FeeSchedule.ts"` needs to change.
 */
export const FEE_NATURES = [
  "registration",
  "re_enrollment",
  "tuition",
  "insurance",
  "transport",
  "canteen",
  "activities",
  "supplies",
  "textbooks",
  "uniform"
] as const

export type FeeNature = (typeof FEE_NATURES)[number]
