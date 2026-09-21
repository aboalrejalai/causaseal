/** Client-safe re-exports of seeded engine data (no server secrets). */

export const SEED_EVENTS = [
  {
    time: "09:42:18",
    agent: "Finance Copilot",
    tool: "send_to_workspace",
    path: "أداة إرسال → بيانات حساسة → وجهة غير معتمدة",
    status: "blocked" as const,
    label: "INTERVENE",
    confidence: "—",
  },
]

export const SEED_FINGERPRINTS = [
  {
    id: "X-CFS-001",
    title: "مسار تسريب عبر أداة إرسال ووجهة غير معتمدة",
    desc: "تعليمة في النص المسترجع مع بيانات حساسة وأداة إرسال إلى وجهة غير معتمدة.",
    tags: ["أداة إرسال", "بيانات حساسة", "وجهة غير معتمدة", "تعليمة في النص المسترجع"],
    invariants: ["أداة إرسال", "بيانات حساسة", "وجهة غير معتمدة", "تعليمة في النص المسترجع"],
    environment: "dev" as const,
    matches: 0,
    confidence: "—",
    date: "18 سبتمبر 2026",
  },
  {
    id: "X-CFS-002",
    title: "تصعيد صلاحيات مع أداة إرسال",
    desc: "صلاحية مرتفعة مع أداة إرسال إلى وجهة غير معتمدة.",
    tags: ["صلاحية مرتفعة", "أداة إرسال", "وجهة غير معتمدة"],
    invariants: ["صلاحية مرتفعة", "أداة إرسال", "وجهة غير معتمدة"],
    environment: "enterprise" as const,
    matches: 0,
    confidence: "—",
    date: "17 سبتمبر 2026",
  },
  {
    id: "X-CFS-003",
    title: "تعليمة مسترجعة قبل استعلام",
    desc: "تعليمة في النص المسترجع تؤثر على قرار لاحق في سياق جديد.",
    tags: ["تعليمة في النص المسترجع"],
    invariants: ["تعليمة في النص المسترجع"],
    environment: "cloud" as const,
    matches: 0,
    confidence: "—",
    date: "16 سبتمبر 2026",
  },
]
