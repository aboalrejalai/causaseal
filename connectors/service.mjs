/**
 * In-process connector service — same engine as /api, no HTTP hop, no API key.
 * Used by MCP tools, SDK helpers, and unit tests.
 */

import { evaluate } from "../engine/compliance.mjs"
import { analyze } from "../engine/gateway.mjs"
import {
  fingerprintsAreIllustrative,
  immunizedEnvironments,
  listFingerprints,
  searchFingerprints,
  storeFingerprint,
} from "../engine/memory.mjs"
import { causalCut, harnessDecision, redactSensitive, runOpsAgent } from "../engine/ops-agent.mjs"
import { mutate } from "../engine/sermg.mjs"
import {
  listEvents,
  listSessionEvents,
  recordEvent,
  sessionSummary,
} from "../engine/telemetry.mjs"

export const CHARACTER_LIMIT = 25000
export const DEFAULT_ORG = "demo"
export const ORG_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

export const ORG_ID_ERROR =
  "orgId يقبل حروفًا وأرقامًا و _ و - حتى 64، أو اتركه فارغًا ليُستخدم demo"

/**
 * @param {unknown} value
 * @returns {string}
 */
export function assertOrgId(value) {
  if (value === undefined || value === null || value === "") return DEFAULT_ORG
  const id = String(value)
  if (!ORG_ID_PATTERN.test(id)) {
    throw new Error(ORG_ID_ERROR)
  }
  return id
}

/**
 * @param {unknown[]} items
 * @param {number} [limit]
 * @param {number} [offset]
 */
export function paginate(items, limit = 20, offset = 0) {
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20))
  const safeOffset = Math.max(0, Number(offset) || 0)
  const slice = items.slice(safeOffset, safeOffset + safeLimit)
  const total_count = items.length
  const has_more = total_count > safeOffset + slice.length
  return {
    items: slice,
    total_count,
    count: slice.length,
    offset: safeOffset,
    has_more,
    ...(has_more ? { next_offset: safeOffset + slice.length } : {}),
  }
}

/**
 * @param {unknown} data
 * @param {"markdown" | "json"} [responseFormat]
 * @param {(data: unknown) => string} [toMarkdown]
 */
export function formatResult(data, responseFormat = "markdown", toMarkdown) {
  const jsonText = JSON.stringify(data, null, 2)
  let text =
    responseFormat === "json"
      ? jsonText
      : typeof toMarkdown === "function"
        ? toMarkdown(data)
        : jsonText

  let structured = data
  if (text.length > CHARACTER_LIMIT) {
    const truncated = {
      ...(typeof data === "object" && data !== null ? data : { value: data }),
      truncated: true,
      truncation_message: `Response truncated over ${CHARACTER_LIMIT} characters. Use offset or response_format=json with a smaller limit.`,
    }
    structured = truncated
    text = JSON.stringify(truncated, null, 2).slice(0, CHARACTER_LIMIT)
  }

  return {
    content: [{ type: "text", text }],
    structuredContent: structured,
  }
}

/**
 * Light telemetry so MCP read tools move the hub counter.
 * @param {string} toolName
 * @param {string} [orgId]
 */
export function noteMcpRead(toolName, orgId = DEFAULT_ORG) {
  const id = assertOrgId(orgId)
  recordEvent(
    {
      time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
      agent: "MCP",
      tool: toolName,
      path: "قراءة عبر MCP",
      status: "allowed",
      label: "MCP-READ",
      confidence: "—",
      source: "mcp",
      channel: "mcp",
      risky: false,
      orgId: id,
    },
    { orgId: id }
  )
}

/**
 * @param {Record<string, unknown>} [params]
 */
export function getSession(params = {}) {
  const orgId = assertOrgId(params.orgId)
  if (params.channel === "mcp") noteMcpRead("causaseal_get_session", orgId)
  const summary = sessionSummary(orgId)
  return {
    ...summary,
    fingerprintCount: listFingerprints(orgId).length,
    empty: !summary.hasSession,
  }
}

/**
 * @param {Record<string, unknown>} [params]
 */
export function listEventsPage(params = {}) {
  const orgId = assertOrgId(params.orgId)
  if (params.channel === "mcp") noteMcpRead("causaseal_list_events", orgId)
  const events = listEvents({
    status: params.status || "all",
    q: params.q || "",
    orgId,
  })
  const page = paginate(events, params.limit, params.offset)
  return {
    ...page,
    events: page.items,
    illustrative: listSessionEvents(orgId).length === 0,
    orgId,
  }
}

/**
 * @param {Record<string, unknown>} [params]
 */
export function listFingerprintsPage(params = {}) {
  const orgId = assertOrgId(params.orgId)
  if (params.channel === "mcp") noteMcpRead("causaseal_list_fingerprints", orgId)
  const q = typeof params.q === "string" ? params.q : ""
  const fingerprints = q
    ? searchFingerprints(q, orgId)
    : listFingerprints(orgId)
  const page = paginate(fingerprints, params.limit, params.offset)
  return {
    ...page,
    fingerprints: page.items,
    illustrative: fingerprintsAreIllustrative(orgId),
    orgId,
  }
}

/**
 * @param {Record<string, unknown>} [params]
 */
