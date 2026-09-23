/** Helpers that turn session / page data into chart series. No planted numbers. */

import type { AgentEvent, Fingerprint, MutationResult } from "@/lib/contracts"

export function eventsToAreaSeries(events: AgentEvent[]) {
  const chronological = [...events].reverse()
  let blocked = 0
  let allowed = 0
  return chronological.map((event, index) => {
    if (event.status === "blocked") blocked += 1
    if (event.status === "allowed") allowed += 1
    return {
      label: event.time || String(index + 1),
      seriesA: blocked,
      seriesB: allowed,
    }
  })
}

export function eventsToDecisionPie(events: AgentEvent[]) {
  const intervene = events.filter(
    (event) => event.label === "INTERVENE" || event.status === "blocked"
  ).length
  const verify = events.filter(
    (event) => event.label === "VERIFY" || event.status === "verify"
  ).length
  const allow = events.filter(
    (event) =>
      event.label === "ALLOW" ||
      event.label === "DELIVERED" ||
      event.label === "DELIVERED-REDACTED" ||
      event.status === "allowed"
  ).length

  return [
    { key: "intervene", label: "تدخل", value: intervene },
    { key: "verify", label: "تحقق", value: verify },
    { key: "allow", label: "سماح", value: allow },
  ].filter((slice) => slice.value > 0)
}

/** Three discrete bars for monitor status breakdown. */
export function eventsToStatusCategoryBars(events: AgentEvent[]) {
  return [
    {
      category: "مُنع",
      seriesA: events.filter((event) => event.status === "blocked").length,
    },
    {
      category: "تحقق",
      seriesA: events.filter((event) => event.status === "verify").length,
    },
    {
      category: "سُمح",
      seriesA: events.filter((event) => event.status === "allowed").length,
    },
  ]
}

const INVARIANT_AXES = [
  "أداة إرسال",
  "بيانات حساسة",
  "وجهة غير معتمدة",
  "تعليمة في النص المسترجع",
  "صلاحية مرتفعة",
  "نداء سابق",
] as const

export function invariantsToRadar(invariants: string[] | undefined) {
  const set = new Set(invariants ?? [])
  return INVARIANT_AXES.map((axis) => ({
    axis,
    value: set.has(axis) ? 100 : 0,
  }))
}

export function fingerprintsToInvariantBars(fingerprints: Fingerprint[]) {
  const counts = new Map<string, number>()
  for (const fp of fingerprints) {
    const tags = fp.invariants?.length ? fp.invariants : fp.tags
    for (const tag of tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

const INVARIANT_SHORT: Record<string, string> = {
  "أداة إرسال": "إرسال",
  "بيانات حساسة": "حساسة",
  "وجهة غير معتمدة": "وجهة",
  "تعليمة في النص المسترجع": "مسترجع",
  "صلاحية مرتفعة": "صلاحية",
  "نداء سابق": "نداء",
}

/** Vertical bar series with short X labels; full Arabic name for tooltips. */
export function fingerprintsToInvariantShortBars(fingerprints: Fingerprint[]) {
  return fingerprintsToInvariantBars(fingerprints).map((row) => ({
    category: INVARIANT_SHORT[row.label] ?? row.label.slice(0, 6),
    seriesA: row.value,
    fullLabel: row.label,
  }))
}

export function fingerprintsToEnvironmentPie(fingerprints: Fingerprint[]) {
  const buckets = { dev: 0, enterprise: 0, cloud: 0 }
  for (const fp of fingerprints) {
    const env = fp.environment ?? "dev"
    buckets[env] += 1
  }
  return [
    { key: "dev", label: "التطوير", value: buckets.dev },
    { key: "enterprise", label: "المؤسسة", value: buckets.enterprise },
    { key: "cloud", label: "السحابة", value: buckets.cloud },
  ].filter((slice) => slice.value > 0)
}

export function mutationsToLine(results: MutationResult[]) {
  return results.map((row) => ({
    label: String(row.index).padStart(2, "0"),
    value: Math.round(row.similarity * 100),
  }))
}

export function mutationsToOutcomePie(results: MutationResult[]) {
  const detected = results.filter((row) => row.outcome === "DETECTED").length
  const allow = results.filter((row) => row.outcome === "ALLOW").length
  return [
    { key: "detected", label: "اكتشاف", value: detected },
    { key: "allow", label: "سماح", value: allow },
  ].filter((slice) => slice.value > 0)
}

export function metricsToRadar(metrics: Array<{ label: string; value: number }>) {
  return metrics.map((metric) => ({
    axis: metric.label.length > 18 ? `${metric.label.slice(0, 16)}…` : metric.label,
    value: Math.round(metric.value * 100),
  }))
}

export { INVARIANT_AXES }
