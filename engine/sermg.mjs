/**
 * SERMG stub — generative mutation lab.
 * Returns illustrative seeded results behind a stable contract.
 */

const TITLES = [
  "Agent + API مختلف",
  "Prompt معاد الصياغة",
  "بيانات بصيغة أخرى",
  "صلاحية مؤقتة",
]

/**
 * @param {{ signatureId?: string, count?: number }} options
 */
export function mutate(options = {}) {
  const count = Math.min(Math.max(Number(options.count) || 6, 1), 24)
  const signatureId = options.signatureId || "X-CFS-001"
  const results = Array.from({ length: count }, (_, i) => {
    const allowed = i === count - 1
    return {
      index: i + 1,
      title: TITLES[i % TITLES.length],
      similarity: allowed ? 0.62 : Number(`0.8${i % 9}`),
      outcome: allowed ? "ALLOW" : "DETECTED",
    }
  })
  return {
    signatureId,
    score: 0.91,
    results,
    illustrative: true,
  }
}
