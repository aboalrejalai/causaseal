/**
 * Compliance from session evidence. Production agent fleets stay out of scope.
 */

import { listFingerprints } from "./memory.mjs"
import { listSessionEvents } from "./telemetry.mjs"

export function evaluate() {
  const events = listSessionEvents()
  const fingerprints = listFingerprints()
  const hasLog = events.length > 0
  const sensitiveBlock = events.some(
    (event) =>
      event.status === "blocked" &&
      String(event.path || "").includes("بيانات حساسة") &&
      String(event.path || "").includes("وجهة غير معتمدة")
  )
  const injectionBlock = events.some(
    (event) => event.status === "blocked" && String(event.matchedSignature || "").startsWith("X-CFS")
  )
  const intercepted = events.some((event) => event.source === "intercept")
  const memoryPoison = fingerprints.some((fingerprint) =>
    (fingerprint.invariants || []).includes("تعليمة في النص المسترجع")
  )

  return [
    {
      id: "NCA-1",
      framework: "NCA",
      title: "سجلات تشغيلية قابلة للتدقيق",
      status: hasLog ? "mapped" : "partial",
      notes: hasLog
        ? "قرارات الجلسة محفوظة في ملف الحالة مع السبب والبصمة."
        : "التخزين على القرص جاهز؛ لم تُسجَّل قرارات في هذه الجلسة بعد.",
    },
    {
      id: "NCA-2",
      framework: "NCA",
      title: "ضوابط الوصول للبيانات الحساسة",
      status: sensitiveBlock ? "mapped" : "partial",
      notes: sensitiveBlock
        ? "الجلسة تحتوي منعًا لبيانات حساسة متجهة إلى وجهة غير معتمدة."
        : "القاعدة جاهزة؛ شغّل حادثة تسريب ليظهر الدليل في الجلسة.",
    },
    {
      id: "OWASP-ASI01",
      framework: "OWASP",
      title: "Goal Misalignment / Prompt Injection",
      status: injectionBlock ? "mapped" : "partial",
      notes: injectionBlock
        ? "البوابة منعت مسارًا طابق بصمة سببية معروفة."
        : "المطابقة تعمل؛ لم يُمنع حقن في هذه الجلسة بعد.",
    },
    {
      id: "OWASP-ASI02",
      framework: "OWASP",
      title: "Tool Misuse",
      status: intercepted ? "mapped" : "planned",
      notes: intercepted
        ? "محاكي الوكيل اعترض استدعاء الأداة قبل التنفيذ. أسطول إنتاج حقيقي خارج النطاق."
        : "اعتراض أسطول وكلاء إنتاج غير موصول. المحاكي في المراقبة يغطي العرض.",
    },
    {
      id: "OWASP-ASI06",
      framework: "OWASP",
      title: "Memory Poisoning",
      status: memoryPoison ? "mapped" : "planned",
      notes: memoryPoison
        ? "بصمة تعليمة في النص المسترجع موجودة وتُستخدم في المطابقة."
        : "لا توجد بصمة تعليمة مسترجعة بعد.",
    },
  ]
}
