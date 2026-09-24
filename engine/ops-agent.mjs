/**
 * Operations agent — calls the causal gateway before a send tool.
 * On INTERVENE, deliver a redacted local copy (sensitive removed); original is not sent.
 */

import {
  BENIGN_SEND,
  HEALTH_LEAK,
  LOOKALIKE,
  MUTATED_LEAK,
  NOVEL_LEAK,
  PARTIAL,
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
 * Name the causal edge to sever on INTERVENE. Priority matches the demo story:
 * directive-in-retrieved is the classic indirect-injection edge; destination /
 * sensitive / privilege follow. "أداة إرسال" is the call shape, not the cut.
 * @param {string[]} [invariants]
 * @returns {string | null}
 */
export function causalCut(invariants = []) {
  const list = Array.isArray(invariants) ? invariants : []
  const priority = [
    "تعليمة في النص المسترجع",
    "وجهة غير معتمدة",
    "بيانات حساسة",
    "صلاحية مرتفعة",
  ]
  for (const name of priority) {
    if (list.includes(name)) return name
  }
  return null
}

/**
 * Strip sensitive payload for a safe local deliver. Shared with connectors.
 * Mentions the named cut when known so the judge sees what edge was severed.
 * @param {Record<string, unknown>} body
 * @param {{ cut?: string | null }} [meta]
 */
export function redactSensitive(body, meta = {}) {
  const cut = meta.cut ? String(meta.cut) : ""
  const redactedNote = cut
    ? `قُطعت: ${cut}. أُزيلت البيانات الحساسة؛ أُرسلت نسخة آمنة فقط.`
    : "أُزيلت البيانات الحساسة؛ أُرسلت نسخة آمنة فقط."
  return {
    ...body,
    sensitiveData: false,
    retrievedText: redactedNote,
    untrustedContent: redactedNote,
    redacted: true,
    ...(cut ? { cut } : {}),
  }
}

/**
 * Local outbox.
 * @param {Record<string, unknown>} body
 * @param {string} orgId
 * @param {{ redacted?: boolean, channel?: string }} [meta]
 */
function deliver(body, orgId, meta = {}) {
  const isRedacted = Boolean(meta.redacted || body.redacted)
  const channel = ["http", "mcp", "sdk"].includes(String(meta.channel))
    ? String(meta.channel)
    : "http"
  const path =
    body.simulatedTarget === "ehr-email"
      ? "نظام السجلات الصحية / بوابة البريد (محاكاة)"
      : "صندوق صادر محلي"
  const delivered = {
    time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
    agent: String(body.agent || "Operations Assistant"),
    tool: String(body.tool || "send_to_workspace"),
    path,
    status: "allowed",
    label: isRedacted ? "DELIVERED-REDACTED" : "DELIVERED",
    confidence: "—",
    delivered: true,
    source: "deliver",
    risky: false,
    redacted: isRedacted,
    environment: body.environment || "dev",
    orgId,
    channel,
  }
  recordEvent(delivered, { orgId })
  return delivered
}

/**
 * @param {{
 *   kind?: "leak" | "safe" | "cross" | "mutated" | "lookalike" | "health" | "partial",
 *   orgId?: string,
 *   environment?: string,
 *   body?: Record<string, unknown>,
 *   channel?: string,
 * }} [options]
 */
export async function runOpsAgent(options = {}) {
  const orgId = options.orgId || "demo"
  const kind = options.kind || "leak"
  const channel = ["http", "mcp", "sdk"].includes(String(options.channel))
    ? String(options.channel)
    : "http"

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
  } else if (kind === "health") {
    body = {
      ...HEALTH_LEAK,
      orgId,
      environment: options.environment || HEALTH_LEAK.environment,
    }
  } else if (kind === "partial") {
    body = {
      ...PARTIAL,
      orgId,
      environment: options.environment || PARTIAL.environment,
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
    channel,
  })

  const intervene = result.decision === "INTERVENE"
  const invariants = Array.isArray(result.reduction?.invariants)
    ? result.reduction.invariants
    : []
  /** @type {string | null} */
  const cut = intervene ? causalCut(invariants) : null
  /** @type {Record<string, unknown> | null} */
  let delivery = null
  /** @type {"redact-sensitive" | null} */
  let intervention = null
  let deliveredOriginal = false

  if (result.decision === "ALLOW") {
    delivery = deliver(body, orgId, { channel })
    deliveredOriginal = true
  } else if (intervene) {
    const redacted = redactSensitive(body, { cut })
    delivery = deliver(redacted, orgId, { redacted: true, channel })
    intervention = "redact-sensitive"
    deliveredOriginal = false
  }

  const cutPhrase = cut ? `قُطعت: ${cut}. ` : ""

  return {
    executed: false,
    delivered: Boolean(delivery),
    deliveredOriginal,
    intervention,
    cut,
    delivery,
    harness,
    result,
    orgId,
    kind,
    beneficiary:
      kind === "health"
        ? "فريق تشغيل الوكيل السريري (سيناريو محاكى)"
        : "فريق تشغيل الوكيل داخل المؤسسة",
    change: intervene
      ? kind === "health"
        ? `${cutPhrase}الأصل لم يُرسل إلى نظام السجلات الصحية (محاكاة)؛ أُرسلت نسخة محذوفة فقط`
        : `${cutPhrase}المهمة اكتملت بنسخة محذوفة؛ الأصل الحساس لم يُرسل`
      : result.decision === "VERIFY"
        ? "بداية جزئية — تحقق بشري؛ لم يُنفَّذ إرسال"
        : delivery
          ? kind === "health"
            ? "الإرسال للمحاكى (EHR/بريد) بعد السماح"
            : "الإرسال المحلي تم بعد السماح"
          : "لم يُنفَّذ إرسال",
  }
}
