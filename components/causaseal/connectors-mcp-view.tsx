"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  BookOpenIcon,
  CableIcon,
  CopyIcon,
  PenLineIcon,
  WrenchIcon,
} from "lucide-react"

import { ConnectorPageShell } from "@/components/causaseal/connector-page-shell"
import { Stat } from "@/components/causaseal/stat"
import { useLanguage } from "@/components/causaseal/language-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fetchSession, type SessionSummary } from "@/lib/api/client"
import {
  LOCAL_MCP_URL,
  MCP_TOOL_GROUPS,
  PRODUCTION_MCP_URL,
  resolveLocalMcpUrl,
} from "@/lib/connectors"

export function ConnectorsMcpView() {
  const { language } = useLanguage()
  const ar = language === "ar"
  const [session, setSession] = React.useState<SessionSummary | null>(null)
  const [deviceUrl, setDeviceUrl] = React.useState(LOCAL_MCP_URL)

  React.useEffect(() => {
    setDeviceUrl(resolveLocalMcpUrl())
    let cancelled = false
    void fetchSession()
      .then((data) => {
        if (!cancelled) setSession(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  async function copy(text: string, ok: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(ok)
    } catch {
      toast.error(ar ? "تعذر النسخ" : "Copy failed")
    }
  }

  const stats = session?.connectorMcp ?? {
    total: 0,
    reads: 0,
    writes: 0,
    tools: 10,
  }

  return (
    <ConnectorPageShell
      eyebrow="MCP"
      title={ar ? "خادم MCP" : "MCP server"}
      description={
        ar
          ? "الصق الرابط في كلود أو كيرسر أو شات جي بي تي بدون مفتاح."
          : "Paste the URL into Claude, Cursor, or ChatGPT with no key."
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          variant="gradient"
          icon={<CableIcon className="size-5" />}
          label={ar ? "نداءات MCP" : "MCP calls"}
          value={String(stats.total)}
          changeLabel={ar ? "من هذه الجلسة" : "This session"}
        />
        <Stat
          variant="gradient"
          icon={<BookOpenIcon className="size-5" />}
          label={ar ? "قراءات" : "Reads"}
          value={String(stats.reads)}
          changeLabel={ar ? "من هذه الجلسة" : "This session"}
        />
        <Stat
          variant="gradient"
          icon={<PenLineIcon className="size-5" />}
          label={ar ? "كتابات" : "Writes"}
          value={String(stats.writes)}
          changeLabel={ar ? "من هذه الجلسة" : "This session"}
        />
        <Stat
          variant="gradient"
          icon={<WrenchIcon className="size-5" />}
          label={ar ? "أدوات مسجّلة" : "Registered tools"}
          value={String(stats.tools)}
          changeLabel={ar ? "ثابتة" : "Fixed"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {ar ? "الرابط" : "URL"}
          </CardTitle>
          <CardDescription>
            {ar
              ? "بلا مفتاح ولا OAuth. على الدومين من server.js بعد النشر؛ محليًا الواجهة 3000 والـ API 4000. إن ظهرت No approval received في كلود: Customize → Connectors → causaseal → Tool permissions → Always allow للقراءة والكتابة — الطلب ما يصل السيرفر قبل السماح."
              : "No API key and no OAuth. Live domain from server.js after deploy; local UI 3000 and API 4000. If Claude shows No approval received: Customize → Connectors → causaseal → Tool permissions → Always allow for read and write — the call never reaches the server until you allow it."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {ar ? "على هذا الجهاز" : "On this device"}
            </p>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 break-all rounded-lg bg-muted px-3 py-2 text-xs">
                {deviceUrl}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() =>
                  void copy(deviceUrl, ar ? "نُسخ رابط الجهاز" : "Device URL copied")
                }
              >
                <CopyIcon />
                {ar ? "نسخ" : "Copy"}
              </Button>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {ar ? "على الموقع بعد النشر" : "On the site after deploy"}
            </p>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 break-all rounded-lg bg-muted px-3 py-2 text-xs">
                {PRODUCTION_MCP_URL}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() =>
                  void copy(
                    PRODUCTION_MCP_URL,
                    ar ? "نُسخ رابط الموقع" : "Site URL copied"
                  )
                }
              >
                <CopyIcon />
                {ar ? "نسخ" : "Copy"}
              </Button>
            </div>
          </div>
          <pre className="max-w-full overflow-x-auto break-all rounded-xl border bg-muted/50 p-3 text-[11px] leading-relaxed">
            {JSON.stringify(
              { mcpServers: { causaseal: { url: PRODUCTION_MCP_URL } } },
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{ar ? "قراءة" : "Read"}</CardTitle>
            <CardDescription>
              {ar ? "خمس أدوات لا تغيّر القرار" : "Five tools that do not change decisions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {MCP_TOOL_GROUPS.read.map((tool) => (
                <li key={tool.name} className="min-w-0">
                  <p className="truncate font-mono text-xs">{tool.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {ar ? tool.summaryAr : tool.summaryEn}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{ar ? "كتابة" : "Write"}</CardTitle>
            <CardDescription>
              {ar ? "خمس أدوات تسجّل في الجلسة" : "Five tools that record into the session"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {MCP_TOOL_GROUPS.write.map((tool) => (
                <li key={tool.name} className="min-w-0">
                  <p className="truncate font-mono text-xs">{tool.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {ar ? tool.summaryAr : tool.summaryEn}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </ConnectorPageShell>
  )
}
