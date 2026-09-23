/**
 * causaseal-mcp-server — remote Streamable HTTP on /mcp, no OAuth, no API key.
 * Tools call connectors/service.mjs in-process (same state file as the UI).
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
  description: "markdown للقراءة البشرية أو json للمعالجة",
}

const ORG_ID = {
  type: "string",
  description: "معرّف الجهة (افتراضي demo). حروف وأرقام و _ و - حتى 64.",
}

const LIMIT = {
  type: "integer",
  minimum: 1,
  maximum: 50,
  default: 20,
  description: "أقصى عدد عناصر في الصفحة",
}

const OFFSET = {
  type: "integer",
  minimum: 0,
  default: 0,
  description: "عدد العناصر للتخطي",
}

const PATH_STEP = {
  type: "object",
  properties: {
    tool: { type: "string" },
    summary: { type: "string" },
  },
  required: ["tool", "summary"],
  additionalProperties: false,
}

const INCIDENT_PROPERTIES = {
  prompt: { type: "string", description: "طلب المستخدم" },
  untrustedContent: { type: "string", description: "محتوى غير موثوق (اختياري)" },
  retrievedText: { type: "string", description: "نص مسترجع قد يحمل تعليمة" },
  agent: { type: "string", description: "اسم الوكيل" },
  tool: { type: "string", description: "اسم أداة الإرسال أو الاستدعاء" },
  trustedDestination: { type: "boolean", description: "هل الوجهة معتمدة" },
  elevatedPrivilege: { type: "boolean", description: "صلاحية مرتفعة" },
  sensitiveData: { type: "boolean", description: "بيانات حساسة" },
  environment: {
    type: "string",
    enum: ["cloud", "enterprise", "dev"],
    description: "بيئة التشغيل",
  },
  orgId: ORG_ID,
  steps: {
    type: "array",
    items: PATH_STEP,
    description: "خطوات المسار السابقة",
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
      title: "ملخص جلسة الجهة",
      description: `يرجع عدادات الجلسة وآخر قرار وهل الجلسة فارغة لنفس orgId.

استخدم بعد causaseal_run_agent للتأكد أن الحدث سُجّل. لا يعدّل الحالة.

Args: orgId (اختياري), response_format.

مثال: بعد تجربة mutated، نادِ هذه الأداة بنفس orgId.`,
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
        const data = getSession(params)
        return ok(data, params.response_format, (d) => {
          const s = /** @type {Record<string, unknown>} */ (d)
          return [
            `# جلسة ${s.orgId}`,
            `- فارغة: ${s.empty ? "نعم" : "لا"}`,
            `- أحداث: ${s.eventCount}`,
            `- ممنوعة: ${s.blocked}`,
            `- بصمات: ${s.fingerprintCount}`,
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
      title: "أحداث المراقبة",
      description: `يسرد أحداث الجلسة الحية (بدون بذور توضيحية).

بعد causaseal_run_agent لنفس orgId تظهر الأحداث هنا.

Args: orgId, status (all|blocked|verify|allowed), q, limit, offset, response_format.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: {
          orgId: ORG_ID,
          status: {
            type: "string",
            enum: ["all", "blocked", "verify", "allowed"],
            default: "all",
          },
          q: { type: "string", description: "بحث نصي" },
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
        const data = listEventsPage(params)
        return ok(data, params.response_format, (d) => {
          const page = /** @type {{ events: Array<Record<string, unknown>>, total_count: number }} */ (
            d
          )
          const lines = [`# أحداث (${page.total_count})`, ""]
          for (const event of page.events || []) {
            lines.push(`- ${event.time} ${event.label} ${event.tool} — ${event.path}`)
          }
          return lines.join("\n") || "لا أحداث"
        })
      } catch (error) {
        return toolError(error)
      }
    }
  )

  server.registerTool(
    "causaseal_list_fingerprints",
    {
      title: "ذاكرة X-CFS",
      description: `يسرد بصمات الجهة بما فيها البذور الثلاث X-CFS-001/002/003.

Args: orgId, q, limit, offset, response_format.

مثال قراءة: limit=1 لترقيم البذور.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: {
          orgId: ORG_ID,
          q: { type: "string" },
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
        const data = listFingerprintsPage(params)
        return ok(data, params.response_format, (d) => {
          const page = /** @type {{ fingerprints: Array<Record<string, unknown>>, total_count: number }} */ (
            d
          )
          const lines = [`# بصمات (${page.total_count})`, ""]
          for (const fp of page.fingerprints || []) {
            lines.push(`## ${fp.id} — ${fp.title}`)
            lines.push(`- بيئة: ${fp.environment} · أصل: ${fp.origin} · تاريخ: ${fp.date}`)
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
      title: "مقاييس الجلسة",
      description: `مقاييس من أحداث الجلسة فقط. إن كانت الجلسة فارغة: illustrative=true ومقاييس فارغة — شغّل causaseal_run_agent ثم أعد القراءة.

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
        const data = getReport(params)
        return ok(data, params.response_format, (d) => {
          const r = /** @type {Record<string, unknown>} */ (d)
          if (r.illustrative) {
            return `# تقرير\n${r.hint || "لا جلسة بعد."}`
          }
          return [
            `# تقرير الجلسة`,
            `- مطابقة: ${r.matchRate}`,
            `- منع: ${r.prevention}`,
            `- سماح صحيح: ${r.correctAllow}`,
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
      title: "ضوابط الامتثال",
      description: `يرجع دائمًا خمسة ضوابط: NCA-1, NCA-2, OWASP-ASI01, OWASP-ASI02, OWASP-ASI06.
حالة كل ضابط (mapped/partial/planned) تتغير مع الجلسة — لا تعتمد عليها كإجابة ثابتة؛ المعرّف والعنوان ثابتان.

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
        const data = listCompliancePage(params)
        return ok(data, params.response_format, (d) => {
          const page = /** @type {{ controls: Array<Record<string, unknown>>, total_count: number }} */ (
            d
          )
          const lines = [`# ضوابط (${page.total_count})`, ""]
          for (const c of page.controls || []) {
            lines.push(`- ${c.id} [${c.framework}] ${c.title} — ${c.status}`)
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
      title: "اعتراض قبل أداة الإرسال",
      description: `عقد الشريك قبل تنفيذ أداة الإرسال. يحكم ولا ينفّذ الأداة (executed=false).

قبل إرسال أداة فيها بيانات حساسة إلى وجهة غير معتمدة، نادِ causaseal_intercept_tool.
عند INTERVENE: لا ترسل الأصل؛ استخدم redactedBody. عند VERIFY: أوقف التنفيذ لشخص. عند ALLOW: أرسل الأصل.

Args: حقول الحادث (prompt, tool, trustedDestination, elevatedPrivilege, sensitiveData, …) و orgId و response_format.`,
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
        const data = await interceptTool(body)
        return ok(data, response_format, (d) => {
          const o = /** @type {Record<string, unknown>} */ (d)
          return [
            `# اعتراض`,
            `- قرار: ${o.decision}`,
            `- هارنس: ${o.harness}`,
            `- أرسل الأصل: ${o.sendOriginal}`,
            `- توجيه: ${o.guidance}`,
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
      title: "تشغيل حلقة التجربة",
      description: `يشغّل وكيل العمليات: حكم البصمة مقابل هارنس الأدوات، ثم يسلّم الأصل أو نسخة محذوفة.

هذه الأداة تُظهر صف الفرق: kind=mutated (أداة post_update) → الهارنس ALLOW والبصمة INTERVENE.
بعدها نادِ causaseal_list_events بنفس orgId.

Args: kind (leak|safe|cross|mutated|lookalike) أو body كامل، orgId, environment, response_format.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: {
          kind: {
            type: "string",
            enum: ["leak", "safe", "cross", "mutated", "lookalike"],
            description: "سيناريو جاهز إن لم يُمرَّر body",
          },
          environment: {
            type: "string",
            enum: ["cloud", "enterprise", "dev"],
          },
          orgId: ORG_ID,
          body: {
            type: "object",
            description: "جسم حادث كامل بدل kind",
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
        const data = await runAgent(options)
        return ok(data, response_format, (d) => {
          const o = /** @type {Record<string, unknown>} */ (d)
          return [
            `# تشغيل وكيل (${o.kind})`,
            `- هارنس: ${o.harness}`,
            `- بصمة: ${o.decision}`,
            `- تدخل: ${o.intervention || "لا"}`,
            `- أصل مُرسل: ${o.deliveredOriginal}`,
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
      title: "تحليل مسار سببي",
      description: `يحلّل شكل المسار ويسجّل القرار (قواعد فقط، بلا OpenAI).

Args: نفس حقول الحادث + response_format.`,
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
        const data = await analyzePath(body)
        return ok(data, response_format, (d) => {
          const o = /** @type {{ result: Record<string, unknown> }} */ (d)
          return `# تحليل\n- قرار: ${o.result.decision}\n- سبب: ${o.result.reason}`
        })
      } catch (error) {
        return toolError(error)
      }
    }
  )

  server.registerTool(
    "causaseal_store_fingerprint",
    {
      title: "حفظ بصمة",
      description: `يحفظ بصمة في دلو الجهة. title مطلوب.

Args: title, desc, tags, invariants, environment, nodes, orgId, response_format.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: {
          title: { type: "string" },
          desc: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          invariants: { type: "array", items: { type: "string" } },
          environment: {
            type: "string",
            enum: ["cloud", "enterprise", "dev"],
          },
          confidence: { type: "string" },
          date: { type: "string" },
          nodes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "string" },
                risk: { type: "boolean" },
              },
              required: ["label", "value", "risk"],
              additionalProperties: false,
            },
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
        const data = storeFingerprintItem(input)
        return ok(data, response_format, (d) => {
          const o = /** @type {{ fingerprint: Record<string, unknown> }} */ (d)
          return `# محفوظ\n- ${o.fingerprint.id}: ${o.fingerprint.title}`
        })
      } catch (error) {
        return toolError(error)
      }
    }
  )

  server.registerTool(
    "causaseal_run_sermg",
    {
      title: "طفرات SERMG",
      description: `يشغّل محاكاة طفرات على بصمة معروفة (افتراضي X-CFS-001).

Args: signatureId, count (1–24), changePrompt, changeTool, changeData, changePrivilege, environment, orgId, response_format.`,
      inputSchema: fromJsonSchema({
        type: "object",
        properties: {
          signatureId: { type: "string", default: "X-CFS-001" },
          count: { type: "integer", minimum: 1, maximum: 24, default: 6 },
          changePrompt: { type: "boolean", default: true },
          changeTool: { type: "boolean", default: true },
          changeData: { type: "boolean", default: true },
          changePrivilege: { type: "boolean", default: false },
          environment: {
            type: "string",
            enum: ["cloud", "enterprise", "dev"],
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
        const data = await runSermg(options)
        return ok(data, response_format, (d) => {
          const o = /** @type {Record<string, unknown>} */ (d)
          return `# SERMG\n- بصمة: ${o.signatureId}\n- درجة: ${o.score}`
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
