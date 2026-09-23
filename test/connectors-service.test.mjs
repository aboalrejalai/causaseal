import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"

const statePath = path.join(
  os.tmpdir(),
  `causaseal-connectors-${process.pid}-${Date.now()}.json`
)
process.env.CAUSASEAL_STATE_PATH = statePath

const { resetPersistCache } = await import("../engine/persist.mjs")
resetPersistCache()
const { resetTelemetryCache } = await import("../engine/telemetry.mjs")
resetTelemetryCache()

const {
  assertOrgId,
  ORG_ID_ERROR,
  DEFAULT_ORG,
  paginate,
  interceptTool,
  listFingerprintsPage,
} = await import("../connectors/service.mjs")
const { LOOKALIKE, MUTATED_LEAK, NOVEL_LEAK } = await import(
  "../engine/fixtures/novel-leak.mjs"
)

test.after(() => {
  try {
    fs.unlinkSync(statePath)
  } catch {
    /* ignore */
  }
})

test("assertOrgId defaults and rejects bad ids", () => {
  assert.equal(assertOrgId(undefined), DEFAULT_ORG)
  assert.equal(assertOrgId(""), DEFAULT_ORG)
  assert.equal(assertOrgId("partner_1"), "partner_1")
  assert.throws(() => assertOrgId("bad id"), (err) => {
    assert.equal(err.message, ORG_ID_ERROR)
    return true
  })
})

test("paginate returns metadata", () => {
  const page = paginate(["a", "b", "c"], 1, 0)
  assert.equal(page.total_count, 3)
  assert.equal(page.count, 1)
  assert.equal(page.has_more, true)
  assert.equal(page.next_offset, 1)
  assert.deepEqual(page.items, ["a"])
  const page2 = paginate(["a", "b", "c"], 1, 1)
  assert.deepEqual(page2.items, ["b"])
})

test("mutated leak: harness ALLOW, fingerprint INTERVENE, no original", async () => {
  const out = await interceptTool({ ...MUTATED_LEAK, orgId: "diff-row" })
  assert.equal(out.harness, "ALLOW")
  assert.equal(out.decision, "INTERVENE")
  assert.equal(out.sendOriginal, false)
  assert.ok(out.redactedBody)
  assert.equal(out.redactedBody.sensitiveData, false)
})

test("lookalike: harness ALLOW, decision ALLOW", async () => {
  const out = await interceptTool({ ...LOOKALIKE, orgId: "lookalike-row" })
  assert.equal(out.harness, "ALLOW")
  assert.equal(out.decision, "ALLOW")
  assert.equal(out.sendOriginal, true)
})

test("novel leak: harness BLOCK, decision INTERVENE", async () => {
  const out = await interceptTool({ ...NOVEL_LEAK, orgId: "novel-row" })
  assert.equal(out.harness, "BLOCK")
  assert.equal(out.decision, "INTERVENE")
  assert.equal(out.sendOriginal, false)
})

test("list fingerprints paginates seeds", () => {
  const page = listFingerprintsPage({ orgId: "demo", limit: 1, offset: 0 })
  assert.ok(page.total_count >= 3)
  assert.equal(page.has_more, true)
  assert.equal(page.next_offset, 1)
  assert.equal(page.count, 1)
  const page2 = listFingerprintsPage({ orgId: "demo", limit: 1, offset: 1 })
  assert.equal(page2.count, 1)
})
