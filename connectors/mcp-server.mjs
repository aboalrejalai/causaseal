/**
 * causaseal-mcp-server — remote Streamable HTTP on /mcp, no OAuth, no API key.
 * Tools call connectors/service.mjs in-process (same state file as the UI).
 * Protocol names stay English (causaseal_*). Titles are English; descriptions
 * and markdown replies are Arabic then English.
 */

import { McpServer, fromJsonSchema } from "@modelcontextprotocol/server"
import {
  analyzePath,
  formatResult,
  getReport,
  getSession,
  interceptTool,
  listCompliancePage,
  listEventsPage,
  listFingerprintsPage,
  runAgent,
  runSermg,
  storeFingerprintItem,
} from "./service.mjs"

const RESPONSE_FORMAT = {
  type: "string",
  enum: ["markdown", "json"],
  default: "markdown",
  description:
    "markdown للقراءة البشرية أو json للمعالجة. markdown for humans or json for machines.",
}

const ORG_ID = {
  type: "string",
  description:
    "معرّف الجهة (افتراضي demo). حروف وأرقام و _ و - حتى 64. Org id (default demo); letters, digits, _ and - up to 64.",
}

const LIMIT = {
  type: "integer",
  minimum: 1,
  maximum: 50,
  default: 20,
  description: "أقصى عدد عناصر في الصفحة. Max items per page.",
}

const OFFSET = {
  type: "integer",
  minimum: 0,
  default: 0,
  description: "عدد العناصر للتخطي. Items to skip.",
}

const PATH_STEP = {
  type: "object",
  properties: {
    tool: { type: "string", description: "اسم الأداة. Tool name." },
    summary: { type: "string", description: "ملخص الخطوة. Step summary." },
  },
  required: ["tool", "summary"],
  additionalProperties: false,
}

const INCIDENT_PROPERTIES = {
  prompt: {
    type: "string",
    description: "طلب المستخدم. User prompt.",
  },
  untrustedContent: {
    type: "string",
    description: "محتوى غير موثوق (اختياري). Untrusted content (optional).",
  },
  retrievedText: {
    type: "string",
    description:
      "نص مسترجع قد يحمل تعليمة. Retrieved text that may carry a directive.",
  },
  agent: { type: "string", description: "اسم الوكيل. Agent name." },
  tool: {
    type: "string",
    description: "اسم أداة الإرسال أو الاستدعاء. Send or call tool name.",
  },
  trustedDestination: {
    type: "boolean",
    description: "هل الوجهة معتمدة. Whether the destination is trusted.",
  },
  elevatedPrivilege: {
    type: "boolean",
    description: "صلاحية مرتفعة. Elevated privilege.",
  },
  sensitiveData: {
    type: "boolean",
    description: "بيانات حساسة. Sensitive data present.",
  },
  environment: {
    type: "string",
    enum: ["cloud", "enterprise", "dev"],
    description: "بيئة التشغيل. Runtime environment.",
  },
  orgId: ORG_ID,
  steps: {
    type: "array",
    items: PATH_STEP,
    description: "خطوات المسار السابقة. Prior path steps.",
  },
  response_format: RESPONSE_FORMAT,
}

function toolError(error) {
  const message = error instanceof Error ? error.message : String(error)
  return {
    isError: true,
    content: [{ type: "text", text: `Error: ${message}` }],
  }
}

/**
 * @param {unknown} data
 * @param {string | undefined} responseFormat
 * @param {(data: unknown) => string} [toMarkdown]
 */
function ok(data, responseFormat, toMarkdown) {
  const format = responseFormat === "json" ? "json" : "markdown"
  return formatResult(data, format, toMarkdown)
}

/**
 * @returns {import("@modelcontextprotocol/server").McpServer}
 */
