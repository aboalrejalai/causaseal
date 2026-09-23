"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  BanIcon,
  CopyIcon,
  FileWarningIcon,
  SendIcon,
  ShieldAlertIcon,
} from "lucide-react"

import { ConnectorPageShell } from "@/components/causaseal/connector-page-shell"
import { Stat } from "@/components/causaseal/stat"
import { useLanguage } from "@/components/causaseal/language-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { fetchSession, runOpsAgentClient, type SessionSummary } from "@/lib/api/client"
import { HTTP_CURL } from "@/lib/connectors"

const FIELDS = [
  "prompt",
  "agent",
  "tool",
  "trustedDestination",
  "elevatedPrivilege",
  "sensitiveData",
  "retrievedText",
  "orgId",
  "environment",
  "steps",
]

export function ConnectorsHttpView() {
  const { language } = useLanguage()
  const ar = language === "ar"
  const [session, setSession] = React.useState<SessionSummary | null>(null)
  const [running, setRunning] = React.useState(false)
  const [resultLine, setResultLine] = React.useState<string | null>(null)

  async function refresh() {
    try {
      setSession(await fetchSession())
    } catch {
      /* ignore */
    }
  }

  React.useEffect(() => {
    void refresh()
  }, [])

  async function runMutated() {
    setRunning(true)
    setResultLine(null)
    try {
      const outcome = await runOpsAgentClient({
        kind: "mutated",
        orgId: "demo",
        environment: "dev",
      })
      await refresh()
      const line =
        outcome.harness === "ALLOW" && outcome.result.decision === "INTERVENE"
          ? ar
            ? "الهارنس سمح. البصمة منعت الأصل وأرسلت نسخة محذوفة."
            : "Harness allowed. Fingerprint blocked the original and sent a redacted copy."
          : ar
            ? `هارنس: ${outcome.harness} · بصمة: ${outcome.result.decision}`
            : `Harness: ${outcome.harness} · Fingerprint: ${outcome.result.decision}`
      setResultLine(line)
      toast.success(ar ? "سُجّل في الجلسة" : "Recorded in this session")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setRunning(false)
    }
  }

  async function copyCurl() {
    try {
      await navigator.clipboard.writeText(HTTP_CURL)
      toast.success(ar ? "نُسخ المثال" : "Example copied")
    } catch {
      toast.error(ar ? "تعذر النسخ" : "Copy failed")
    }
  }

  const stats = session?.connectorHttp ?? {
    intercepts: 0,
    delivered: 0,
    redacted: 0,
    intervene: 0,
  }

  return (
    <ConnectorPageShell
      eyebrow="HTTP"
      title={ar ? "واجهة HTTP" : "HTTP API"}
      description={
        ar
          ? "أرسل المسار للبوابة قبل أداة الإرسال. الأرقام من هذه الجلسة."
          : "Send the path to the gateway before the send tool. Numbers are from this session."
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          variant="gradient"
          icon={<ShieldAlertIcon className="size-5" />}
          label={ar ? "اعتراضات" : "Intercepts"}
          value={String(stats.intercepts)}
          changeLabel={ar ? "من هذه الجلسة" : "This session"}
        />
        <Stat
          variant="gradient"
          icon={<SendIcon className="size-5" />}
          label={ar ? "أصول مُرسلة" : "Originals sent"}
          value={String(stats.delivered)}
          changeLabel={ar ? "من هذه الجلسة" : "This session"}
        />
        <Stat
          variant="gradient"
          icon={<FileWarningIcon className="size-5" />}
          label={ar ? "نسخ محذوفة" : "Redacted copies"}
          value={String(stats.redacted)}
          changeLabel={ar ? "من هذه الجلسة" : "This session"}
        />
        <Stat
          variant="gradient"
          icon={<BanIcon className="size-5" />}
          label={ar ? "قرارات تدخل" : "Interventions"}
          value={String(stats.intervene)}
          changeLabel={ar ? "من هذه الجلسة" : "This session"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {ar ? "كيف تستخدمه" : "How to use it"}
          </CardTitle>
          <CardDescription>
            {ar ? "ثلاث خطوات قبل أداة الإرسال" : "Three steps before the send tool"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <ol className="flex list-decimal flex-col gap-3 ps-5">
            <li>
              {ar
                ? "أرسل المسار إلى POST /api/gateway/intercept قبل أداة الإرسال."
                : "POST the path to /api/gateway/intercept before the send tool."}
            </li>
            <li>
              {ar
                ? "ALLOW يعني أرسل النص الأصلي. INTERVENE يعني أرسل النسخة المحذوفة فقط. VERIFY يعني أوقف حتى يراجع شخص."
                : "ALLOW means send the original. INTERVENE means send only the redacted copy. VERIFY means hold for a person."}
            </li>
            <li>
              {ar
                ? "انسخ المثال أدناه وجرّبه على الخادم المحلي أو على الدومين بعد النشر."
                : "Copy the example below and try it on local or on the live domain after deploy."}
            </li>
          </ol>
          <pre className="max-w-full overflow-x-auto break-all rounded-xl border bg-muted/50 p-3 text-[11px] leading-relaxed">
            {HTTP_CURL}
          </pre>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void copyCurl()}>
              <CopyIcon />
              {ar ? "نسخ المثال" : "Copy example"}
            </Button>
            <Button type="button" size="sm" disabled={running} onClick={() => void runMutated()}>
              {running
                ? ar
                  ? "جارٍ التشغيل…"
                  : "Running…"
                : ar
                  ? "شغّل مثال الصياغة المتغيرة"
                  : "Run mutated-phrasing example"}
            </Button>
            <Button type="button" variant="ghost" size="sm" asChild>
              <Link href="/monitor">{ar ? "المراقبة" : "Monitor"}</Link>
            </Button>
          </div>
          {resultLine ? (
            <Alert>
              <AlertTitle>{ar ? "نتيجة المثال" : "Example result"}</AlertTitle>
              <AlertDescription>{resultLine}</AlertDescription>
            </Alert>
          ) : null}
          <Collapsible>
            <CollapsibleTrigger className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              {ar ? "حقول الطلب" : "Request fields"}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <ul className="grid grid-cols-1 gap-1 font-mono text-xs sm:grid-cols-2">
                {FIELDS.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </ConnectorPageShell>
  )
}
