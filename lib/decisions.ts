export const DECISION_LABELS: Record<string, string> = {
  ALLOW: "سماح",
  VERIFY: "تحقق بشري",
  INTERVENE: "منع قبل الأداة",
  DELIVERED: "تم الإرسال",
  DETECTED: "اكتشاف",
}

export function decisionLabel(code: string) {
  return DECISION_LABELS[code] || code
}

export function formatDecision(code: string) {
  const ar = decisionLabel(code)
  return ar === code ? code : `${ar} · ${code}`
}