export function createCausasealMcpServer() {
  const server = new McpServer({
    name: "causaseal-mcp-server",
    version: "1.0.0",
  })

  server.registerTool(
    "causaseal_get_session",
    {
      title: "Org session summary",
      description: `يرجع عدادات الجلسة وآخر قرار وهل الجلسة فارغة لنفس orgId.
استخدم بعد causaseal_run_agent للتأكد أن الحدث سُجّل. لا يعدّل الحالة.

Returns session counters, last decision, and whether the org session is empty.
Use after causaseal_run_agent to confirm the event was recorded. Does not change state.

Args: orgId (optional), response_format.
Example: after a mutated run, call this tool with the same orgId.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: { orgId: ORG_ID, response_format: RESPONSE_FORMAT },
        additionalProperties: false,
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const data = getSession({ ...params, channel: "mcp" })
        return ok(data, params.response_format, (d) => {
          const s = /** @type {Record<string, unknown>} */ (d)
          return [
            `# جلسة / Session ${s.orgId}`,
            `- فارغة / empty: ${s.empty ? "نعم / yes" : "لا / no"}`,
            `- أحداث / events: ${s.eventCount}`,
            `- ممنوعة / blocked: ${s.blocked}`,
            `- بصمات / fingerprints: ${s.fingerprintCount}`,
          ].join("\n")
        })
      } catch (error) {
        return toolError(error)
      }
    }
  )

  server.registerTool(
    "causaseal_list_events",
    {
      title: "Monitor events",
      description: `يسرد أحداث الجلسة الحية (بدون بذور توضيحية).
بعد causaseal_run_agent لنفس orgId تظهر الأحداث هنا.

Lists live session events (no illustrative seed rows).
After causaseal_run_agent for the same orgId, events appear here.

Args: orgId, status (all|blocked|verify|allowed), q, limit, offset, response_format.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: {
          orgId: ORG_ID,
          status: {
            type: "string",
            enum: ["all", "blocked", "verify", "allowed"],
            default: "all",
            description: "تصفية الحالة. Status filter.",
          },
          q: {
            type: "string",
            description: "بحث نصي. Text search.",
          },
          limit: LIMIT,
          offset: OFFSET,
          response_format: RESPONSE_FORMAT,
        },
        additionalProperties: false,
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const data = listEventsPage({ ...params, channel: "mcp" })
        return ok(data, params.response_format, (d) => {
          const page =
            /** @type {{ events: Array<Record<string, unknown>>, total_count: number }} */ (
              d
            )
          const lines = [
            `# أحداث / Events (${page.total_count})`,
            "",
          ]
          for (const event of page.events || []) {
            lines.push(
              `- ${event.time} ${event.label} ${event.tool} — ${event.path}`
            )
          }
          return lines.join("\n") || "لا أحداث / No events"
        })
      } catch (error) {
        return toolError(error)
      }
    }
  )

  server.registerTool(
    "causaseal_list_fingerprints",
    {
      title: "X-CFS fingerprint memory",
      description: `يسرد بصمات الجهة بما فيها البذور الثلاث X-CFS-001/002/003.

Lists org fingerprints including the three seed rows X-CFS-001/002/003.

Args: orgId, q, limit, offset, response_format.
Example: limit=1 to page the seeds.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: {
          orgId: ORG_ID,
          q: {
            type: "string",
            description: "بحث نصي. Text search.",
          },
          limit: LIMIT,
          offset: OFFSET,
          response_format: RESPONSE_FORMAT,
        },
        additionalProperties: false,
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const data = listFingerprintsPage({ ...params, channel: "mcp" })
        return ok(data, params.response_format, (d) => {
          const page =
            /** @type {{ fingerprints: Array<Record<string, unknown>>, total_count: number }} */ (
              d
            )
          const lines = [
            `# بصمات / Fingerprints (${page.total_count})`,
            "",
          ]
          for (const fp of page.fingerprints || []) {
            lines.push(`## ${fp.id} — ${fp.title}`)
            lines.push(
              `- بيئة / env: ${fp.environment} · أصل / origin: ${fp.origin} · تاريخ / date: ${fp.date}`
            )
            lines.push("")
          }
          return lines.join("\n")
        })
      } catch (error) {
        return toolError(error)
      }
    }
  )

  server.registerTool(
    "causaseal_get_report",
    {
      title: "Session metrics",
      description: `مقاييس من أحداث الجلسة فقط. إن كانت الجلسة فارغة: illustrative=true ومقاييس فارغة — شغّل causaseal_run_agent ثم أعد القراءة.

Metrics from session events only. If the session is empty: illustrative=true and empty metrics — run causaseal_run_agent then read again.

Args: orgId, response_format.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: { orgId: ORG_ID, response_format: RESPONSE_FORMAT },
        additionalProperties: false,
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const data = getReport({ ...params, channel: "mcp" })
        return ok(data, params.response_format, (d) => {
          const r = /** @type {Record<string, unknown>} */ (d)
          if (r.illustrative) {
            return `# تقرير / Report\n${r.hint || "لا جلسة بعد. / No session yet."}`
          }
          return [
            `# تقرير الجلسة / Session report`,
            `- مطابقة / match: ${r.matchRate}`,
            `- منع / prevention: ${r.prevention}`,
            `- سماح صحيح / correct allow: ${r.correctAllow}`,
          ].join("\n")
        })
      } catch (error) {
        return toolError(error)
      }
    }
  )

  server.registerTool(
    "causaseal_list_compliance",
    {
      title: "Compliance controls",
      description: `يرجع دائمًا خمسة ضوابط: NCA-1, NCA-2, OWASP-ASI01, OWASP-ASI02, OWASP-ASI06.
حالة كل ضابط (mapped/partial/planned) تتغير مع الجلسة — لا تعتمد عليها كإجابة ثابتة؛ المعرّف والعنوان ثابتان.

Always returns five controls: NCA-1, NCA-2, OWASP-ASI01, OWASP-ASI02, OWASP-ASI06.
Each control status (mapped/partial/planned) changes with the session — do not treat status as fixed; id and title are fixed.

Args: limit, offset, response_format.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: {
          limit: LIMIT,
          offset: OFFSET,
          response_format: RESPONSE_FORMAT,
        },
        additionalProperties: false,
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const data = listCompliancePage({ ...params, channel: "mcp" })
        return ok(data, params.response_format, (d) => {
          const page =
            /** @type {{ controls: Array<Record<string, unknown>>, total_count: number }} */ (
              d
            )
          const lines = [
            `# ضوابط / Controls (${page.total_count})`,
            "",
          ]
          for (const c of page.controls || []) {
            lines.push(
              `- ${c.id} [${c.framework}] ${c.title} — ${c.status}`
            )
          }
          return lines.join("\n")
        })
      } catch (error) {
        return toolError(error)
      }
    }
  )

  server.registerTool(
    "causaseal_intercept_tool",
    {
      title: "Intercept before send",
      description: `عقد الشريك قبل تنفيذ أداة الإرسال. يحكم ولا ينفّذ الأداة (executed=false).
قبل إرسال أداة فيها بيانات حساسة إلى وجهة غير معتمدة، نادِ causaseal_intercept_tool.
عند INTERVENE: لا ترسل الأصل؛ استخدم redactedBody. عند VERIFY: أوقف التنفيذ لشخص. عند ALLOW: أرسل الأصل.

Partner contract before a send tool runs. Decides and does not execute the tool (executed=false).
Before sending a tool with sensitive data to an untrusted destination, call causaseal_intercept_tool.
On INTERVENE: do not send the original; use redactedBody. On VERIFY: hold for a human. On ALLOW: send the original.

Args: incident fields (prompt, tool, trustedDestination, elevatedPrivilege, sensitiveData, …), orgId, response_format.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: INCIDENT_PROPERTIES,
        required: [
          "prompt",
          "agent",
          "tool",
          "trustedDestination",
          "elevatedPrivilege",
          "sensitiveData",
        ],
        additionalProperties: false,
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const { response_format, ...body } = params
        const data = await interceptTool({ ...body, channel: "mcp" })
        return ok(data, response_format, (d) => {
          const o = /** @type {Record<string, unknown>} */ (d)
          return [
            `# اعتراض / Intercept`,
            `- قرار / decision: ${o.decision}`,
            `- هارنس / harness: ${o.harness}`,
            `- أرسل الأصل / send original: ${o.sendOriginal}`,
            `- توجيه / guidance: ${o.guidance}`,
          ].join("\n")
        })
      } catch (error) {
        return toolError(error)
      }
    }
  )

  server.registerTool(
    "causaseal_run_agent",
    {
      title: "Run demo agent loop",
      description: `يشغّل وكيل العمليات: حكم البصمة مقابل هارنس الأدوات، ثم يسلّم الأصل أو نسخة محذوفة.
هذه الأداة تُظهر صف الفرق: kind=mutated (أداة post_update) → الهارنس ALLOW والبصمة INTERVENE.
بعدها نادِ causaseal_list_events بنفس orgId.

Runs the ops agent: fingerprint decision vs tool harness, then delivers original or redacted copy.
Shows the difference row: kind=mutated (post_update tool) → harness ALLOW, fingerprint INTERVENE.
Then call causaseal_list_events with the same orgId.

Args: kind (leak|safe|cross|mutated|lookalike|health|partial) or full body, orgId, environment, response_format.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: {
          kind: {
            type: "string",
            enum: [
              "leak",
              "safe",
              "cross",
              "mutated",
              "lookalike",
              "health",
              "partial",
            ],
            description:
              "سيناريو جاهز إن لم يُمرَّر body. Ready scenario when body is omitted.",
          },
          environment: {
            type: "string",
            enum: ["cloud", "enterprise", "dev"],
            description: "بيئة التشغيل. Runtime environment.",
          },
          orgId: ORG_ID,
          body: {
            type: "object",
            description:
              "جسم حادث كامل بدل kind. Full incident body instead of kind.",
            additionalProperties: true,
          },
          response_format: RESPONSE_FORMAT,
        },
        additionalProperties: false,
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const { response_format, ...options } = params
        const data = await runAgent({ ...options, channel: "mcp" })
        return ok(data, response_format, (d) => {
          const o = /** @type {Record<string, unknown>} */ (d)
          return [
            `# تشغيل وكيل / Agent run (${o.kind})`,
            `- هارنس / harness: ${o.harness}`,
            `- بصمة / fingerprint: ${o.decision}`,
            `- تدخل / intervention: ${o.intervention || "لا / none"}`,
            `- أصل مُرسل / original sent: ${o.deliveredOriginal}`,
            `- ${o.change}`,
          ].join("\n")
        })
      } catch (error) {
        return toolError(error)
      }
    }
  )

  server.registerTool(
    "causaseal_analyze_path",
    {
      title: "Analyze causal path",
      description: `يحلّل شكل المسار ويسجّل القرار (قواعد فقط، بلا OpenAI).

Analyzes path shape and records the decision (rules only, no OpenAI).

Args: same incident fields + response_format.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: INCIDENT_PROPERTIES,
        required: [
          "prompt",
          "agent",
          "tool",
          "trustedDestination",
          "elevatedPrivilege",
          "sensitiveData",
        ],
        additionalProperties: false,
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const { response_format, ...body } = params
        const data = await analyzePath({ ...body, channel: "mcp" })
        return ok(data, response_format, (d) => {
          const o = /** @type {{ result: Record<string, unknown> }} */ (d)
          return `# تحليل / Analyze\n- قرار / decision: ${o.result.decision}\n- سبب / reason: ${o.result.reason}`
        })
      } catch (error) {
        return toolError(error)
      }
    }
  )

  server.registerTool(
    "causaseal_store_fingerprint",
    {
      title: "Store fingerprint",
      description: `يحفظ بصمة في دلو الجهة. title مطلوب.

Stores a fingerprint in the org bucket. title is required.

Args: title, desc, tags, invariants, environment, nodes, orgId, response_format.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "عنوان البصمة. Fingerprint title.",
          },
          desc: {
            type: "string",
            description: "وصف مختصر. Short description.",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "وسوم. Tags.",
          },
          invariants: {
            type: "array",
            items: { type: "string" },
            description: "ثوابت شكل المسار. Path-shape invariants.",
          },
          environment: {
            type: "string",
            enum: ["cloud", "enterprise", "dev"],
            description: "بيئة التشغيل. Runtime environment.",
          },
          confidence: {
            type: "string",
            description: "مستوى الثقة. Confidence level.",
          },
          date: {
            type: "string",
            description: "تاريخ. Date.",
          },
          nodes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: {
                  type: "string",
                  description: "تسمية العقدة. Node label.",
                },
                value: {
                  type: "string",
                  description: "قيمة العقدة. Node value.",
                },
                risk: {
                  type: "boolean",
                  description: "عقدة خطر. Risk node.",
                },
              },
              required: ["label", "value", "risk"],
              additionalProperties: false,
            },
            description: "عقد المسار. Path nodes.",
          },
          orgId: ORG_ID,
          response_format: RESPONSE_FORMAT,
        },
        required: ["title"],
        additionalProperties: false,
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const { response_format, ...input } = params
        const data = storeFingerprintItem({ ...input, channel: "mcp" })
        return ok(data, response_format, (d) => {
          const o = /** @type {{ fingerprint: Record<string, unknown> }} */ (d)
          return `# محفوظ / Stored\n- ${o.fingerprint.id}: ${o.fingerprint.title}`
        })
      } catch (error) {
        return toolError(error)
      }
    }
  )

  server.registerTool(
    "causaseal_run_sermg",
    {
      title: "SERMG mutations",
      description: `يشغّل محاكاة طفرات على بصمة معروفة (افتراضي X-CFS-001).

Runs mutation simulation on a known fingerprint (default X-CFS-001).

Args: signatureId, count (1–24), changePrompt, changeTool, changeData, changePrivilege, environment, orgId, response_format.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: {
          signatureId: {
            type: "string",
            default: "X-CFS-001",
            description: "معرّف البصمة. Fingerprint id.",
          },
          count: {
            type: "integer",
            minimum: 1,
            maximum: 24,
            default: 6,
            description: "عدد الطفرات. Mutation count.",
          },
          changePrompt: {
            type: "boolean",
            default: true,
            description: "غيّر الطلب. Mutate prompt.",
          },
          changeTool: {
            type: "boolean",
            default: true,
            description: "غيّر الأداة. Mutate tool.",
          },
          changeData: {
            type: "boolean",
            default: true,
            description: "غيّر البيانات. Mutate data flags.",
          },
          changePrivilege: {
            type: "boolean",
            default: false,
            description: "غيّر الصلاحية. Mutate privilege.",
          },
          environment: {
            type: "string",
            enum: ["cloud", "enterprise", "dev"],
            description: "بيئة التشغيل. Runtime environment.",
          },
          orgId: ORG_ID,
          response_format: RESPONSE_FORMAT,
        },
        additionalProperties: false,
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const { response_format, ...options } = params
        const data = await runSermg({ ...options, channel: "mcp" })
        return ok(data, response_format, (d) => {
          const o = /** @type {Record<string, unknown>} */ (d)
          return `# SERMG\n- بصمة / fingerprint: ${o.signatureId}\n- درجة / score: ${o.score}`
        })
      } catch (error) {
        return toolError(error)
      }
    }
  )

  return server
}

export const MCP_TOOL_NAMES = [
  "causaseal_get_session",
  "causaseal_list_events",
  "causaseal_list_fingerprints",
  "causaseal_get_report",
  "causaseal_list_compliance",
  "causaseal_intercept_tool",
  "causaseal_run_agent",
  "causaseal_analyze_path",
  "causaseal_store_fingerprint",
  "causaseal_run_sermg",
]

export const MCP_READ_ONLY_TOOLS = new Set([
  "causaseal_get_session",
  "causaseal_list_events",
  "causaseal_list_fingerprints",
  "causaseal_get_report",
  "causaseal_list_compliance",
])
