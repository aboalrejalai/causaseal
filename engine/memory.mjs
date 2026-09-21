/** X-CFS fingerprint store. Seeds, then disk if a previous session exists. */

import { readState, writeState } from "./persist.mjs"

const MATCH_THRESHOLD = 0.6

const SEEDS = [
  {
    id: "X-CFS-001",
    title: "مسار تسريب بيانات عبر تعليمات غير موثوقة",
    desc: "تأثير خارجي يغيّر قرار الوكيل ثم يستغل أداة مصرحاً بها لإرسال بيانات حساسة.",
    tags: ["مصدر غير موثوق", "تأثير قرار", "بيانات حساسة", "وجهة خارجية"],
    invariants: ["مصدر غير موثوق", "تأثير قرار", "بيانات حساسة", "وجهة خارجية"],
    nodes: [
      { label: "مصدر الإدخال", value: "غير موثوق", risk: true },
      { label: "تأثير القرار", value: "تعليمة خفية", risk: true },
      { label: "بيانات", value: "حساسة", risk: true },
      { label: "سياق الوجهة", value: "غير معتمد", risk: true },
    ],
    environment: "dev",
    coveredEnvironments: ["dev"],
    matches: 14,
    confidence: "94%",
    date: "18 سبتمبر 2026",
  },
  {
    id: "X-CFS-002",
    title: "تصعيد صلاحيات غير مباشر",
    desc: "طلب طبيعي ظاهرياً يؤدي إلى توسيع نطاق الأداة خارج متطلبات المهمة.",
    tags: ["صلاحية مرتفعة", "استدعاء أداة خارج النطاق"],
    invariants: ["صلاحية مرتفعة", "استدعاء أداة خارج النطاق"],
    nodes: [
      { label: "استدعاء أداة", value: "export_document", risk: true },
      { label: "صلاحية", value: "مرتفعة", risk: true },
    ],
    environment: "enterprise",
    coveredEnvironments: ["enterprise"],
    matches: 7,
    confidence: "88%",
    date: "17 سبتمبر 2026",
  },
  {
    id: "X-CFS-003",
    title: "تسميم ذاكرة وكيل",
    desc: "إدخال غير موثوق يستقر في الذاكرة ويؤثر في قرارات لاحقة ضمن سياق جديد.",
    tags: ["تسميم ذاكرة", "انتقال سياق", "تعليمات خفية"],
    invariants: ["تسميم ذاكرة", "انتقال سياق", "تعليمات خفية"],
    nodes: [
      { label: "مصدر الإدخال", value: "غير موثوق", risk: true },
      { label: "تأثير القرار", value: "تعليمة خفية", risk: true },
    ],
    environment: "cloud",
    coveredEnvironments: ["cloud"],
    matches: 5,
    confidence: "91%",
    date: "16 سبتمبر 2026",
  },
]

const saved = readState().fingerprints
/** @type {typeof SEEDS} */
let fingerprints = Array.isArray(saved) && saved.length ? saved : SEEDS.map((item) => ({ ...item }))

function persist() {
  writeState({ fingerprints })
}

/**
 * @param {string[]} left
 * @param {string[]} right
 */
export function jaccard(left = [], right = []) {
  const a = new Set(left)
  const b = new Set(right)
  if (a.size === 0 && b.size === 0) return 0
  let intersection = 0
  for (const item of a) {
    if (b.has(item)) intersection += 1
  }
  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

/**
 * Surface names (tool, file, time) are ignored. Labels are the causal structure.
 * @param {Array<{ label?: string }>} leftNodes
 * @param {Array<{ label?: string }>} rightNodes
 */
export function graphSimilarity(leftNodes = [], rightNodes = []) {
  const labels = (nodes) =>
    nodes.map((node) => node.label).filter((label) => label && label !== "سطر سجل غير حرج")
  return jaccard(labels(leftNodes), labels(rightNodes))
}

export function listFingerprints() {
  return fingerprints.map((item) => ({
    ...item,
    invariants: [...(item.invariants || [])],
    nodes: [...(item.nodes || [])],
    coveredEnvironments: [...(item.coveredEnvironments || [item.environment || "dev"])],
  }))
}

/**
 * @param {string} id
 */
export function getFingerprint(id) {
  return fingerprints.find((item) => item.id === id) || null
}

export function immunizedEnvironments() {
  const found = new Set()
  for (const fingerprint of fingerprints) {
    for (const environment of fingerprint.coveredEnvironments || [fingerprint.environment]) {
      if (environment) found.add(environment)
    }
  }
  return [...found]
}

/**
 * @param {string[]} invariants
 * @param {{ record?: boolean, environment?: string, nodes?: Array<{ label?: string }> }} [options]
 */
export function matchByInvariants(invariants = [], options = {}) {
  if (!invariants.length) return null
  let best = null
  for (const fingerprint of fingerprints) {
    const invariantScore = jaccard(invariants, fingerprint.invariants || [])
    const structureScore = graphSimilarity(options.nodes || [], fingerprint.nodes || [])
    if (invariantScore < MATCH_THRESHOLD) continue
    if (!best || invariantScore > best.score) {
      best = { fingerprint, score: invariantScore, structureScore }
    }
  }
  if (!best) return null

  const learnedIn = best.fingerprint.environment || "dev"
  const appliedIn = options.environment || learnedIn
  if (!best.fingerprint.coveredEnvironments) {
    best.fingerprint.coveredEnvironments = [learnedIn]
  }
  if (!best.fingerprint.coveredEnvironments.includes(appliedIn)) {
    best.fingerprint.coveredEnvironments.push(appliedIn)
  }
  if (options.record !== false) {
    best.fingerprint.matches += 1
    persist()
  }
  return {
    id: best.fingerprint.id,
    score: Number(best.score.toFixed(2)),
    learnedIn,
    appliedIn,
    crossContext: learnedIn !== appliedIn,
    graphScore: Number((best.structureScore || 0).toFixed(2)),
  }
}

/**
 * @param {Partial<{title:string,desc:string,tags:string[],confidence:string,date:string,invariants:string[],environment:string,nodes:Array<{label:string,value:string,risk:boolean}>}>} input
 */
export function storeFingerprint(input = {}) {
  const id = `X-CFS-${String(fingerprints.length + 1).padStart(3, "0")}`
  const invariants = input.invariants?.length ? [...input.invariants] : [...(input.tags || [])]
  const environment = input.environment || "dev"
  const item = {
    id,
    title: input.title || "بصمة مستخرجة من التحقيق الحالي",
    desc: input.desc || "مسار سببي موثق أُنشئ من سيناريو التحليل التفاعلي.",
    tags: input.tags?.length ? input.tags : invariants,
    invariants,
    nodes: input.nodes || [],
    environment,
    coveredEnvironments: [environment],
    matches: 0,
    confidence: input.confidence || "—",
    date: input.date || new Date().toLocaleDateString("ar-SA"),
  }
  fingerprints = [...fingerprints, item]
  persist()
  return { ...item }
}

/**
 * @param {string} query
 */
export function searchFingerprints(query) {
  const q = (query || "").toLowerCase()
  const all = listFingerprints()
  if (!q) return all
  return all.filter((fingerprint) =>
    [
      fingerprint.id,
      fingerprint.title,
      fingerprint.desc,
      fingerprint.environment,
      ...fingerprint.tags,
      ...fingerprint.invariants,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q)
  )
}
