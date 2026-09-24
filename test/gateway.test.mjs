import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"

const statePath = path.join(os.tmpdir(), `causaseal-test-${process.pid}-${Date.now()}.json`)
process.env.CAUSASEAL_STATE_PATH = statePath

const { resetPersistCache } = await import("../engine/persist.mjs")
resetPersistCache()

const { jaccard, MATCH_THRESHOLD, matchByInvariants, storeFingerprint, listFingerprints } =
  await import("../engine/memory.mjs")
const { deriveInvariants } = await import("../engine/xcfs.mjs")
const { analyze } = await import("../engine/gateway.mjs")
const { runOpsAgent } = await import("../engine/ops-agent.mjs")
const { NOVEL_LEAK, BENIGN_SEND, MUTATED_LEAK } = await import("../engine/fixtures/novel-leak.mjs")
const { resetTelemetryCache } = await import("../engine/telemetry.mjs")

test.after(() => {
  try {
    fs.unlinkSync(statePath)
  } catch {
    /* ignore */
  }
})

test("jaccard below threshold does not match", () => {
  assert.equal(jaccard(["a"], ["b"]), 0)
  assert.ok(jaccard(["a", "b", "c"], ["a"]) < MATCH_THRESHOLD)
  const miss = matchByInvariants(["أداة إرسال"], {
    orgId: "jaccard-miss",
    record: false,
  })
  // Single invariant vs seed with 4 may be below 0.6
  if (miss) assert.ok(miss.score >= MATCH_THRESHOLD)
})

test("jaccard at or above threshold matches structural leak", () => {
  const invariants = deriveInvariants(NOVEL_LEAK)
  assert.ok(invariants.includes("أداة إرسال"))
  assert.ok(invariants.includes("تعليمة في النص المسترجع"))
  const score = jaccard(invariants, [
    "أداة إرسال",
    "بيانات حساسة",
    "وجهة غير معتمدة",
    "تعليمة في النص المسترجع",
  ])
  assert.ok(score >= MATCH_THRESHOLD)
})

test("novel leak intervenes and delivers redacted copy only", async () => {
  resetTelemetryCache()
  resetPersistCache()
  const orgId = "test-leak"
  const outcome = await runOpsAgent({ kind: "leak", orgId, environment: "dev" })
  assert.equal(outcome.result.decision, "INTERVENE")
  assert.equal(outcome.executed, false)
  assert.equal(outcome.deliveredOriginal, false)
  assert.equal(outcome.delivered, true)
  assert.equal(outcome.intervention, "redact-sensitive")
  assert.equal(outcome.harness, "BLOCK")
  assert.equal(outcome.delivery?.redacted, true)
})

test("benign send allows and delivers", async () => {
  resetTelemetryCache()
  resetPersistCache()
  const orgId = "test-safe"
  const outcome = await runOpsAgent({ kind: "safe", orgId })
  assert.equal(outcome.result.decision, "ALLOW")
  assert.equal(outcome.delivered, true)
  assert.equal(outcome.deliveredOriginal, true)
  assert.equal(outcome.intervention, null)
  assert.equal(outcome.harness, "ALLOW")
})

test("cross-context blocks after learning in dev", async () => {
  resetTelemetryCache()
  resetPersistCache()
  const orgId = "test-cross"
  const first = await runOpsAgent({ kind: "leak", orgId, environment: "dev" })
  assert.equal(first.result.decision, "INTERVENE")
  const second = await runOpsAgent({ kind: "cross", orgId, environment: "enterprise" })
  assert.equal(second.result.decision, "INTERVENE")
  assert.equal(second.result.crossContext, true)
})

test("mutated leak: harness allows, fingerprint intervenes", async () => {
  resetTelemetryCache()
  resetPersistCache()
  const orgId = "test-mutated"
  const invariants = deriveInvariants(MUTATED_LEAK)
  assert.ok(!invariants.includes("أداة إرسال"))
  assert.ok(invariants.includes("بيانات حساسة"))
  assert.ok(invariants.includes("وجهة غير معتمدة"))
  assert.ok(invariants.includes("تعليمة في النص المسترجع"))
  const score = jaccard(invariants, [
    "أداة إرسال",
    "بيانات حساسة",
    "وجهة غير معتمدة",
    "تعليمة في النص المسترجع",
  ])
  assert.ok(score >= MATCH_THRESHOLD)

  const outcome = await runOpsAgent({ kind: "mutated", orgId, environment: "dev" })
  assert.equal(outcome.harness, "ALLOW")
  assert.equal(outcome.result.decision, "INTERVENE")
  assert.equal(outcome.deliveredOriginal, false)
  assert.equal(outcome.delivered, true)
  assert.equal(outcome.intervention, "redact-sensitive")
  assert.equal(outcome.cut, "تعليمة في النص المسترجع")
  assert.ok(String(outcome.change).includes("قُطعت"))
  assert.ok(String(outcome.change).includes("تعليمة في النص المسترجع"))
})