export function getReport(params = {}) {
  const orgId = assertOrgId(params.orgId)
  if (params.channel === "mcp") noteMcpRead("causaseal_get_report", orgId)
  const summary = sessionSummary(orgId)
  if (!summary.hasSession) {
    return {
      illustrative: true,
      fromSession: false,
      metrics: [],
      decisions: [],
      matchRate: 0,
      prevention: 0,
      correctAllow: 0,
      orgId,
      hint: "شغّل causaseal_run_agent ثم أعد القراءة بنفس orgId.",
    }
  }
  const sermgScore = summary.sermgTotal
    ? summary.sermgDetected / summary.sermgTotal
    : 0
  return {
    illustrative: false,
    fromSession: true,
    matchRate: summary.matchRate,
    prevention: summary.prevention,
    correctAllow: summary.correctAllow,
    metrics: [
      { label: "دقة المطابقة في الجلسة", value: summary.matchRate },
      { label: "نسبة المنع للمسارات الخطرة", value: summary.prevention },
      { label: "السماح الصحيح بالنشاط المشروع", value: summary.correctAllow },
      { label: "اكتشاف طفرات SERMG", value: sermgScore },
      { label: "متوسط الاختزال السببي", value: summary.avgReduction ?? 0 },
      {
        label: "بيئات اكتسبت المناعة",
        value: Math.min(immunizedEnvironments(orgId).length, 3) / 3,
      },
    ],
    decisions: summary.decisions,
    experiments: {
      learn: summary.blocked > 0,
      recognize: summary.matchRate > 0,
      allow: summary.correctAllow > 0,
    },
    orgId,
  }
}

/**
 * @param {Record<string, unknown>} [params]
 */
export function listCompliancePage(params = {}) {
  if (params.channel === "mcp") {
    noteMcpRead("causaseal_list_compliance", assertOrgId(params.orgId))
  }
  const controls = evaluate()
  const page = paginate(controls, params.limit, params.offset)
  return {
    ...page,
    controls: page.items,
    illustrative: false,
  }
}

/**
 * Partner contract before a send tool. Does not execute the partner tool.
 * @param {Record<string, unknown>} body
 */
export async function interceptTool(body = {}) {
  const orgId = assertOrgId(body.orgId)
  const channel = ["http", "mcp", "sdk"].includes(String(body.channel))
    ? String(body.channel)
    : "http"
  const incident = { ...body, orgId, preferRules: true }
  delete incident.channel
  const harness = harnessDecision(incident)
  const result = await analyze(incident, {
    source: "intercept",
    rulesOnly: true,
    orgId,
    channel,
  })
  const decision = result.decision
  const sendOriginal = decision === "ALLOW"
  const invariants = Array.isArray(result.reduction?.invariants)
    ? result.reduction.invariants
    : []
  const cut = decision === "INTERVENE" ? causalCut(invariants) : null
  /** @type {Record<string, unknown> | undefined} */
  let redactedBody
  if (decision === "INTERVENE") {
    redactedBody = redactSensitive(incident, { cut })
  }
  return {
    executed: false,
    decision,
    sendOriginal,
    harness,
    cut,
    result,
    orgId,
    channel,
    ...(redactedBody ? { redactedBody } : {}),
    guidance:
      decision === "ALLOW"
        ? "أرسل الأصل إلى أداة الإرسال."
        : decision === "INTERVENE"
          ? cut
            ? `لا ترسل الأصل. قُطعت: ${cut}. استخدم redactedBody فقط.`
            : "لا ترسل الأصل. استخدم redactedBody فقط."
          : "أوقف التنفيذ لشخص (VERIFY).",
  }
}

/**
 * Full demo loop: harness vs fingerprint, then deliver original or redacted.
 * @param {Record<string, unknown>} [options]
 */
export async function runAgent(options = {}) {
  const orgId = assertOrgId(options.orgId)
  const channel = ["http", "mcp", "sdk"].includes(String(options.channel))
    ? String(options.channel)
    : "http"
  const outcome = await runOpsAgent({ ...options, orgId, channel })
  return {
    ...outcome,
    decision: outcome.result?.decision,
    sendOriginal: outcome.deliveredOriginal === true,
  }
}

/**
 * @param {Record<string, unknown>} body
 */
export async function analyzePath(body = {}) {
  const orgId = assertOrgId(body.orgId)
  const channel = ["http", "mcp", "sdk"].includes(String(body.channel))
    ? String(body.channel)
    : "http"
  const result = await analyze(
    { ...body, orgId, preferRules: true },
    { rulesOnly: true, orgId, channel }
  )
  return { result, orgId, channel }
}

/**
 * @param {Record<string, unknown>} input
 */
export function storeFingerprintItem(input = {}) {
  const orgId = assertOrgId(input.orgId)
  if (!input.title || String(input.title).trim() === "") {
    throw new Error("title مطلوب. مرّر عنوان البصمة ثم أعد المحاولة.")
  }
  if (input.channel === "mcp") {
    recordEvent(
      {
        time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        agent: "MCP",
        tool: "causaseal_store_fingerprint",
        path: "حفظ بصمة عبر MCP",
        status: "allowed",
        label: "MCP-WRITE",
        confidence: "—",
        source: "mcp",
        channel: "mcp",
        risky: false,
        orgId,
      },
      { orgId }
    )
  }
  const fingerprint = storeFingerprint(input, { orgId })
  return { fingerprint, orgId }
}

/**
 * @param {Record<string, unknown>} [options]
 */
export async function runSermg(options = {}) {
  const orgId = assertOrgId(options.orgId)
  const signatureId = options.signatureId || "X-CFS-001"
  const count = Math.min(24, Math.max(1, Number(options.count) || 6))
  if (options.channel === "mcp") {
    recordEvent(
      {
        time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        agent: "MCP",
        tool: "causaseal_run_sermg",
        path: "طفرات SERMG عبر MCP",
        status: "allowed",
        label: "MCP-WRITE",
        confidence: "—",
        source: "mcp",
        channel: "mcp",
        risky: false,
        orgId,
      },
      { orgId }
    )
  }
  const result = await mutate({
    ...options,
    signatureId,
    count,
    orgId,
  })
  return { ...result, orgId }
}

export { causalCut, harnessDecision, redactSensitive }
