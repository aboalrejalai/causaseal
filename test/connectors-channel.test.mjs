import assert from "node:assert/strict"
import fs from "node:fs"
import http from "node:http"
import os from "node:os"
import path from "node:path"
import test from "node:test"

const statePath = path.join(
  os.tmpdir(),
  `causaseal-channel-${process.pid}-${Date.now()}.json`
)
process.env.CAUSASEAL_STATE_PATH = statePath

const { resetPersistCache } = await import("../engine/persist.mjs")
resetPersistCache()
const { resetTelemetryCache, sessionSummary } = await import(
  "../engine/telemetry.mjs"
)
resetTelemetryCache()

const { analyze } = await import("../engine/gateway.mjs")
const { MUTATED_LEAK } = await import("../engine/fixtures/novel-leak.mjs")
const { getSession, interceptTool } = await import("../connectors/service.mjs")

test.after(() => {
  try {
    fs.unlinkSync(statePath)
  } catch {
    /* ignore */
  }
})

test("analyze with channel sdk is counted under channels.sdk", async () => {
  resetTelemetryCache()
  resetPersistCache()
  await analyze(
    { ...MUTATED_LEAK, orgId: "ch-sdk" },
    { source: "intercept", rulesOnly: true, orgId: "ch-sdk", channel: "sdk" }
  )
  const summary = sessionSummary("ch-sdk")
  assert.equal(summary.channels.sdk, 1)
  assert.equal(summary.channels.http, 0)
  assert.equal(summary.channels.mcp, 0)
})

test("mcp read notes channel mcp", () => {
  resetTelemetryCache()
  resetPersistCache()
  getSession({ orgId: "ch-mcp", channel: "mcp" })
  const summary = sessionSummary("ch-mcp")
  assert.ok(summary.channels.mcp >= 1)
  assert.equal(summary.connectorMcp.reads, 1)
})

test("interceptTool with channel mcp records mcp", async () => {
  resetTelemetryCache()
  resetPersistCache()
  await interceptTool({ ...MUTATED_LEAK, orgId: "ch-mcp2", channel: "mcp" })
  const summary = sessionSummary("ch-mcp2")
  assert.ok(summary.channels.mcp >= 1)
  assert.ok(summary.connectorMcp.writes >= 1)
})

test("HTTP server maps X-Causaseal-Channel sdk", async () => {
  // Smoke via analyze path already covered; keep lightweight header parsing unit via channelFrom logic
  const { beforeTool } = await import("../connectors/sdk.mjs")
  /** @type {{ channel?: string }} */
  const seen = {}
  const server = http.createServer(async (req, res) => {
    seen.channel = String(req.headers["x-causaseal-channel"] || "")
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ executed: false, result: { decision: "ALLOW" } }))
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const { port } = /** @type {import("node:net").AddressInfo} */ (server.address())
  await beforeTool(
    {
      prompt: "x",
      agent: "a",
      tool: "send_to_workspace",
      trustedDestination: true,
      elevatedPrivilege: false,
      sensitiveData: false,
    },
    { baseUrl: `http://127.0.0.1:${port}`, orgId: "hdr" }
  )
  assert.equal(seen.channel, "sdk")
  await new Promise((resolve) => server.close(resolve))
})
