/**
 * X-CFS — derive structural causal invariants from the tool-path shape,
 * then keep only the nodes required to explain the breach.
 */

export const SEND_TOOLS = new Set([
  "send_to_workspace",
  "export_document",
  "share_document",
  "invoke_vendor_api",
])

const DIRECTIVE =
  /أرسل|انقل|تجاهل|send|export|ignore|override|disregard|bypass/i

/**
 * @param {Record<string, unknown>} body
 */
export function retrievedTextOf(body = {}) {
  if (typeof body.retrievedText === "string" && body.retrievedText.length) {
    return body.retrievedText
  }
  return String(body.untrustedContent ?? "")
}

/**
 * Directive verb in retrieved text that is absent from the user prompt.
 * @param {string} prompt
 * @param {string} retrieved
 */
export function hasDirectiveInRetrieved(prompt, retrieved) {
  if (!retrieved.trim()) return false
  const retrievedHit = DIRECTIVE.test(retrieved)
  if (!retrievedHit) return false
  return !DIRECTIVE.test(prompt || "")
}

/**
 * @param {Record<string, unknown>} body
 */
export function deriveInvariants(body = {}) {
  const tool = String(body.tool || "")
  const isSend = SEND_TOOLS.has(tool)
  const prompt = String(body.prompt ?? "")
  const retrieved = retrievedTextOf(body)
  /** @type {string[]} */
  const invariants = []

  if (isSend) invariants.push("أداة إرسال")
  if (body.sensitiveData) invariants.push("بيانات حساسة")
  if (isSend && !body.trustedDestination) invariants.push("وجهة غير معتمدة")
  if (hasDirectiveInRetrieved(prompt, retrieved)) {
    invariants.push("تعليمة في النص المسترجع")
  }
  if (body.elevatedPrivilege && !body.trustedDestination) {
    invariants.push("صلاحية مرتفعة")
  }

  return [...new Set(invariants)]
}

/**
 * @param {Record<string, unknown>} body
 */
export function expand(body = {}) {
  const invariants = deriveInvariants(body)
  const has = (name) => invariants.includes(name)
  const steps = Array.isArray(body.steps) ? body.steps : []

  const stepNodes = steps.map((step, index) => ({
    id: `step-${index + 1}`,
    label: "نداء سابق",
    value: `${step?.tool || "tool"}: ${step?.summary || ""}`,
    risk: false,
    critical: false,
  }))

  const causal = [
    {
      id: "source",
      label: "مصدر الإدخال",
      value: has("تعليمة في النص المسترجع") ? "نص مسترجع موجّه" : "ضمن المهمة",
      risk: has("تعليمة في النص المسترجع"),
      critical: has("تعليمة في النص المسترجع"),
    },
    {
      id: "influence",
      label: "تأثير القرار",
      value: has("تعليمة في النص المسترجع") ? "تعليمة في المسترجع" : "لا تأثير حاسم",
      risk: has("تعليمة في النص المسترجع"),
      critical: has("تعليمة في النص المسترجع"),
    },
    {
      id: "tool",
      label: "استدعاء أداة",
      value: String(body.tool || "غير محدد"),
      risk: has("أداة إرسال") && has("وجهة غير معتمدة"),
      critical: has("أداة إرسال"),
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
      risk: has("وجهة غير معتمدة"),
      critical: has("وجهة غير معتمدة"),
    },
    {
      id: "privilege",
      label: "صلاحية",
      value: has("صلاحية مرتفعة") ? "مرتفعة" : "اعتيادية",
      risk: has("صلاحية مرتفعة"),
      critical: has("صلاحية مرتفعة"),
    },
  ]

  return { nodes: [...stepNodes, ...causal], invariants }
}

/**
 * @param {Record<string, unknown>} body
 */
export function reduce(body = {}) {
  const { nodes, invariants } = expand(body)
  const steps = Array.isArray(body.steps) ? body.steps : []
  let kept = nodes.filter((node) => node.critical)
  if (kept.length === 0) {
    kept = nodes.filter((node) => ["source", "tool", "destination"].includes(node.id))
  }

  const toView = (node) => ({
    label: node.label,
    value: node.value,
    risk: Boolean(node.risk),
  })

  const beforeCount = steps.length + 6
  const keptCount = kept.length
  const reductionRatio = Number((1 - keptCount / Math.max(beforeCount, 1)).toFixed(3))

  return {
    reductionRatio,
    invariants,
    keptNodes: kept.map(toView),
    beforeCount,
    prunedCount: Math.max(beforeCount - keptCount, 0),
    illustrative: false,
  }
}
