/**
 * Lightweight JSON state on disk. Not a database.
 * Missing file falls back to engine seeds.
 * CAUSASEAL_STATE_PATH overrides the path (tests use a temp file).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

function stateFile() {
  if (process.env.CAUSASEAL_STATE_PATH) {
    return path.resolve(process.env.CAUSASEAL_STATE_PATH)
  }
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../data/causaseal-state.json"
  )
}

/** @type {{ fingerprints?: unknown, sessionEvents?: unknown, orgs?: Record<string, unknown> } | null} */
let cache = null

export function resetPersistCache() {
  cache = null
}

export function readState() {
  if (cache) return cache
  try {
    cache = JSON.parse(fs.readFileSync(stateFile(), "utf8"))
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
  const file = stateFile()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(cache, null, 2))
  return cache
}
