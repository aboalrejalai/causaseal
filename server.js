import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { analyze } from "./engine/gateway.mjs"
import {
  fingerprintsAreIllustrative,
  immunizedEnvironments,
  listFingerprints,
  storeFingerprint,
} from "./engine/memory.mjs"
import { listEvents, listSessionEvents, sessionSummary } from "./engine/telemetry.mjs"

function orgFrom(url, body = {}) {
  return String(url.searchParams.get("orgId") || body.orgId || "demo")
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Prefer Next static export (`out/`), then legacy `public/`, then flattened deploy root.
const candidateRoots = [
  path.resolve(__dirname, "out"),
  path.resolve(__dirname, "public"),
  __dirname,
].filter((dir, index, all) => all.indexOf(dir) === index)

const staticRoot =
  candidateRoots.find(
    (dir) =>
      fs.existsSync(path.join(dir, "index.html")) ||
      fs.existsSync(path.join(dir, "dashboard.html"))
  ) || candidateRoots[0]

const port = parseInt(process.env.PORT || "3000", 10)
const host = process.env.HOST || "0.0.0.0"

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  })
  res.end(payload)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on("data", (chunk) => chunks.push(chunk))
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
    req.on("error", reject)
  })
}

function safePublicPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0] || "/")
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "")
  const resolved = path.resolve(staticRoot, relative)
  if (!resolved.startsWith(staticRoot + path.sep) && resolved !== staticRoot) {
    return null
  }
  return resolved
}

function resolveStaticFile(urlPath) {
  const filePath = safePublicPath(urlPath)
  if (!filePath) return null

  const candidates = []
  candidates.push(filePath)

  if (!path.extname(filePath)) {
    candidates.push(`${filePath}.html`)
    candidates.push(path.join(filePath, "index.html"))
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const index = path.join(filePath, "index.html")
    if (fs.existsSync(index) && fs.statSync(index).isFile()) return index
  }

  return null
}

