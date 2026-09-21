/**
 * X-CFS stub — regressive graph pruning.
 * Contract only; algorithm lands later.
 */

/**
 * @param {{ nodes?: Array<{ label: string, value: string, risk: boolean }> }} graph
 */
export function reduce(graph = {}) {
  const nodes = graph.nodes || []
  const invariants = nodes.filter((n) => n.risk).map((n) => n.label)
  return {
    signature: invariants.length ? "X-CFS-001" : "PARTIAL-MATCH",
    reductionRatio: 0.91,
    invariants: invariants.length
      ? invariants
      : ["مصدر غير موثوق", "تأثير قرار", "وجهة خارجية"],
    illustrative: true,
  }
}
