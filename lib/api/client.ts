import type { AnalysisResult, CausalNode, Fingerprint, IncidentInput } from "@/lib/contracts"

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
  const response = await fetch("/api/analyze", {
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
  const response = await fetch(`/api/events${qs ? `?${qs}` : ""}`)
  return readJson<{ events: import("@/lib/contracts").AgentEvent[]; illustrative: boolean }>(
    response
  )
}

export async function fetchFingerprints() {
  try {
    const response = await fetch("/api/fingerprints")
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
    const response = await fetch("/api/fingerprints", {
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
}) {
  const response = await fetch("/api/sermg/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return readJson<import("@/lib/contracts").MutationRun>(response)
}

export async function fetchReportMetrics() {
  const response = await fetch("/api/reports/metrics")
  return readJson<{
    illustrative: boolean
    fromSession?: boolean
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
}

export async function fetchSession() {
  const response = await fetch("/api/session")
  return readJson<SessionSummary>(response)
}
