/**
 * Lightweight JSON state on disk. Not a database.
 * Missing file falls back to engine seeds.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const file = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data/causaseal-state.json"
)

/** @type {{ fingerprints?: unknown, sessionEvents?: unknown } | null} */
let cache = null

export function readState() {
  if (cache) return cache
  try {
    cache = JSON.parse(fs.readFileSync(file, "utf8"))
  } catch {
    cache = {}
  }
  return cache
}

/**
 * @param {Record<string, unknown>} partial
 */
export function writeState(partial) {
  const current = readState()
  cache = { ...current, ...partial }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(cache, null, 2))
  return cache
}
