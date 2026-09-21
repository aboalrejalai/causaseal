/** X-CFS fingerprint store. Seeds, then disk per org. */

import { readState, writeState } from "./persist.mjs"

const MATCH_THRESHOLD = 0.6
const DEFAULT_ORG = "demo"

const SEEDS = [
  {
    id: "X-CFS-001",
    title: "مسار تسريب عبر أداة إرسال ووجهة غير معتمدة",
    desc: "تعليمة في النص المسترجع مع بيانات حساسة وأداة إرسال إلى وجهة غير معتمدة.",
    tags: ["أداة إرسال", "بيانات حساسة", "وجهة غير معتمدة", "تعليمة في النص المسترجع"],
    invariants: ["أداة إرسال", "بيانات حساسة", "وجهة غير معتمدة", "تعليمة في النص المسترجع"],
    nodes: [
      { label: "مصدر الإدخال", value: "نص مسترجع موجّه", risk: true },
      { label: "تأثير القرار", value: "تعليمة في المسترجع", risk: true },
      { label: "بيانات", value: "حساسة", risk: true },
      { label: "سياق الوجهة", value: "غير معتمد", risk: true },
    ],
    environment: "dev",
    coveredEnvironments: ["dev"],
    matches: 0,
    confidence: "—",
    date: "18 سبتمبر 2026",
    origin: "seed",
  },
  {
    id: "X-CFS-002",
    title: "تصعيد صلاحيات مع أداة إرسال",
    desc: "صلاحية مرتفعة مع أداة إرسال إلى وجهة غير معتمدة.",
    tags: ["صلاحية مرتفعة", "أداة إرسال", "وجهة غير معتمدة"],
    invariants: ["صلاحية مرتفعة", "أداة إرسال", "وجهة غير معتمدة"],
    nodes: [
      { label: "استدعاء أداة", value: "export_document", risk: true },
      { label: "صلاحية", value: "مرتفعة", risk: true },
      { label: "سياق الوجهة", value: "غير معتمد", risk: true },
    ],
    environment: "enterprise",
    coveredEnvironments: ["enterprise"],
    matches: 0,
    confidence: "—",
    date: "17 سبتمبر 2026",
    origin: "seed",
  },
  {
    id: "X-CFS-003",
    title: "تعليمة مسترجعة قبل استعلام",
    desc: "تعليمة في النص المسترجع تؤثر على قرار لاحق في سياق جديد.",
    tags: ["تعليمة في النص المسترجع"],
    invariants: ["تعليمة في النص المسترجع"],
    nodes: [
      { label: "مصدر الإدخال", value: "نص مسترجع موجّه", risk: true },
      { label: "تأثير القرار", value: "تعليمة في المسترجع", risk: true },
    ],
    environment: "cloud",
    coveredEnvironments: ["cloud"],
    matches: 0,
    confidence: "—",
    date: "16 سبتمبر 2026",
    origin: "seed",
  },
]

/**
 * Normalize legacy flat state into orgs[demo].
 */
function ensureOrgs() {
  const state = readState()
  if (state.orgs && typeof state.orgs === "object") {
    return state.orgs
  }
  /** @type {Record<string, { fingerprints?: unknown, sessionEvents?: unknown }>} */
  const orgs = {
    [DEFAULT_ORG]: {
      fingerprints: Array.isArray(state.fingerprints) ? state.fingerprints : undefined,
      sessionEvents: Array.isArray(state.sessionEvents) ? state.sessionEvents : undefined,
    },
  }
  writeState({ orgs, fingerprints: undefined, sessionEvents: undefined })
  return orgs
}

/**
 * @param {string} [orgId]
 */
function orgBucket(orgId = DEFAULT_ORG) {
  const id = orgId || DEFAULT_ORG
  const orgs = ensureOrgs()
  if (!orgs[id]) {
    orgs[id] = {}
  }
  return { id, orgs, bucket: orgs[id] }
}

/**
 * @param {string} [orgId]
 */
function loadFingerprints(orgId = DEFAULT_ORG) {
  const { bucket } = orgBucket(orgId)
  if (Array.isArray(bucket.fingerprints) && bucket.fingerprints.length) {
    return bucket.fingerprints
  }
  return SEEDS.map((item) => ({ ...item, orgId }))
}

/**
 * @param {string} orgId
 * @param {typeof SEEDS} list
 */
function saveFingerprints(orgId, list) {
  const { id, orgs, bucket } = orgBucket(orgId)
  bucket.fingerprints = list
  orgs[id] = bucket
  writeState({ orgs })
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
 * @param {Array<{ label?: string }>} leftNodes
 * @param {Array<{ label?: string }>} rightNodes
 */
export function graphSimilarity(leftNodes = [], rightNodes = []) {
  const labels = (nodes) =>
    nodes.map((node) => node.label).filter((label) => label && label !== "نداء سابق")
  return jaccard(labels(leftNodes), labels(rightNodes))
}

/**
 * @param {string} [orgId]
 */
export function listFingerprints(orgId = DEFAULT_ORG) {
  return loadFingerprints(orgId).map((item) => ({
    ...item,
    invariants: [...(item.invariants || [])],
    nodes: [...(item.nodes || [])],
    coveredEnvironments: [...(item.coveredEnvironments || [item.environment || "dev"])],
    origin: item.origin || "seed",
    orgId: item.orgId || orgId,
  }))
}

/**
 * True only when every fingerprint is still a seed and none were stored.
 * @param {string} [orgId]
 */
export function fingerprintsAreIllustrative(orgId = DEFAULT_ORG) {
  const list = loadFingerprints(orgId)
  return list.every((item) => (item.origin || "seed") === "seed")
}

/**
 * @param {string} id
 * @param {string} [orgId]
 */
export function getFingerprint(id, orgId = DEFAULT_ORG) {
  return loadFingerprints(orgId).find((item) => item.id === id) || null
}

/**
 * @param {string} [orgId]
 */
export function immunizedEnvironments(orgId = DEFAULT_ORG) {
  const found = new Set()
  for (const fingerprint of loadFingerprints(orgId)) {
    for (const environment of fingerprint.coveredEnvironments || [fingerprint.environment]) {
      if (environment) found.add(environment)
    }
  }
  return [...found]
}

/**
 * @param {string[]} invariants
 * @param {{ record?: boolean, environment?: string, nodes?: Array<{ label?: string }>, orgId?: string }} [options]
 */
export function matchByInvariants(invariants = [], options = {}) {
  if (!invariants.length) return null
  const orgId = options.orgId || DEFAULT_ORG
  const fingerprints = loadFingerprints(orgId)
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
    best.fingerprint.matches = Number(best.fingerprint.matches || 0) + 1
    saveFingerprints(
      orgId,
      fingerprints.map((item) => (item.id === best.fingerprint.id ? best.fingerprint : item))
    )
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
 * @param {{ orgId?: string }} [options]
 */
export function storeFingerprint(input = {}, options = {}) {
  const orgId = options.orgId || DEFAULT_ORG
  const fingerprints = loadFingerprints(orgId)
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
    origin: "stored",
    orgId,
  }
  fingerprints.push(item)
  saveFingerprints(orgId, fingerprints)
  return { ...item }
}

/**
 * @param {string} query
 * @param {string} [orgId]
 */
export function searchFingerprints(query, orgId = DEFAULT_ORG) {
  const q = (query || "").toLowerCase()
  const all = listFingerprints(orgId)
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

export { MATCH_THRESHOLD, DEFAULT_ORG as DEFAULT_ORG_ID }
