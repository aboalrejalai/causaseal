/** Session telemetry per org. Live UI shows session events only. */

import { readState, writeState } from "./persist.mjs"

const DEFAULT_ORG = "demo"

/** Keep seeds for reference / offline demos only — not mixed into live listEvents. */
export const SEED_EVENTS = [
  {
    time: "09:42:18",
    agent: "Finance Copilot",
    tool: "send_to_workspace",
    path: "أداة إرسال → بيانات حساسة → وجهة غير معتمدة",
    status: "blocked",
    label: "INTERVENE",
    confidence: "—",
    session: false,
  },
]

/** @type {Record<string, Array<Record<string, unknown>>>} */
const sessionByOrg = {}

/** @type {Record<string, unknown> | null} */
let lastAnalysis = null

function ensureOrgs() {
  const state = readState()
  if (state.orgs && typeof state.orgs === "object") return state.orgs
  /** @type {Record<string, { fingerprints?: unknown, sessionEvents?: unknown }>} */
  const orgs = {
    [DEFAULT_ORG]: {
      fingerprints: Array.isArray(state.fingerprints) ? state.fingerprints : undefined,
      sessionEvents: Array.isArray(state.sessionEvents) ? state.sessionEvents : undefined,
    },
  }
  writeState({ orgs })
  return orgs
}

/**
 * @param {string} [orgId]
 */
function loadSession(orgId = DEFAULT_ORG) {
  const id = orgId || DEFAULT_ORG
  if (sessionByOrg[id]) return sessionByOrg[id]
  const orgs = ensureOrgs()
  const bucket = orgs[id] || {}
  sessionByOrg[id] = Array.isArray(bucket.sessionEvents) ? [...bucket.sessionEvents] : []
  return sessionByOrg[id]
}

/**
 * @param {string} orgId
 * @param {Array<Record<string, unknown>>} events
 */
function saveSession(orgId, events) {
  const orgs = ensureOrgs()
  const id = orgId || DEFAULT_ORG
  if (!orgs[id]) orgs[id] = {}
  orgs[id].sessionEvents = events
  sessionByOrg[id] = events
  writeState({ orgs })
}

/**
 * @param {Record<string, unknown>} event
 * @param {{ orgId?: string }} [options]
 */
export function recordEvent(event, options = {}) {
  const orgId = options.orgId || event.orgId || DEFAULT_ORG
  const current = loadSession(orgId)
  const next = [{ ...event, session: true, orgId }, ...current].slice(0, 80)
  saveSession(orgId, next)
  return next[0]
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

/**
 * @param {string} [orgId]
 */
export function listSessionEvents(orgId = DEFAULT_ORG) {
  return [...loadSession(orgId)]
}

/**
 * Live feed — session only (no seed mix).
 * @param {{ status?: string, q?: string, orgId?: string }} [filter]
 */
export function listEvents(filter = {}) {
  const orgId = filter.orgId || DEFAULT_ORG
  let events = [...loadSession(orgId)]
  if (filter.status && filter.status !== "all") {
    events = events.filter((event) => event.status === filter.status)
  }
  if (filter.q) {
    const q = filter.q.toLowerCase()
    events = events.filter((event) => Object.values(event).join(" ").toLowerCase().includes(q))
  }
  return events
}

/**
 * @param {string} [orgId]
 */
export function sessionSummary(orgId = DEFAULT_ORG) {
  const events = loadSession(orgId)
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

  const byChannel = (name) =>
    events.filter((event) => String(event.channel || "http") === name).length
  const channelEvents = (name) =>
    events.filter((event) => String(event.channel || "http") === name)

  const httpEvents = channelEvents("http")
  const mcpEvents = channelEvents("mcp")
  const sdkEvents = channelEvents("sdk")

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
    orgId,
    channels: {
      http: byChannel("http"),
      mcp: byChannel("mcp"),
      sdk: byChannel("sdk"),
    },
    interceptCount: events.filter((event) => event.source === "intercept").length,
    connectorHttp: {
      intercepts: httpEvents.filter((event) => event.source === "intercept").length,
      delivered: httpEvents.filter((event) => event.label === "DELIVERED").length,
      redacted: httpEvents.filter((event) => event.label === "DELIVERED-REDACTED").length,
      intervene: httpEvents.filter((event) => event.label === "INTERVENE").length,
    },
    connectorMcp: {
      total: mcpEvents.length,
      reads: mcpEvents.filter((event) => event.label === "MCP-READ").length,
      writes: mcpEvents.filter((event) => event.label !== "MCP-READ").length,
      tools: 10,
    },
    connectorSdk: {
      total: sdkEvents.length,
      allow: sdkEvents.filter((event) => event.label === "ALLOW").length,
      redacted: sdkEvents.filter(
        (event) =>
          event.label === "DELIVERED-REDACTED" || event.label === "INTERVENE"
      ).length,
      verify: sdkEvents.filter((event) => event.label === "VERIFY").length,
    },
  }
}

/** Clear in-memory org caches (tests). */
export function resetTelemetryCache() {
  for (const key of Object.keys(sessionByOrg)) delete sessionByOrg[key]
  lastAnalysis = null
}
