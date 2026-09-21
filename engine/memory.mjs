/** In-memory X-CFS fingerprint store (seeded; replace with durable storage later). */

/** @type {Array<{id:string,title:string,desc:string,tags:string[],matches:number,confidence:string,date:string}>} */
let fingerprints = [
  {
    id: "X-CFS-001",
    title: "مسار تسريب بيانات عبر تعليمات غير موثوقة",
    desc: "تأثير خارجي يغيّر قرار الوكيل ثم يستغل أداة مصرحاً بها لإرسال بيانات حساسة.",
    tags: ["مصدر غير موثوق", "تأثير قرار", "أداة ذات صلاحية", "وجهة خارجية"],
    matches: 14,
    confidence: "94%",
    date: "18 سبتمبر 2026",
  },
  {
    id: "X-CFS-002",
    title: "تصعيد صلاحيات غير مباشر",
    desc: "طلب طبيعي ظاهرياً يؤدي إلى توسيع نطاق الأداة خارج متطلبات المهمة.",
    tags: ["طلب ملتبس", "صلاحية مرتفعة", "خارج نطاق المهمة"],
    matches: 7,
    confidence: "88%",
    date: "17 سبتمبر 2026",
  },
  {
    id: "X-CFS-003",
    title: "تسميم ذاكرة وكيل",
    desc: "إدخال غير موثوق يستقر في الذاكرة ويؤثر في قرارات لاحقة ضمن سياق جديد.",
    tags: ["ذاكرة طويلة", "تعليمات خفية", "انتقال سياق"],
    matches: 5,
    confidence: "91%",
    date: "16 سبتمبر 2026",
  },
]

export function listFingerprints() {
  return [...fingerprints]
}

/**
 * @param {Partial<{title:string,desc:string,tags:string[],confidence:string,date:string}>} input
 */
export function storeFingerprint(input = {}) {
  const id = `X-CFS-${String(fingerprints.length + 1).padStart(3, "0")}`
  const item = {
    id,
    title: input.title || "بصمة مستخرجة من التحقيق الحالي",
    desc: input.desc || "مسار سببي موثق أُنشئ من سيناريو التحليل التفاعلي.",
    tags: input.tags || ["مصدر غير موثوق", "تأثير قرار", "سياق متغير"],
    matches: 0,
    confidence: input.confidence || "—",
    date: input.date || new Date().toLocaleDateString("ar-SA"),
  }
  fingerprints = [...fingerprints, item]
  return item
}

/**
 * @param {string} query
 */
export function searchFingerprints(query) {
  const q = (query || "").toLowerCase()
  if (!q) return listFingerprints()
  return fingerprints.filter((f) =>
    [f.id, f.title, f.desc, ...f.tags].join(" ").toLowerCase().includes(q)
  )
}
