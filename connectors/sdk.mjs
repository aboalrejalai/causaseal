/**
 * عميل الشريك لـ CAUSASEAL — يغلّف نداءً قبل أداة الإرسال داخل وكيلكم.
 * الرابط العام للتجربة (محكّم / Claude / ChatGPT / Cursor) هو MCP على /mcp.
 * هذا الملف SDK محلي داخل المستودع، غير منشور على npm، بلا مفتاح وبلا Authorization.
 */

import { redactSensitive } from "./service.mjs"

const DEFAULT_BASE = "http://127.0.0.1:4000"

/**
 * @param {Record<string, unknown>} incident
 * @param {{ baseUrl?: string, orgId?: string, authorization?: string, apiKey?: string }} [options]
 *   authorization و apiKey يُتجاهلان عمدًا — لا مفتاح في النموذج التجريبي.
 */
export async function beforeTool(incident = {}, options = {}) {
  const baseUrl = String(options.baseUrl || DEFAULT_BASE).replace(/\/$/, "")
  const orgId = options.orgId || incident.orgId || "demo"
  const url = `${baseUrl}/api/gateway/intercept`

  /** @type {Record<string, string>} */
  const headers = { "Content-Type": "application/json" }
  // عمدًا: لا نضع Authorization حتى لو مُرّر في options

  let response
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...incident, orgId, preferRules: true }),
    })
  } catch {
    throw new Error(
      `تعذر الوصول إلى CAUSASEAL على ${baseUrl}. تأكد أن server.js يعمل، ثم أعد المحاولة. لا مفتاح مطلوب.`
    )
  }

  if (!response.ok) {
    throw new Error(
      `تعذر الوصول إلى CAUSASEAL على ${baseUrl}. تأكد أن server.js يعمل، ثم أعد المحاولة. لا مفتاح مطلوب.`
    )
  }

  return /** @type {Promise<{ executed: false, result: { decision: string } }>} */ (
    response.json()
  )
}

/**
 * @param {Record<string, unknown>} incident
 * @param {{ result?: { decision?: string }, executed?: boolean }} interceptResponse
 * @returns {{ sendOriginal: boolean, body: Record<string, unknown> | null }}
 */
export function applySend(incident, interceptResponse) {
  const decision = interceptResponse?.result?.decision
  if (decision === "ALLOW") {
    return { sendOriginal: true, body: { ...incident } }
  }
  if (decision === "INTERVENE") {
    return { sendOriginal: false, body: redactSensitive(incident) }
  }
  return { sendOriginal: false, body: null }
}
