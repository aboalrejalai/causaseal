import assert from "node:assert/strict"
import http from "node:http"
import test from "node:test"
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client"
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node"

import {
  createCausasealMcpServer,
  MCP_READ_ONLY_TOOLS,
  MCP_TOOL_NAMES,
} from "../connectors/mcp-server.mjs"

/**
 * @returns {Promise<{ url: string, close: () => Promise<void> }>}
 */
async function listenMcp() {
  const httpServer = http.createServer(async (req, res) => {
    if (!req.url?.startsWith("/mcp")) {
      res.writeHead(404).end()
      return
    }
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const raw = Buffer.concat(chunks).toString("utf8")
    let body
    if (raw) {
      try {
        body = JSON.parse(raw)
      } catch {
        res.writeHead(400).end()
        return
      }
    }
    const mcp = createCausasealMcpServer()
    const transport = new NodeStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    })
    await mcp.connect(transport)
    await transport.handleRequest(req, res, body)
  })

  await new Promise((resolve) => httpServer.listen(0, "127.0.0.1", resolve))
  const { port } = /** @type {import("node:net").AddressInfo} */ (httpServer.address())
  return {
    url: `http://127.0.0.1:${port}/mcp`,
    close: () => new Promise((resolve) => httpServer.close(resolve)),
  }
}

test("MCP /mcp lists 10 tools without Authorization; five are read-only", async () => {
  const { url, close } = await listenMcp()

  const client = new Client({ name: "connectors-test", version: "1.0.0" })
  const transport = new StreamableHTTPClientTransport(new URL(url))
  await client.connect(transport)

  const listed = await client.listTools()
  const names = listed.tools.map((tool) => tool.name).sort()
  assert.deepEqual(names, [...MCP_TOOL_NAMES].sort())
  assert.equal(listed.tools.length, 10)

  const readOnly = listed.tools.filter((tool) => tool.annotations?.readOnlyHint === true)
  assert.equal(readOnly.length, 5)
  for (const tool of readOnly) {
    assert.ok(MCP_READ_ONLY_TOOLS.has(tool.name))
  }

  for (const tool of listed.tools) {
    assert.ok(tool.title, `${tool.name} must have an English title`)
    assert.match(tool.title, /^[A-Za-z0-9 /:-]+$/, `${tool.name} title must be English ASCII`)
  }

  await client.close()
  await close()
})

test("MCP tools/call works without Authorization and is not Claude approval text", async () => {
  const { url, close } = await listenMcp()

  const client = new Client({ name: "connectors-call-test", version: "1.0.0" })
  const transport = new StreamableHTTPClientTransport(new URL(url))
  await client.connect(transport)

  const session = await client.callTool({
    name: "causaseal_get_session",
    arguments: { orgId: "saif-test", response_format: "markdown" },
  })
  assert.equal(session.isError, undefined)
  const sessionText = String(session.content?.[0]?.text || "")
  assert.ok(!sessionText.includes("No approval received"))
  assert.match(sessionText, /Session|جلسة/)

  const compliance = await client.callTool({
    name: "causaseal_list_compliance",
    arguments: { response_format: "markdown" },
  })
  assert.equal(compliance.isError, undefined)
  const complianceText = String(compliance.content?.[0]?.text || "")
  assert.ok(!complianceText.includes("No approval received"))
  assert.match(complianceText, /NCA-1|Controls|ضوابط/)

  await client.close()
  await close()
})
