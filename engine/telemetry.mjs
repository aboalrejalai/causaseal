/** Session telemetry. Seeded history stays; live analyses are prepended and saved to disk. */

import { readState, writeState } from "./persist.mjs"

export const SEED_EVENTS = [
  {
    time: "09:42:18",
    agent: "Finance Copilot",
    tool: "send_to_workspace",
    path: "PDF → Decision → External API",
    status: "blocked",
    label: "INTERVENE",
    confidence: "94%",
    session: false,
  },
  {
    time: "09:41:05",
    agent: "HR Assistant",
    tool: "read_employee_file",
    path: "User → HR DB → Summary",
    status: "allowed",
    label: "ALLOW",
    confidence: "99%",
    session: false,
  },
  {
    time: "09:38:44",
    agent: "Operations Agent",
    tool: "export_document",
    path: "Email → Agent → Unknown Drive",
    status: "verify",
    label: "VERIFY",
    confidence: "81%",
    session: false,
  },
  {
    time: "09:35:12",
    agent: "Support Agent",
    tool: "search_knowledge",
    path: "Ticket → KB → Response",
    status: "allowed",
    label: "ALLOW",
    confidence: "98%",
    session: false,
  },
  {
    time: "09:31:27",
    agent: "Procurement AI",
    tool: "invoke_vendor_api",
    path: "Web → Tool → Vendor API",
    status: "blocked",
    label: "RESTRICT",
    confidence: "89%",
    session: false,
  },
  {
    time: "09:28:09",
    agent: "Finance Copilot",
    tool: "query_database",
    path: "User → Finance DB → Chart",
    status: "allowed",
    label: "ALLOW",
    confidence: "97%",
    session: false,
  },
  {
    time: "09:22:33",
    agent: "Legal Reviewer",
    tool: "share_document",
    path: "Contract → Agent → Team Space",
    status: "verify",
    label: "VERIFY",
    confidence: "76%",
    session: false,
  },
]

/** @type {Array<Record<string, unknown>>} */
let sessionEvents = Array.isArray(readState().sessionEvents) ? readState().sessionEvents : []

/** @type {Record<string, unknown> | null} */
let lastAnalysis = null

/**
 * @param {Record<string, unknown>} event
 */
export function recordEvent(event) {
  sessionEvents = [{ ...event, session: true }, ...sessionEvents].slice(0, 80)
  writeState({ sessionEvents })
  return sessionEvents[0]
}

/**
 * @param {Record<string, unknown>} snapshot
 */
export function rememberAnalysis(snapshot) {
  lastAnalysis = snapshot
}

export function getLastAnalysis() {
  return lastAnalysis
}

export function listSessionEvents() {
  return [...sessionEvents]
}

/**
 * @param {{ status?: string, q?: string }} [filter]
 */
export function listEvents(filter = {}) {
  let events = [...sessionEvents, ...SEED_EVENTS]
  if (filter.status && filter.status !== "all") {
    events = events.filter((event) => event.status === filter.status)
  }
  if (filter.q) {
    const q = filter.q.toLowerCase()
    events = events.filter((event) => Object.values(event).join(" ").toLowerCase().includes(q))
  }
  return events
}

export function sessionSummary() {
  const events = sessionEvents
  const hasSession = events.length > 0
  const blocked = events.filter((event) => event.status === "blocked").length
  const risky = events.filter((event) => event.risky)
  const matched = risky.filter((event) => String(event.matchedSignature || "").startsWith("X-CFS"))
  const matchRate = risky.length ? matched.length / risky.length : 0
  const benign = events.filter((event) => event.risky === false)
  const correctAllow = benign.length
    ? benign.filter((event) => event.status === "allowed").length / benign.length
    : 0
  const prevention = risky.length
    ? risky.filter((event) => event.status === "blocked" || event.status === "verify").length /
      risky.length
    : 0
  const sermg = events.filter((event) => event.source === "sermg" && event.risky)
  const sermgDetected = sermg.filter((event) => event.status !== "allowed").length
  const last = events[0]
  const reductions = events
    .map((event) => Number(event.reductionRatio))
    .filter((value) => Number.isFinite(value))
  const latencies = events
    .map((event) => Number(event.latencyMs))
    .filter((value) => Number.isFinite(value))
  const environments = new Set(
    events.map((event) => event.environment).filter((value) => typeof value === "string")
  )

  return {
    hasSession,
    blocked,
    eventCount: events.length,
    matchRate: Number(matchRate.toFixed(3)),
    prevention: Number(prevention.toFixed(3)),
    correctAllow: Number(correctAllow.toFixed(3)),
    sermgDetected,
    sermgTotal: sermg.length,
    lastLatencyMs: typeof last?.latencyMs === "number" ? last.latencyMs : null,
    avgLatencyMs: latencies.length
      ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)
      : null,
    avgReduction: reductions.length
      ? Number((reductions.reduce((sum, value) => sum + value, 0) / reductions.length).toFixed(3))
      : null,
    environmentCount: environments.size,
    riskScore: hasSession
      ? Math.min(100, Math.round((blocked / Math.max(events.length, 1)) * 100))
      : null,
    recent: hasSession ? events.slice(0, 4) : null,
    decisions: events.slice(0, 8).map((event) => ({
      decision: event.label,
      note: event.path,
      time: event.time,
    })),
    lastAnalysis,
  }
}
