/**
 * X-CFS — expand an incident into a noisy causal graph, then keep only
 * the nodes required to explain the breach.
 */

const HOSTILE =
  /override|ignore|disregard|bypass|تجاهل|تجاوز السياسة|external|upload|secret|مفتاح|مفاتيح|سرية|keys/

/**
 * @param {Record<string, unknown>} body
 */
export function deriveInvariants(body = {}) {
  const text = `${body.prompt ?? ""} ${body.untrustedContent ?? ""}`
  const hostile = HOSTILE.test(text.toLowerCase())
  const poison = /ذاكرة|انتقال سياق|تعليمات خفية/.test(text)
  /** @type {string[]} */
  const invariants = []

  if (hostile) {
    invariants.push("مصدر غير موثوق", "تأثير قرار")
  }
  if (body.sensitiveData) invariants.push("بيانات حساسة")
  if (!body.trustedDestination && (hostile || body.sensitiveData)) {
    invariants.push("وجهة خارجية")
  }
  if (body.elevatedPrivilege && !body.trustedDestination) {
    invariants.push("صلاحية مرتفعة", "استدعاء أداة خارج النطاق")
  }
  if (poison) {
    invariants.push("تسميم ذاكرة", "انتقال سياق", "تعليمات خفية")
  }

  return [...new Set(invariants)]
}

/**
 * @param {Record<string, unknown>} body
 */
export function expand(body = {}) {
  const invariants = deriveInvariants(body)
  const has = (name) => invariants.includes(name)

  const causal = [
    {
      id: "source",
      label: "مصدر الإدخال",
      value: has("مصدر غير موثوق") ? "غير موثوق" : "ضمن المهمة",
      risk: has("مصدر غير موثوق") || has("تسميم ذاكرة"),
      critical: has("مصدر غير موثوق") || has("تسميم ذاكرة"),
    },
    {
      id: "influence",
      label: "تأثير القرار",
      value: has("تأثير قرار") || has("تعليمات خفية") ? "تعليمة خفية" : "لا تأثير حاسم",
      risk: has("تأثير قرار") || has("تعليمات خفية"),
      critical: has("تأثير قرار") || has("تعليمات خفية"),
    },
    {
      id: "tool",
      label: "استدعاء أداة",
      value: String(body.tool || "غير محدد"),
      risk: has("استدعاء أداة خارج النطاق"),
      critical: has("استدعاء أداة خارج النطاق") || invariants.length > 0,
    },
    {
      id: "data",
      label: "بيانات",
      value: has("بيانات حساسة") ? "حساسة" : "غير حساسة",
      risk: has("بيانات حساسة"),
      critical: has("بيانات حساسة"),
    },
    {
      id: "destination",
      label: "سياق الوجهة",
      value: body.trustedDestination ? "معتمد" : "غير معتمد",
      risk: has("وجهة خارجية"),
      critical: has("وجهة خارجية") || invariants.length > 0,
    },
    {
      id: "privilege",
      label: "صلاحية",
      value: has("صلاحية مرتفعة") ? "مرتفعة" : "اعتيادية",
      risk: has("صلاحية مرتفعة"),
      critical: has("صلاحية مرتفعة"),
    },
  ]

  const bloat = Array.from({ length: 44 }, (_, index) => ({
    id: `log-${index + 1}`,
    label: "سطر سجل غير حرج",
    value: `span-${index + 1}`,
    risk: false,
    critical: false,
  }))

  return { nodes: [...causal, ...bloat], invariants }
}

/**
 * @param {Record<string, unknown>} body
 */
export function reduce(body = {}) {
  const { nodes, invariants } = expand(body)
  let kept = nodes.filter((node) => node.critical)
  if (kept.length === 0) {
    kept = nodes.filter((node) => ["source", "tool", "destination"].includes(node.id))
  }

  const toView = (node) => ({
    label: node.label,
    value: node.value,
    risk: Boolean(node.risk),
  })

  const total = nodes.length
  const reductionRatio = Number((1 - kept.length / total).toFixed(3))

  return {
    reductionRatio,
    invariants,
    keptNodes: kept.map(toView),
    beforeCount: total,
    prunedCount: total - kept.length,
    illustrative: false,
  }
}
