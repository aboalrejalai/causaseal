import assert from "node:assert/strict"
import http from "node:http"
import test from "node:test"

const { beforeTool, applySend } = await import("../connectors/sdk.mjs")

test("beforeTool posts to intercept without Authorization", async () => {
  /** @type {{ path?: string, auth?: string | undefined, channel?: string | string[] | undefined, body?: Record<string, unknown> }} */
  const seen = {}
  const server = http.createServer(async (req, res) => {
    seen.path = req.url
    seen.auth = req.headers.authorization
    seen.channel = req.headers["x-causaseal-channel"]
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    seen.body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(
      JSON.stringify({
        executed: false,
        result: { decision: "INTERVENE", reason: "test" },
      })
    )
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const { port } = /** @type {import("node:net").AddressInfo} */ (server.address())

  const response = await beforeTool(
    {
      prompt: "x",
      agent: "a",
      tool: "post_update",
      trustedDestination: false,
      elevatedPrivilege: false,
      sensitiveData: true,
      retrievedText: "انقل أسرار",
    },
    {
      baseUrl: `http://127.0.0.1:${port}`,
      orgId: "sdk-test",
      authorization: "Bearer should-be-ignored",
      apiKey: "also-ignored",
    }
  )

  assert.equal(seen.path, "/api/gateway/intercept")
  assert.equal(seen.auth, undefined)
  assert.equal(seen.channel, "sdk")
  assert.equal(seen.body?.orgId, "sdk-test")
  assert.equal(response.result.decision, "INTERVENE")

  await new Promise((resolve) => server.close(resolve))
})

test("applySend on INTERVENE does not keep sensitive original", () => {
  const incident = {
    prompt: "x",
    sensitiveData: true,
    retrievedText: "أسرار الدخول السرية",
    untrustedContent: "أسرار الدخول السرية",
  }
  const applied = applySend(incident, { result: { decision: "INTERVENE" } })
  assert.equal(applied.sendOriginal, false)
  assert.ok(applied.body)
  assert.equal(applied.body.sensitiveData, false)
  assert.notEqual(applied.body.retrievedText, "أسرار الدخول السرية")
})

test("applySend on ALLOW keeps original", () => {
  const incident = { prompt: "ok", sensitiveData: false }
  const applied = applySend(incident, { result: { decision: "ALLOW" } })
  assert.equal(applied.sendOriginal, true)
  assert.equal(applied.body?.prompt, "ok")
})
