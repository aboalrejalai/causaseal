// Composition time t <-> output time u (piecewise linear, from timemap.json).
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const K = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "timemap.json"), "utf8")).knots
function interp(x, from, to) {
  for (let i = 1; i < K.length; i++) {
    const [a0, a1] = [K[i - 1][from], K[i][from]]
    if (x <= a1 || i === K.length - 1) return K[i - 1][to] + ((x - a0) / (a1 - a0)) * (K[i][to] - K[i - 1][to])
  }
}
export const tToU = (t) => interp(t, 0, 1)
export const uToT = (u) => interp(u, 1, 0)
export const U_END = K[K.length - 1][1]
