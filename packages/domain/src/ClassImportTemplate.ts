import * as Effect from "effect/Effect"
import ExcelJS from "exceljs"

/**
 * Ticket #8 acceptance criterion 1: "A bilingual Excel template with
 * instructions and an example row can be downloaded for the classes
 * domain." Two sheets — instructions (FR/AR side by side, matching how the
 * rest of the product presents bilingual copy) and the data sheet itself,
 * headers in both languages with one example row so a director sees the
 * expected shape before filling in real data.
 *
 * `exceljs` (pinned `4.4.0`, `spec/stack.md` §2) generates the buffer
 * in-memory (`workbook.xlsx.writeBuffer()`) — no filesystem access, so this
 * stays usable from a Lambda handler with no local disk.
 */
export const generateClassImportTemplate = Effect.fn("ClassImportTemplate.generateClassImportTemplate")(
  function*() {
    const workbook = new ExcelJS.Workbook()

    const instructions = workbook.addWorksheet("Instructions / تعليمات")
    instructions.columns = [{ width: 50 }, { width: 50 }]
    instructions.addRow(["Instructions (FR)", "تعليمات (AR)"]).font = { bold: true }
    instructions.addRow([
      "levelCode: the level's code (e.g. 6AP). trackCode: optional, only for a tracked level. "
      + "label: the class's name, unique within the level. capacity: a whole number greater than 0.",
      "levelCode: رمز المستوى (مثال: 6AP). trackCode: اختياري، فقط للمستوى المسلك. "
      + "label: اسم الفصل، فريد داخل المستوى. capacity: عدد صحيح أكبر من 0."
    ])

    const data = workbook.addWorksheet("Classes / الفصول")
    data.columns = [
      { header: "levelCode / رمز المستوى", key: "levelCode", width: 20 },
      { header: "trackCode / رمز المسلك", key: "trackCode", width: 20 },
      { header: "label / الاسم", key: "label", width: 20 },
      { header: "capacity / السعة", key: "capacity", width: 15 }
    ]
    data.getRow(1).font = { bold: true }
    data.addRow({ levelCode: "6AP", trackCode: "", label: "6AP-1", capacity: 30 })

    const buffer = yield* Effect.tryPromise(() => workbook.xlsx.writeBuffer())
    return new Uint8Array(buffer)
  }
)
