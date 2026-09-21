#!/usr/bin/env node
/**
 * Dev helper: API server on :4000 + Next.js on :3000 (rewrites /api to :4000).
 */
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import path from "node:path"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const api = spawn(process.execPath, ["server.js"], {
  cwd: root,
  env: { ...process.env, PORT: process.env.API_PORT || "4000" },
  stdio: "inherit",
})

const next = spawn("npx", ["next", "dev", "-p", process.env.WEB_PORT || "3000"], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
  shell: true,
})

function shutdown(code = 0) {
  api.kill("SIGTERM")
  next.kill("SIGTERM")
  process.exit(code)
}

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))
api.on("exit", (code) => {
  if (code && code !== 0) shutdown(code)
})
next.on("exit", (code) => {
  if (code && code !== 0) shutdown(code)
})
