import { accessSync, constants, existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const outDir = path.join(root, "out")
const entry = path.join(root, "server.js")

accessSync(entry, constants.R_OK)

if (!existsSync(path.join(outDir, "index.html"))) {
  throw new Error(
    "Static export missing out/index.html. Run `next build` (output: export) before hostinger-build."
  )
}

console.log("[CAUSASEAL] Hostinger build OK")
console.log("[CAUSASEAL] entry=server.js")
console.log(`[CAUSASEAL] static=${outDir}`)
