import type { AnalysisResult, CausalNode, Fingerprint, IncidentInput } from "@/lib/contracts"
import { apiUrl } from "@/lib/api/base"

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return (await response.json()) as T
}

export async function analyzeIncident(
  input: IncidentInput,
  options?: { preferRules?: boolean }
): Promise<AnalysisResult> {
  const response = await fetch(apiUrl("/api/analyze"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, preferRules: Boolean(options?.preferRules) }),
  })
  return readJson<AnalysisResult>(response)
}

export async function fetchEvents(params?: { status?: string; q?: string }) {
  const search = new URLSearchParams()
  if (params?.status) search.set("status", params.status)
  if (params?.q) search.set("q", params.q)
  const qs = search.toString()
  const response = await fetch(apiUrl(`/api/events${qs ? `?${qs}` : ""}`))
  return readJson<{ events: import("@/lib/contracts").AgentEvent[]; illustrative: boolean }>(
    response
  )
}

export async function fetchFingerprints() {
  try {
    const response = await fetch(apiUrl("/api/fingerprints"))
    return readJson<{ fingerprints: Fingerprint[]; illustrative: boolean }>(response)
  } catch {
    const raw = localStorage.getItem("causaseal_fingerprints")
    if (raw) {
      return { fingerprints: JSON.parse(raw) as Fingerprint[], illustrative: true }
    }
    throw new Error("fingerprints unavailable")
  }
}

export async function createFingerprint(
  input: Partial<Fingerprint>
): Promise<{ fingerprint: Fingerprint }> {
  try {
    const response = await fetch(apiUrl("/api/fingerprints"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    return readJson(response)
  } catch {
    const existing = JSON.parse(
      localStorage.getItem("causaseal_fingerprints") || "[]"
    ) as Fingerprint[]
    const fingerprint: Fingerprint = {
      id: `X-CFS-${String(existing.length + 1).padStart(3, "0")}`,
      title: input.title || "بصمة مستخرجة من التحقيق الحالي",
      desc: input.desc || "مسار سببي موثق أُنشئ من سيناريو التحليل التفاعلي.",
      tags: input.tags || ["مصدر غير موثوق", "تأثير قرار", "سياق متغير"],
      invariants: input.invariants || input.tags || [],
      matches: 0,
      confidence: input.confidence || "—",
      date: input.date || new Date().toLocaleDateString("ar-SA"),
    }
    const next = [...existing, fingerprint]
    localStorage.setItem("causaseal_fingerprints", JSON.stringify(next))
    return { fingerprint }
  }
}

export async function runSermg(body: {
  signatureId: string
  count: number
  changePrompt?: boolean
  changeTool?: boolean
  changeData?: boolean
  changePrivilege?: boolean
  environment?: "cloud" | "enterprise" | "dev"
}) {
  const response = await fetch(apiUrl("/api/sermg/run"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return readJson<import("@/lib/contracts").MutationRun>(response)
}

export async function fetchReportMetrics() {
  const response = await fetch(apiUrl("/api/reports/metrics"))
  return readJson<{
    illustrative: boolean
    fromSession?: boolean
    matchRate?: number
    prevention?: number
    correctAllow?: number
    metrics: Array<{ label: string; value: number }>
    decisions?: Array<{ decision: string; note: string; time: string }>
    experiments?: { learn: boolean; recognize: boolean; allow: boolean }
  }>(response)
}

export type SessionSummary = {
  hasSession: boolean
  blocked: number
  eventCount: number
  fingerprintCount: number
  matchRate: number
  prevention: number
  correctAllow: number
  sermgDetected: number
  sermgTotal: number
  lastLatencyMs: number | null
  avgLatencyMs: number | null
  avgReduction: number | null
  environmentCount: number
  riskScore: number | null
  recent: import("@/lib/contracts").AgentEvent[] | null
  decisions: Array<{ decision: string; note: string; time: string }>
  lastAnalysis: {
    decision: string
    confidence: number
    matchedSignature: string
    nodes: CausalNode[]
    reason: string
  } | null
  channels?: { http: number; mcp: number; sdk: number }
  interceptCount?: number
  connectorHttp?: {
    intercepts: number
    delivered: number
    redacted: number
    intervene: number
  }
  connectorMcp?: {
    total: number
    reads: number
    writes: number
    tools: number
  }
  connectorSdk?: {
    total: number
    allow: number
    redacted: number
    verify: number
  }
}

export async function interceptAgent(body: IncidentInput) {
  const response = await fetch(apiUrl("/api/gateway/intercept"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return readJson<{ executed: false; result: AnalysisResult }>(response)
}

export async function runOpsAgentClient(body: {
  kind?: "leak" | "safe" | "cross" | "mutated" | "lookalike"
  orgId?: string
  environment?: string
}) {
  const response = await fetch(apiUrl("/api/agent/run"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, preferRules: true }),
  })
  return readJson<{
    executed: false
    delivered: boolean
    deliveredOriginal: boolean
    intervention: "redact-sensitive" | null
    harness: "ALLOW" | "BLOCK"
    result: AnalysisResult
    beneficiary: string
    change: string
    kind: string
    orgId: string
  }>(response)
}

export async function fetchCompliance() {
  const response = await fetch(apiUrl("/api/compliance"))
  return readJson<{
    controls: import("@/lib/contracts").ComplianceControl[]
    illustrative: boolean
  }>(response)
}

export async function fetchSession() {
  const response = await fetch(apiUrl("/api/session"))
  return readJson<SessionSummary>(response)
}
