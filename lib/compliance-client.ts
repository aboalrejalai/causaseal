/** Client-safe compliance evaluate (mirrors engine/compliance.mjs). */

import type { ComplianceControl } from "@/lib/contracts"

export function evaluate(): ComplianceControl[] {
  return [
    {
      id: "NCA-1",
      framework: "NCA",
      title: "سجلات تشغيلية قابلة للتدقيق",
      status: "partial",
      notes: "تحليل الحادث يعيد سبب القرار والعقد؛ التخزين الدائم غير مفعّل بعد.",
    },
    {
      id: "NCA-2",
      framework: "NCA",
      title: "ضوابط الوصول للبيانات الحساسة",
      status: "mapped",
      notes: "بوابة القرار ترفع INTERVENE عند بيانات حساسة + وجهة غير معتمدة.",
    },
    {
      id: "OWASP-ASI01",
      framework: "OWASP",
      title: "Goal Misalignment / Prompt Injection",
      status: "partial",
      notes: "محرك القواعد يكتشف أنماط التجاوز؛ لا اعتراض حي لوكلاء بعد.",
    },
    {
      id: "OWASP-ASI02",
      framework: "OWASP",
      title: "Tool Misuse",
      status: "planned",
      notes: "مخطط لبوابة تشغيل تعترض استدعاء الأدوات قبل التنفيذ.",
    },
    {
      id: "OWASP-ASI06",
      framework: "OWASP",
      title: "Memory Poisoning",
      status: "mapped",
      notes: "بصمة X-CFS-003 تمثل نمط تسميم الذاكرة كنموذج أولي.",
    },
  ]
}
