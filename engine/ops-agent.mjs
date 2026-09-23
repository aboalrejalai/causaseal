/**
 * Operations agent — calls the causal gateway before a send tool.
 * On INTERVENE, deliver a redacted local copy (sensitive removed); original is not sent.
 */

import {
  BENIGN_SEND,
  LOOKALIKE,
  MUTATED_LEAK,
  NOVEL_LEAK,
  novelLeakIn,
} from "./fixtures/novel-leak.mjs"
import { analyze } from "./gateway.mjs"
import { recordEvent } from "./telemetry.mjs"
import { SEND_TOOLS } from "./xcfs.mjs"

/**
 * Local tool-list harness: blocks this call only when the known send tool
 * carries sensitive data to an untrusted destination. No memory, no fingerprint.
 * @param {Record<string, unknown>} body
 * @returns {"ALLOW" | "BLOCK"}
 */
export function harnessDecision(body = {}) {
  const tool = String(body.tool || "")
  if (SEND_TOOLS.has(tool) && body.sensitiveData && body.trustedDestination === false) {
    return "BLOCK"
  }
  return "ALLOW"
}

/**
 * Strip sensitive payload for a safe local deliver. Shared with connectors.
 * @param {Record<string, unknown>} body
 */
export function redactSensitive(body) {
  const redactedNote = "أُزيلت البيانات الحساسة؛ أُرسلت نسخة آمنة فقط."
  return {
    ...body,
    sensitiveData: false,
    retrievedText: redactedNote,
    untrustedContent: redactedNote,
    redacted: true,
  }
}

/**
 * Local outbox.
 * @param {Record<string, unknown>} body
 * @param {string} orgId
 * @param {{ redacted?: boolean }} [meta]
 */
function deliver(body, orgId, meta = {}) {
  const isRedacted = Boolean(meta.redacted || body.redacted)
  const delivered = {
    time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
    agent: String(body.agent || "Operations Assistant"),
    tool: String(body.tool || "send_to_workspace"),
    path: "صندوق صادر محلي",
    status: "allowed",
    label: isRedacted ? "DELIVERED-REDACTED" : "DELIVERED",
    confidence: "—",
    delivered: true,
    source: "deliver",
    risky: false,
    redacted: isRedacted,
    environment: body.environment || "dev",
    orgId,
  }
  recordEvent(delivered, { orgId })
  return delivered
}

/**
 * @param {{
 *   kind?: "leak" | "safe" | "cross" | "mutated" | "lookalike",
 *   orgId?: string,
 *   environment?: string,
 *   body?: Record<string, unknown>,
 * }} [options]
 */
export async function runOpsAgent(options = {}) {
  const orgId = options.orgId || "demo"
  const kind = options.kind || "leak"

  /** @type {Record<string, unknown>} */
  let body
  if (options.body) {
    body = { ...options.body, orgId }
  } else if (kind === "safe") {
    body = { ...BENIGN_SEND, orgId, environment: options.environment || BENIGN_SEND.environment }
  } else if (kind === "cross") {
    body = { ...novelLeakIn(options.environment || "enterprise"), orgId }
  } else if (kind === "mutated") {
    body = {
      ...MUTATED_LEAK,
      orgId,
      environment: options.environment || MUTATED_LEAK.environment,
    }
  } else if (kind === "lookalike") {
    body = {
      ...LOOKALIKE,
      orgId,
      environment: options.environment || LOOKALIKE.environment,
    }
  } else {
    body = { ...NOVEL_LEAK, orgId, environment: options.environment || "dev" }
  }

  body.preferRules = true

  const harness = harnessDecision(body)

  const result = await analyze(body, {
    rulesOnly: true,
    source: "intercept",
    orgId,
  })

  const intervene = result.decision === "INTERVENE"
  /** @type {Record<string, unknown> | null} */
  let delivery = null
  /** @type {"redact-sensitive" | null} */
  let intervention = null
  let deliveredOriginal = false

  if (result.decision === "ALLOW") {
    delivery = deliver(body, orgId)
    deliveredOriginal = true
  } else if (intervene) {
    const redacted = redactSensitive(body)
    delivery = deliver(redacted, orgId, { redacted: true })
    intervention = "redact-sensitive"
    deliveredOriginal = false
  }

  return {
    executed: false,
    delivered: Boolean(delivery),
    deliveredOriginal,
    intervention,
    delivery,
    harness,
    result,
    orgId,
    kind,
    beneficiary: "فريق تشغيل الوكيل داخل المؤسسة",
    change: intervene
      ? "المهمة اكتملت بنسخة محذوفة؛ الأصل الحساس لم يُرسل"
      : delivery
        ? "الإرسال المحلي تم بعد السماح"
        : "لم يُنفَّذ إرسال",
  }
}
