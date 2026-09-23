/** Client-only illustrative chart/session shapes for first paint. Replaced when live session exists. */

import type { AgentEvent, MutationResult } from "@/lib/contracts"

export const DEMO_SESSION_STATS = {
  blocked: 4,
  fingerprintCount: 3,
  matchRate: 0.75,
  lastLatencyMs: 42,
  riskScore: 48,
  eventCount: 10,
}

export const DEMO_EVENTS: AgentEvent[] = [
  {
    time: "09:42:18",
    agent: "Finance Copilot",
    tool: "send_to_workspace",
    path: "أداة إرسال → بيانات حساسة → وجهة غير معتمدة",
    status: "blocked",
    label: "INTERVENE",
    confidence: "—",
  },
  {
    time: "09:44:02",
    agent: "Operations Assistant",
    tool: "send_to_workspace",
    path: "أداة إرسال → بيانات حساسة → وجهة غير معتمدة",
    status: "blocked",
    label: "INTERVENE",
    confidence: "—",
  },
  {
    time: "09:46:11",
    agent: "HR Assistant",
    tool: "send_to_workspace",
    path: "ملخص تشغيلي → وجهة معتمدة",
    status: "allowed",
    label: "ALLOW",
    confidence: "—",
  },
  {
    time: "09:48:30",
    agent: "Operations Agent",
    tool: "export_document",
    path: "أداة إرسال → بيانات حساسة → وجهة غير معتمدة",
    status: "blocked",
    label: "INTERVENE",
    confidence: "—",
  },
  {
    time: "09:51:05",
    agent: "Finance Copilot",
    tool: "send_to_workspace",
    path: "يشبه الخطر لفظيًا · السبب مختلف",
    status: "allowed",
    label: "ALLOW",
    confidence: "—",
  },
  {
    time: "09:53:22",
    agent: "Operations Assistant",
    tool: "send_to_workspace",
    path: "تعليمة في المسترجع · يحتاج تحقق",
    status: "verify",
    label: "VERIFY",
    confidence: "—",
  },
  {
    time: "09:55:40",
    agent: "Operations Assistant",
    tool: "send_to_workspace",
    path: "أداة إرسال → بيانات حساسة → وجهة غير معتمدة",
    status: "blocked",
    label: "INTERVENE",
    confidence: "—",
  },
  {
    time: "09:58:01",
    agent: "HR Assistant",
    tool: "send_to_workspace",
    path: "ملخص معتمد → مساحة الفريق",
    status: "allowed",
    label: "ALLOW",
    confidence: "—",
  },
  {
    time: "10:01:14",
    agent: "Operations Agent",
    tool: "export_document",
    path: "عبر السياق · نفس الثوابت",
    status: "blocked",
    label: "INTERVENE",
    confidence: "—",
  },
  {
    time: "10:03:50",
    agent: "Finance Copilot",
    tool: "send_to_workspace",
    path: "مسار مشروع بدون بيانات حساسة",
    status: "allowed",
    label: "ALLOW",
    confidence: "—",
  },
]

export const DEMO_METRICS: Array<{ label: string; value: number }> = [
  { label: "دقة المطابقة في الجلسة", value: 0.75 },
  { label: "نسبة المنع للمسارات الخطرة", value: 0.8 },
  { label: "السماح الصحيح بالنشاط المشروع", value: 0.9 },
  { label: "اكتشاف طفرات SERMG", value: 0.72 },
  { label: "متوسط الاختزال السببي", value: 0.55 },
  { label: "بيئات اكتسبت المناعة", value: 0.67 },
]

export const DEMO_LAB_SCORE = 0.83

export const DEMO_LAB_RESULTS: MutationResult[] = [
  {
    index: 1,
    title: "تغيير الـPrompt مع بقاء الثوابت",
    similarity: 0.91,
    outcome: "DETECTED",
    immunized: false,
    crossContext: true,
    learnedIn: "dev",
    appliedIn: "cloud",
  },
  {
    index: 2,
    title: "أداة مختلفة · نفس الوجهة غير المعتمدة",
    similarity: 0.88,
    outcome: "DETECTED",
    immunized: false,
    crossContext: true,
    learnedIn: "dev",
    appliedIn: "enterprise",
  },
  {
    index: 3,
    title: "نوع بيانات متغيّر · السبب باقٍ",
    similarity: 0.84,
    outcome: "DETECTED",
    immunized: true,
    crossContext: false,
    learnedIn: null,
    appliedIn: "cloud",
  },
  {
    index: 4,
    title: "شكل يشبه الخطر · السبب مكسور",
    similarity: 0.41,
    outcome: "ALLOW",
    immunized: false,
    crossContext: false,
    learnedIn: null,
    appliedIn: "dev",
  },
  {
    index: 5,
    title: "صلاحية مرتفعة مع أداة إرسال",
    similarity: 0.79,
    outcome: "DETECTED",
    immunized: false,
    crossContext: true,
    learnedIn: "enterprise",
    appliedIn: "cloud",
  },
  {
    index: 6,
    title: "مسار مشروع بعد إعادة الصياغة",
    similarity: 0.33,
    outcome: "ALLOW",
    immunized: false,
    crossContext: false,
    learnedIn: null,
    appliedIn: "cloud",
  },
]

export type DemoImpactRow = {
  kind: string
  decision: string
  delivered: boolean
  deliveredOriginal?: boolean
  change: string
  harness?: string
  crossContext?: boolean
  intervention?: string | null
}

export const DEMO_IMPACT_ROWS: DemoImpactRow[] = [
  {
    kind: "تسريب معروف — هارنس والبصمة معًا",
    decision: "INTERVENE",
    delivered: true,
    deliveredOriginal: false,
    change: "نسخة محذوفة بدل الأصل",
    harness: "BLOCK",
    intervention: "redact-sensitive",
  },
  {
    kind: "صياغة متغيرة — هارنس يسمح، البصمة تمنع",
    decision: "INTERVENE",
    delivered: true,
    deliveredOriginal: false,
    change: "هارنس ALLOW · بصمة INTERVENE",
    harness: "ALLOW",
    intervention: "redact-sensitive",
  },
  {
    kind: "يشبه الخطر لفظيًا — السبب مختلف → سماح",
    decision: "ALLOW",
    delivered: true,
    deliveredOriginal: true,
    change: "السبب مكسور فلا منع",
    harness: "ALLOW",
    intervention: null,
  },
  {
    kind: "مسار مشروع → سماح",
    decision: "ALLOW",
    delivered: true,
    deliveredOriginal: true,
    change: "وجهة معتمدة بلا بيانات حساسة",
    harness: "ALLOW",
    intervention: null,
  },
  {
    kind: "نفس الثوابت في المؤسسة",
    decision: "INTERVENE",
    delivered: true,
    deliveredOriginal: false,
    change: "عبر السياق · نسخة محذوفة",
    harness: "BLOCK",
    crossContext: true,
    intervention: "redact-sensitive",
  },
]
