/** Catalog of how partners attach to CAUSASEAL — honest status from the repo. */

export type ConnectorKind = "http" | "mcp" | "sdk"

export type ConnectorTool = {
  name: string
  readOnly: boolean
  summaryAr: string
  summaryEn: string
}

export type ConnectorCard = {
  id: ConnectorKind
  titleAr: string
  titleEn: string
  statusAr: string
  statusEn: string
  hookAr: string
  hookEn: string
  endpoints?: string[]
  tools?: ConnectorTool[]
  sdkExport?: string
  unpublishedNoteAr?: string
  unpublishedNoteEn?: string
}

export const MCP_TOOLS: ConnectorTool[] = [
  {
    name: "causaseal_get_session",
    readOnly: true,
    summaryAr: "ملخص جلسة الجهة",
    summaryEn: "Org session summary",
  },
  {
    name: "causaseal_list_events",
    readOnly: true,
    summaryAr: "أحداث المراقبة",
    summaryEn: "Monitor events",
  },
  {
    name: "causaseal_list_fingerprints",
    readOnly: true,
    summaryAr: "ذاكرة X-CFS",
    summaryEn: "X-CFS fingerprints",
  },
  {
    name: "causaseal_get_report",
    readOnly: true,
    summaryAr: "مقاييس الجلسة",
    summaryEn: "Session metrics",
  },
  {
    name: "causaseal_list_compliance",
    readOnly: true,
    summaryAr: "ضوابط الامتثال",
    summaryEn: "Compliance controls",
  },
  {
    name: "causaseal_intercept_tool",
    readOnly: false,
    summaryAr: "اعتراض قبل أداة الإرسال",
    summaryEn: "Intercept before send tool",
  },
  {
    name: "causaseal_run_agent",
    readOnly: false,
    summaryAr: "حلقة التجربة (هارنس مقابل بصمة)",
    summaryEn: "Demo loop (harness vs fingerprint)",
  },
  {
    name: "causaseal_analyze_path",
    readOnly: false,
    summaryAr: "تحليل مسار وتسجيل",
    summaryEn: "Analyze path and record",
  },
  {
    name: "causaseal_store_fingerprint",
    readOnly: false,
    summaryAr: "حفظ بصمة",
    summaryEn: "Store fingerprint",
  },
  {
    name: "causaseal_run_sermg",
    readOnly: false,
    summaryAr: "طفرات المختبر",
    summaryEn: "SERMG mutations",
  },
]

export const CONNECTOR_CARDS: ConnectorCard[] = [
  {
    id: "http",
    titleAr: "HTTP API",
    titleEn: "HTTP API",
    statusAr: "جاهز",
    statusEn: "Ready",
    hookAr: "نداء واحد قبل أداة الإرسال من أي نظام يقدر يرسل JSON.",
    hookEn: "One call before the send tool from any system that can POST JSON.",
    endpoints: [
      "POST /api/gateway/intercept",
      "POST /api/agent/run",
    ],
  },
  {
    id: "mcp",
    titleAr: "MCP",
    titleEn: "MCP",
    statusAr: "جاهز — رابط بلا مفتاح",
    statusEn: "Ready — URL, no key",
    hookAr:
      "الصق الرابط في Cursor أو Claude أو ChatGPT. يقرأ ويكتب في حالة النموذج من أول اتصال، بلا OAuth وبلا مفتاح.",
    hookEn:
      "Paste the URL into Cursor, Claude, or ChatGPT. Reads and writes demo state on first connect — no OAuth, no key.",
    tools: MCP_TOOLS,
  },
  {
    id: "sdk",
    titleAr: "SDK (Node)",
    titleEn: "SDK (Node)",
    statusAr: "جاهز كملف في المستودع",
    statusEn: "Ready as a repo file",
    hookAr: "beforeTool يغلّف نداء الشريك قبل الأداة؛ applySend يطبّق السماح أو النسخة المحذوفة.",
    hookEn: "beforeTool wraps the partner call; applySend applies allow or redacted body.",
    sdkExport: "connectors/sdk.mjs → beforeTool, applySend",
    unpublishedNoteAr: "غير منشور على npm.",
    unpublishedNoteEn: "Not published to npm.",
  },
]

export const INCIDENT_FIELDS = [
  "prompt",
  "untrustedContent",
  "retrievedText",
  "agent",
  "tool",
  "trustedDestination",
  "elevatedPrivilege",
  "sensitiveData",
  "environment",
  "orgId",
  "steps",
  "preferRules",
] as const

export const RUN_AGENT_RESULT_FIELDS = [
  "executed",
  "delivered",
  "deliveredOriginal",
  "intervention",
  "harness",
  "result.decision",
  "change",
  "orgId",
  "kind",
] as const

/**
 * MCP URL for the judge to copy.
 * Dev UI on :3000 → API on :4000. Production → same origin as server.js (or NEXT_PUBLIC_API_BASE).
 */
export function resolveMcpUrl(options?: {
  apiBase?: string
  origin?: string
  isDev?: boolean
}): string {
  const envBase = (options?.apiBase ?? process.env.NEXT_PUBLIC_API_BASE ?? "")
    .replace(/\/$/, "")
  if (envBase) return `${envBase}/mcp`

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location
    if (port === "3000" || options?.isDev) {
      return "http://127.0.0.1:4000/mcp"
    }
    return `${protocol}//${hostname}${port ? `:${port}` : ""}/mcp`
  }

  if (options?.origin) {
    return `${options.origin.replace(/\/$/, "")}/mcp`
  }

  return "http://127.0.0.1:4000/mcp"
}

export function mcpClientConfig(url: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        causaseal: {
          url,
        },
      },
    },
    null,
    2
  )
}

export const SDK_SNIPPET = `import { beforeTool, applySend } from "./connectors/sdk.mjs"

const intercept = await beforeTool(incident, { baseUrl: "http://127.0.0.1:4000", orgId: "demo" })
const { sendOriginal, body } = applySend(incident, intercept)
if (sendOriginal && body) {
  await partnerSend(body)
} else if (body) {
  await partnerSend(body) // redacted only
}`
