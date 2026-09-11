import { describe, expect, it } from "@effect/vitest"
import * as Result from "effect/Result"
import { decodeClassImportRow } from "./ClassImportAnalysis.ts"

const validRow = { levelCode: "1AC", label: "1AC-1", capacity: 30 }

describe("decodeClassImportRow", () => {
  it("accepts a well-formed row", () => {
    const result = decodeClassImportRow(validRow)
    expect(Result.isSuccess(result)).toBe(true)
    expect(Result.getOrThrow(result)).toEqual(validRow)
  })

  it("accepts a row with a trackCode", () => {
    const result = decodeClassImportRow({ ...validRow, trackCode: "SVT" })
    expect(Result.isSuccess(result)).toBe(true)
  })

  it("rejects a zero capacity with a specific reason", () => {
    const result = decodeClassImportRow({ ...validRow, capacity: 0 })
    expect(Result.isFailure(result)).toBe(true)
    if (Result.isFailure(result)) {
      expect(result.failure.message.length).toBeGreaterThan(0)
      expect(result.failure.message).toContain("capacity")
    }
  })

  it("rejects a negative capacity", () => {
    const result = decodeClassImportRow({ ...validRow, capacity: -5 })
    expect(Result.isFailure(result)).toBe(true)
  })

  it("rejects a non-integer capacity", () => {
    const result = decodeClassImportRow({ ...validRow, capacity: 1.5 })
    expect(Result.isFailure(result)).toBe(true)
  })

  it("rejects an empty label with a specific reason", () => {
    const result = decodeClassImportRow({ ...validRow, label: "" })
    expect(Result.isFailure(result)).toBe(true)
    if (Result.isFailure(result)) {
      expect(result.failure.message).toContain("label")
    }
  })

  it("rejects an empty levelCode", () => {
    const result = decodeClassImportRow({ ...validRow, levelCode: "" })
    expect(Result.isFailure(result)).toBe(true)
    if (Result.isFailure(result)) {
      expect(result.failure.message).toContain("levelCode")
    }
  })
})
