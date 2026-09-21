/**
 * Operations agent — calls the causal gateway before a send tool.
 * On INTERVENE, deliver() is never called.
 */

import { BENIGN_SEND, NOVEL_LEAK, novelLeakIn } from "./fixtures/novel-leak.mjs"
import { analyze } from "./gateway.mjs"
import { recordEvent } from "./telemetry.mjs"

/**
 * Local outbox — only reached after ALLOW.
 * @param {Record<string, unknown>} body
 * @param {string} orgId
 */
function deliver(body, orgId) {
  const delivered = {
    time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
    agent: String(body.agent || "Operations Assistant"),
    tool: String(body.tool || "send_to_workspace"),
    path: "صندوق صادر محلي",
    status: "allowed",
    label: "DELIVERED",
    confidence: "—",
    delivered: true,
    source: "deliver",
    risky: false,
    environment: body.environment || "dev",
    orgId,
  }
  recordEvent(delivered, { orgId })
  return delivered
}

/**
 * @param {{
 *   kind?: "leak" | "safe" | "cross",
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
  } else {
    body = { ...NOVEL_LEAK, orgId, environment: options.environment || "dev" }
  }

  body.preferRules = true

  const result = await analyze(body, {
    rulesOnly: true,
    source: "intercept",
    orgId,
  })

  const intervene = result.decision === "INTERVENE"
  /** @type {Record<string, unknown> | null} */
  let delivery = null
  if (!intervene && result.decision === "ALLOW") {
    delivery = deliver(body, orgId)
  }

  return {
    executed: false,
    delivered: Boolean(delivery),
    delivery,
    result,
    orgId,
    kind,
    beneficiary: "فريق تشغيل الوكيل داخل المؤسسة",
    change: intervene
      ? "الإرسال الخارجي لم يتم"
      : delivery
        ? "الإرسال المحلي تم بعد السماح"
        : "لم يُنفَّذ إرسال",
  }
}