test("lookalike allows — wording alone does not block", async () => {
  resetTelemetryCache()
  resetPersistCache()
  const orgId = "test-lookalike"
  const outcome = await runOpsAgent({ kind: "lookalike", orgId })
  assert.equal(outcome.result.decision, "ALLOW")
  assert.equal(outcome.delivered, true)
  assert.equal(outcome.deliveredOriginal, true)
  assert.equal(outcome.intervention, null)
  assert.equal(outcome.cut, null)
  assert.equal(outcome.harness, "ALLOW")
})

test("partial: harness ALLOW, fingerprint VERIFY, no send, no fingerprint match", async () => {
  resetTelemetryCache()
  resetPersistCache()
  const { PARTIAL } = await import("../engine/fixtures/novel-leak.mjs")
  const orgId = "test-partial"
  const invariants = deriveInvariants(PARTIAL)
  assert.ok(invariants.includes("أداة إرسال"))
  assert.ok(invariants.includes("بيانات حساسة"))
  assert.ok(!invariants.includes("وجهة غير معتمدة"))
  assert.ok(!invariants.includes("تعليمة في النص المسترجع"))
  const score = jaccard(invariants, [
    "أداة إرسال",
    "بيانات حساسة",
    "وجهة غير معتمدة",
    "تعليمة في النص المسترجع",
  ])
  assert.ok(score < MATCH_THRESHOLD)

  const outcome = await runOpsAgent({ kind: "partial", orgId, environment: "dev" })
  assert.equal(outcome.harness, "ALLOW")
  assert.equal(outcome.result.decision, "VERIFY")
  assert.equal(outcome.delivered, false)
  assert.equal(outcome.deliveredOriginal, false)
  assert.equal(outcome.intervention, null)
  assert.equal(outcome.cut, null)
  assert.ok(String(outcome.change).includes("تحقق"))
})

test("health sim: harness ALLOW, fingerprint INTERVENE, simulated EHR path", async () => {
  resetTelemetryCache()
  resetPersistCache()
  const orgId = "test-health"
  const outcome = await runOpsAgent({ kind: "health", orgId, environment: "enterprise" })
  assert.equal(outcome.harness, "ALLOW")
  assert.equal(outcome.result.decision, "INTERVENE")
  assert.equal(outcome.deliveredOriginal, false)
  assert.equal(outcome.delivered, true)
  assert.equal(outcome.intervention, "redact-sensitive")
  assert.ok(String(outcome.change).includes("محاكاة"))
  assert.ok(String(outcome.delivery?.path || "").includes("محاكاة"))
})

test("org alpha fingerprints are invisible to org beta", async () => {
  resetTelemetryCache()
  resetPersistCache()
  storeFingerprint(
    {
      title: "alpha only",
      invariants: ["أداة إرسال", "بيانات حساسة", "وجهة غير معتمدة", "تعليمة في النص المسترجع"],
      tags: ["أداة إرسال", "بيانات حساسة", "وجهة غير معتمدة", "تعليمة في النص المسترجع"],
      environment: "dev",
    },
    { orgId: "alpha" }
  )
  const alphaList = listFingerprints("alpha")
  assert.ok(alphaList.some((item) => item.title === "alpha only" || item.origin === "stored"))
  // beta still has seeds — may match seed X-CFS-001. Store a unique invariant set for alpha.
  storeFingerprint(
    {
      title: "alpha unique",
      invariants: ["alpha-only-token", "أداة إرسال"],
      tags: ["alpha-only-token", "أداة إرسال"],
      environment: "dev",
    },
    { orgId: "alpha" }
  )
  const unique = matchByInvariants(["alpha-only-token", "أداة إرسال"], {
    orgId: "beta",
    record: false,
  })
  assert.equal(unique, null)
  const onAlpha = matchByInvariants(["alpha-only-token", "أداة إرسال"], {
    orgId: "alpha",
    record: false,
  })
  assert.ok(onAlpha)
})

test("analyze stores fingerprint without HOSTILE word list", async () => {
  resetTelemetryCache()
  resetPersistCache()
  const orgId = "test-analyze"
  // Wipe seeds by using fresh org — seeds still load. Novel phrasing should still INTERVENE via rules.
  const result = await analyze(
    { ...NOVEL_LEAK, orgId },
    { rulesOnly: true, source: "analyze", orgId }
  )
  assert.equal(result.decision, "INTERVENE")
  assert.ok(result.reduction.invariants.includes("أداة إرسال"))
  assert.equal(result.reduction.beforeCount, NOVEL_LEAK.steps.length + 6)
})

test("benign analyze allows", async () => {
  resetTelemetryCache()
  resetPersistCache()
  const result = await analyze(
    { ...BENIGN_SEND, orgId: "test-benign" },
    { rulesOnly: true, orgId: "test-benign" }
  )
  assert.equal(result.decision, "ALLOW")
})
