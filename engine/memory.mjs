/** In-memory X-CFS fingerprint store. Process memory only — no database. */

const MATCH_THRESHOLD = 0.6

/** @type {Array<{id:string,title:string,desc:string,tags:string[],matches:number,confidence:string,date:string,invariants:string[]}>} */
let fingerprints = [
  {
    id: "X-CFS-001",
    title: "مسار تسريب بيانات عبر تعليمات غير موثوقة",
    desc: "تأثير خارجي يغيّر قرار الوكيل ثم يستغل أداة مصرحاً بها لإرسال بيانات حساسة.",
    tags: ["مصدر غير موثوق", "تأثير قرار", "بيانات حساسة", "وجهة خارجية"],
    invariants: ["مصدر غير موثوق", "تأثير قرار", "بيانات حساسة", "وجهة خارجية"],
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
    matches: 5,
    confidence: "91%",
    date: "16 سبتمبر 2026",
  },
]

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

export function listFingerprints() {
  return fingerprints.map((item) => ({ ...item, invariants: [...item.invariants] }))
}

/**
 * @param {string} id
 */
export function getFingerprint(id) {
  return fingerprints.find((item) => item.id === id) || null
}

/**
 * @param {string[]} invariants
 * @param {{ record?: boolean }} [options]
 */
export function matchByInvariants(invariants = [], options = {}) {
  if (!invariants.length) return null
  let best = null
  for (const fingerprint of fingerprints) {
    const score = jaccard(invariants, fingerprint.invariants)
    if (!best || score > best.score) {
      best = { fingerprint, score }
    }
  }
  if (!best || best.score < MATCH_THRESHOLD) return null
  if (options.record !== false) {
    best.fingerprint.matches += 1
  }
  return {
    id: best.fingerprint.id,
    score: Number(best.score.toFixed(2)),
  }
}

/**
 * @param {Partial<{title:string,desc:string,tags:string[],confidence:string,date:string,invariants:string[]}>} input
 */
export function storeFingerprint(input = {}) {
  const id = `X-CFS-${String(fingerprints.length + 1).padStart(3, "0")}`
  const invariants = input.invariants?.length ? [...input.invariants] : [...(input.tags || [])]
  const item = {
    id,
    title: input.title || "بصمة مستخرجة من التحقيق الحالي",
    desc: input.desc || "مسار سببي موثق أُنشئ من سيناريو التحليل التفاعلي.",
    tags: input.tags?.length ? input.tags : invariants,
    invariants,
    matches: 0,
    confidence: input.confidence || "—",
    date: input.date || new Date().toLocaleDateString("ar-SA"),
  }
  fingerprints = [...fingerprints, item]
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
    [fingerprint.id, fingerprint.title, fingerprint.desc, ...fingerprint.tags, ...fingerprint.invariants]
      .join(" ")
      .toLowerCase()
      .includes(q)
  )
}
