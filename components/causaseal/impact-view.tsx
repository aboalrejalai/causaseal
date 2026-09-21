"use client"

import * as React from "react"
import { toast } from "sonner"

import { PageHeading } from "@/components/causaseal/page-heading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchSession, runOpsAgentClient, type SessionSummary } from "@/lib/api/client"
import { formatDecision } from "@/lib/decisions"
import { HARNESS_DIFF } from "@/lib/nav"

type RunRow = {
  kind: string
  decision: string
  delivered: boolean
  change: string
  crossContext?: boolean
}

export function ImpactView() {
  const [running, setRunning] = React.useState(false)
  const [rows, setRows] = React.useState<RunRow[]>([])
  const [session, setSession] = React.useState<SessionSummary | null>(null)

  async function refreshSession() {
    try {
      setSession(await fetchSession())
    } catch {
      /* ignore */
    }
  }

  React.useEffect(() => {
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

  async function runDemo() {
    setRunning(true)
    setRows([])
    try {
      const leak = await runOpsAgentClient({ kind: "leak", environment: "dev", orgId: "demo" })
      setRows((prev) => [
        ...prev,
        {
          kind: "تسريب → منع",
          decision: String(leak.result.decision),
          delivered: leak.delivered,
          change: leak.change,
        },
      ])
      const safe = await runOpsAgentClient({ kind: "safe", environment: "dev", orgId: "demo" })
      setRows((prev) => [
        ...prev,
        {
          kind: "مسار مشروع → سماح",
          decision: String(safe.result.decision),
          delivered: safe.delivered,
          change: safe.change,
        },
      ])
      const cross = await runOpsAgentClient({
        kind: "cross",
        environment: "enterprise",
        orgId: "demo",
      })
      setRows((prev) => [
        ...prev,
        {
          kind: "نفس الثوابت في المؤسسة",
          decision: String(cross.result.decision),
          delivered: cross.delivered,
          change: cross.change,
          crossContext: Boolean(cross.result.crossContext),
        },
      ])
      toast.success("اكتمل تشغيل الأثر: منع، سماح، ثم منع عبر السياق")
      await refreshSession()
    } catch {
      toast.error("تعذر تشغيل وكيل العمليات. تأكد أن الخادم يعمل: npm start")
    } finally {
      setRunning(false)
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="IMPACT"
        title="أثر المنع على سير العمل"
        description="وكيل العمليات ينادي البوابة قبل الإرسال. عند المنع لا تُستدعى أداة الإرسال."
        actions={
          <Button disabled={running} onClick={() => void runDemo()}>
            {running ? "جاري التشغيل…" : "تشغيل السيناريوهات الثلاثة"}
          </Button>
        }
      />

      <Alert>
        <AlertTitle>المستفيد والقياس</AlertTitle>
        <AlertDescription>
          المستفيد: فريق تشغيل الوكيل داخل المؤسسة. التغيّر: الإرسال الخارجي لا يتم عند INTERVENE،
          ويتم محليًا عند ALLOW. القياس من الجلسة: منع {session?.blocked ?? 0} · مطابقة{" "}
          {Math.round((session?.matchRate ?? 0) * 100)}% · بيئات {session?.environmentCount ?? 0}.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">تشغيل الوكيل</CardTitle>
          <CardDescription>{HARNESS_DIFF}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              اضغط التشغيل لترى المنع دون deliver، ثم السماح مع deliver، ثم النقل بين البيئات.
            </p>
          ) : (
            rows.map((row) => (
              <div
                key={row.kind}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{row.kind}</p>
                  <p className="text-xs text-muted-foreground">{row.change}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={row.decision === "INTERVENE" ? "destructive" : "secondary"}>
                    {formatDecision(row.decision)}
                  </Badge>
                  <Badge variant="outline">{row.delivered ? "delivered" : "لا إرسال"}</Badge>
                  {row.crossContext ? <Badge variant="success">عبر السياق</Badge> : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">فقرة التشغيل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>من يستدعي البوابة: وكيل المؤسسة عبر POST /api/agent/run قبل أداة الإرسال.</p>
          <p>نتيجة INTERVENE: دالة deliver لا تُستدعى، والحدث يُسجَّل بمصدر intercept.</p>
          <p>أين البصمة: ملف حالة الجهة تحت data/causaseal-state.json داخل orgs[orgId].</p>
          <p>التكلفة: عملية server.js واحدة وملف JSON لكل جهة معزولة.</p>
          <p>
            القرار الافتراضي من شكل المسار (قواعد). استدعاء OpenAI اختياري فقط عند وجود
            OPENAI_API_KEY؛ أزرار الأثر ترسل preferRules.
          </p>
        </CardContent>
      </Card>
    </>
  )
}