function serveStatic(req, res, urlPath) {
  const target = resolveStaticFile(urlPath)
  if (!target) {
    // SPA-ish fallback for client navigations under exported routes
    const fallback = resolveStaticFile("/index.html")
    if (fallback && !path.extname(urlPath.split("?")[0] || "")) {
      const headers = { "Content-Type": MIME[".html"] }
      if (req.method === "HEAD") {
        headers["Content-Length"] = fs.statSync(fallback).size
        res.writeHead(200, headers)
        res.end()
        return
      }
      res.writeHead(200, headers)
      fs.createReadStream(fallback).pipe(res)
      return
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not Found")
    return
  }

  const ext = path.extname(target).toLowerCase()
  const type = MIME[ext] || "application/octet-stream"
  const headers = { "Content-Type": type }
  if (req.method === "HEAD") {
    headers["Content-Length"] = fs.statSync(target).size
    res.writeHead(200, headers)
    res.end()
    return
  }
  res.writeHead(200, headers)
  fs.createReadStream(target).pipe(res)
}

async function parseJsonBody(req, res) {
  const raw = await readBody(req)
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    sendJson(res, 400, { error: "Invalid JSON body" })
    return null
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`)
    const pathname = url.pathname

    if (
      req.method === "OPTIONS" &&
      (pathname.startsWith("/api/") || pathname === "/mcp")
    ) {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id",
      })
      res.end()
      return
    }

    if (pathname === "/mcp") {
      const { NodeStreamableHTTPServerTransport } = await import(
        "@modelcontextprotocol/node"
      )
      const { createCausasealMcpServer } = await import(
        "./connectors/mcp-server.mjs"
      )
      const raw = await readBody(req)
      let parsedBody
      if (raw) {
        try {
          parsedBody = JSON.parse(raw)
        } catch {
          sendJson(res, 400, { error: "Invalid JSON body" })
          return
        }
      }
      const mcp = createCausasealMcpServer()
      const transport = new NodeStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      })
      await mcp.connect(transport)
      await transport.handleRequest(req, res, parsedBody)
      return
    }

    if (pathname === "/healthz") {
      sendJson(res, 200, {
        ok: true,
        staticRoot,
        hasExport: fs.existsSync(path.join(staticRoot, "index.html")),
        hasDashboard: fs.existsSync(path.join(staticRoot, "dashboard.html")),
      })
      return
    }

    if (pathname === "/api/analyze" && req.method === "POST") {
      const body = await parseJsonBody(req, res)
      if (body === null) return
      const orgId = orgFrom(url, body)
      const result = await analyze({ ...body, orgId }, { orgId })
      sendJson(res, 200, result)
      return
    }

    if (pathname === "/api/events" && req.method === "GET") {
      const orgId = orgFrom(url)
      sendJson(res, 200, {
        events: listEvents({
          status: url.searchParams.get("status") || "all",
          q: url.searchParams.get("q") || "",
          orgId,
        }),
        illustrative: listSessionEvents(orgId).length === 0,
      })
      return
    }

    if (pathname === "/api/fingerprints" && req.method === "GET") {
      const orgId = orgFrom(url)
      sendJson(res, 200, {
        fingerprints: listFingerprints(orgId),
        illustrative: fingerprintsAreIllustrative(orgId),
      })
      return
    }

    if (pathname === "/api/fingerprints" && req.method === "POST") {
      const body = await parseJsonBody(req, res)
      if (body === null) return
      const orgId = orgFrom(url, body)
      const item = storeFingerprint(body, { orgId })
      sendJson(res, 201, { fingerprint: item })
      return
    }

    if (pathname === "/api/gateway/intercept" && req.method === "POST") {
      const body = await parseJsonBody(req, res)
      if (body === null) return
      const orgId = orgFrom(url, body)
      const result = await analyze(
        { ...body, orgId },
        { source: "intercept", rulesOnly: true, orgId }
      )
      sendJson(res, 200, { executed: false, result })
      return
    }

    if (pathname === "/api/agent/run" && req.method === "POST") {
      const body = await parseJsonBody(req, res)
      if (body === null) return
      const orgId = orgFrom(url, body)
      const { runOpsAgent } = await import("./engine/ops-agent.mjs")
      const outcome = await runOpsAgent({ ...body, orgId })
      sendJson(res, 200, outcome)
      return
    }

    if (pathname === "/api/sermg/run" && req.method === "POST") {
      const body = await parseJsonBody(req, res)
      if (body === null) return
      const orgId = orgFrom(url, body)
      const { mutate } = await import("./engine/sermg.mjs")
      sendJson(res, 200, await mutate({ ...body, orgId }))
      return
    }

    if (pathname === "/api/reports/metrics" && req.method === "GET") {
      const orgId = orgFrom(url)
      const summary = sessionSummary(orgId)
      if (!summary.hasSession) {
        sendJson(res, 200, {
          illustrative: true,
          fromSession: false,
          metrics: [],
          decisions: [],
          matchRate: 0,
          prevention: 0,
          correctAllow: 0,
        })
        return
      }
      const sermgScore = summary.sermgTotal
        ? summary.sermgDetected / summary.sermgTotal
        : 0
      sendJson(res, 200, {
        illustrative: false,
        fromSession: true,
        matchRate: summary.matchRate,
        prevention: summary.prevention,
        correctAllow: summary.correctAllow,
        metrics: [
          { label: "دقة المطابقة في الجلسة", value: summary.matchRate },
          { label: "نسبة المنع للمسارات الخطرة", value: summary.prevention },
          { label: "السماح الصحيح بالنشاط المشروع", value: summary.correctAllow },
          { label: "اكتشاف طفرات SERMG", value: sermgScore },
          { label: "متوسط الاختزال السببي", value: summary.avgReduction ?? 0 },
          {
            label: "بيئات اكتسبت المناعة",
            value: Math.min(immunizedEnvironments(orgId).length, 3) / 3,
          },
        ],
        decisions: summary.decisions,
        experiments: {
          learn: summary.blocked > 0,
          recognize: summary.matchRate > 0,
          allow: summary.correctAllow > 0,
        },
      })
      return
    }

    if (pathname === "/api/session" && req.method === "GET") {
      const orgId = orgFrom(url)
      sendJson(res, 200, {
        ...sessionSummary(orgId),
        fingerprintCount: listFingerprints(orgId).length,
      })
      return
    }

    if (pathname === "/api/compliance" && req.method === "GET") {
      const { evaluate } = await import("./engine/compliance.mjs")
      sendJson(res, 200, { controls: evaluate(), illustrative: false })
      return
    }

    if (pathname === "/dashboard.html") {
      res.writeHead(301, { Location: "/" }).end()
      return
    }

    if (req.method === "GET" || req.method === "HEAD") {
      serveStatic(req, res, pathname)
      return
    }

    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" }).end("Method Not Allowed")
  } catch (error) {
    console.error("[CAUSASEAL] Request error", error)
    sendJson(res, 500, { error: "Internal Server Error" })
  }
})

server.listen(port, host, () => {
  console.log(`[CAUSASEAL] Listening on http://${host}:${port}`)
  console.log(`[CAUSASEAL] Serving static from ${staticRoot}`)
})

server.on("error", (error) => {
  console.error("[CAUSASEAL] Failed to bind server:", error)
  process.exit(1)
})
