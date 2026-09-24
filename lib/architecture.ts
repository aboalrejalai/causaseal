/** Honest architecture map — badges: live | simulated | later. No fake partner logos. */

export type ArchStatus = "live" | "simulated" | "later"

export type ArchNode = {
  id: string
  titleAr: string
  titleEn: string
  blurbAr: string
  blurbEn: string
  status: ArchStatus
  href?: string
}

export const ARCH_FLOW: ArchNode[] = [
  {
    id: "user",
    titleAr: "موظف / مشغّل",
    titleEn: "Employee / operator",
    blurbAr: "طلب بلغة طبيعية أو هدف تشغيلي",
    blurbEn: "Natural-language goal or ops request",
    status: "live",
  },
  {
    id: "agent",
    titleAr: "وكيل AI / عميل MCP",
    titleEn: "AI agent / MCP client",
    blurbAr: "يطلب أداة إرسال قبل التنفيذ",
    blurbEn: "Requests a send tool before execution",
    status: "live",
    href: "/connectors/mcp",
  },
  {
    id: "control",
    titleAr: "CAUSASEAL — طبقة القرار",
    titleEn: "CAUSASEAL — decision plane",
    blurbAr: "شكل مسار → بصمة → سماح / تدخل / تحقق",
    blurbEn: "Path shape → fingerprint → allow / intervene / verify",
    status: "live",
    href: "/impact",
  },
  {
    id: "channels",
    titleAr: "قنوات النداء",
    titleEn: "Call channels",
    blurbAr: "HTTP · MCP · SDK",
    blurbEn: "HTTP · MCP · SDK",
    status: "live",
    href: "/connectors",
  },
  {
    id: "effect",
    titleAr: "بوابة الأثر (محلية)",
    titleEn: "Effect gateway (local)",
    blurbAr: "عند التدخل: نسخة محذوفة فقط؛ الأصل لا يُرسل",
    blurbEn: "On intervene: redacted copy only; original not sent",
    status: "simulated",
    href: "/impact",
  },
  {
    id: "systems",
    titleAr: "EHR / بريد / قاعدة (محاكاة)",
    titleEn: "EHR / email / DB (simulated)",
    blurbAr: "صندوق صادر محلي — ليس نظامًا صحيًا حقيقيًا",
    blurbEn: "Local outbox — not a real health system",
    status: "simulated",
  },
  {
    id: "soc",
    titleAr: "مراقبة الجلسة (SOC العرض)",
    titleEn: "Session monitor (demo SOC)",
    blurbAr: "أحداث هذه الجلسة — ليس SIEM خارجيًا",
    blurbEn: "This session’s events — not an external SIEM",
    status: "live",
    href: "/monitor",
  },
]

export const ARCH_LATER: ArchNode[] = [
  {
    id: "iam",
    titleAr: "IAM / Entra",
    titleEn: "IAM / Entra",
    blurbAr: "هوية الوكيل وصلاحياته — شريحة هدف فقط",
    blurbEn: "Agent identity and scopes — target slide only",
    status: "later",
  },
  {
    id: "siem",
    titleAr: "SIEM / Syslog خارجي",
    titleEn: "External SIEM / Syslog",
    blurbAr: "تصدير أدلة للمؤسسة — خارج هذه الدفعة",
    blurbEn: "Enterprise evidence export — out of this batch",
    status: "later",
  },
]

export const STATUS_LABEL = {
  live: { ar: "موجود", en: "Live" },
  simulated: { ar: "محاكاة", en: "Simulated" },
  later: { ar: "لاحقًا", en: "Later" },
} as const

/** Three-row harness proof contract for judges. */
export const HARNESS_COMPARE_KINDS = [
  {
    kind: "mutated" as const,
    titleAr: "صياغة متغيرة",
    titleEn: "Mutated phrasing",
    expectAr: "هارنس يسمح · بصمة تتدخل · لا أصل",
    expectEn: "Harness allows · fingerprint intervenes · no original",
  },
  {
    kind: "leak" as const,
    titleAr: "تسريب معروف",
    titleEn: "Known leak",
    expectAr: "هارنس يمنع · بصمة تتدخل · لا أصل",
    expectEn: "Harness blocks · fingerprint intervenes · no original",
  },
  {
    kind: "lookalike" as const,
    titleAr: "شبيه لفظي مشروع",
    titleEn: "Lookalike (benign)",
    expectAr: "الاثنان يسمحان · أصل مُرسل",
    expectEn: "Both allow · original sent",
  },
]
