import { qadiTestLayer, subjectWith } from "@qadi/testing"

/**
 * The `@qadi` subject layer for "acting as the director of this school" —
 * shared across every Feature so a scenario only ever authorizes as the one
 * role the domain actually requires here (`ADR-ZS-096`), instead of each
 * `.steps.test.ts` file redefining the same subject shape independently.
 */
export const asDirectorOf = (schoolId: string) =>
  qadiTestLayer(subjectWith({ roles: ["director"], attributes: { school_id: schoolId } }))
