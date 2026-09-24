"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import { IllustrativeBadge, PageHeading } from "@/components/causaseal/page-heading"
import { ChartBarMultiple } from "@/components/chart-bar-multiple"
import { ChartPieDonut } from "@/components/chart-pie-donut"
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
import { HARNESS_COMPARE_KINDS } from "@/lib/architecture"
import { DEMO_IMPACT_ROWS, type DemoImpactRow } from "@/lib/chart-demo"
import { formatDecision } from "@/lib/decisions"
import { HARNESS_DIFF } from "@/lib/nav"

type RunRow = DemoImpactRow

function harnessLabel(value?: string) {
  if (value === "BLOCK") return "هارنس: منع"
  if (value === "ALLOW") return "هارنس: سماح"
  return null
}

function humanSentence(row: {
  harness?: string
  decision: string
  deliveredOriginal?: boolean
  cut?: string | null
}) {
  if (row.harness === "ALLOW" && row.decision === "INTERVENE" && !row.deliveredOriginal) {
    return row.cut
      ? `الهارنس سمح. البصمة منعت الأصل وأرسلت نسخة محذوفة. قُطعت: ${row.cut}.`
      : "الهارنس سمح. البصمة منعت الأصل وأرسلت نسخة محذوفة."
  }
  if (row.harness === "BLOCK" && row.decision === "INTERVENE") {
    return "الهارنس منع الأداة الآن. البصمة سجّلت الشكل للنسخ التالية."
  }
  if (row.harness === "ALLOW" && row.decision === "ALLOW" && row.deliveredOriginal) {
    return "الاثنان سمحا؛ الأصل وصل."
  }
  if (row.harness === "ALLOW" && row.decision === "VERIFY" && !row.deliveredOriginal) {
    return "الهارنس يسمح. البصمة تراقب (VERIFY)؛ لا إرسال حتى يراجع شخص."
  }
  return null
}

function impactChartBlock(rows: RunRow[], live: boolean) {
  return (
    <div className="flex flex-col gap-4">
      <ChartBarMultiple
        title="هارنس مقابل البصمة"
        description={
          live
            ? "100 = منع · 0 = سماح — العمود المختلف هو فرق المنتج"
            : "شكل توضيحي — اضغط التشغيل لاستبداله بنتيجة هذه الجلسة"
        }
        data={rows.map((row) => ({
          category: row.kind.split("—")[0]?.trim().slice(0, 14) || row.kind.slice(0, 14),
          seriesA: row.harness === "BLOCK" ? 100 : 0,
          seriesB:
            row.decision === "INTERVENE" || row.decision === "VERIFY" ? 100 : 0,
          fullLabel: row.kind,
        }))}
        config={{
          seriesA: { label: "هارنس", color: "var(--chart-3)" },
          seriesB: { label: "بصمة", color: "var(--chart-1)" },
        }}
        valueFormatter={(value) => (value >= 100 ? "منع" : "سماح")}
        truncateTick
      />
      <ChartPieDonut
        title="ماذا أُرسل"
        description="نسخة محذوفة مقابل أصل مُرسل"
        data={[
          {
            key: "redacted",
            label: "نسخة محذوفة",
            value: rows.filter((row) => row.intervention === "redact-sensitive").length,
          },
          {
            key: "original",
            label: "أصل مُرسل",
            value: rows.filter((row) => row.deliveredOriginal).length,
          },
        ].filter((slice) => slice.value > 0)}
        config={{
          redacted: { label: "نسخة محذوفة", color: "var(--chart-1)" },
          original: { label: "أصل مُرسل", color: "var(--chart-2)" },
        }}
      />
    </div>
  )
}

export function ImpactView() {
  const [running, setRunning] = React.useState(false)
  const [compareRunning, setCompareRunning] = React.useState(false)
  const [rows, setRows] = React.useState<RunRow[]>([])
  const [compareRows, setCompareRows] = React.useState<RunRow[]>([])
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

  async function runHarnessCompare() {
    setCompareRunning(true)
    setCompareRows([])
    try {
      const next: RunRow[] = []
      for (const spec of HARNESS_COMPARE_KINDS) {
        const outcome = await runOpsAgentClient({
          kind: spec.kind,
          environment: "dev",
          orgId: "demo",
        })
        next.push({
          kind: spec.titleAr,
          decision: String(outcome.result.decision),
          delivered: outcome.delivered,
          deliveredOriginal: outcome.deliveredOriginal,
          change: outcome.change,
          harness: outcome.harness,
          intervention: outcome.intervention,
          cut: outcome.cut ?? null,
        })
      }
      setCompareRows(next)
      toast.success("اكتملت مقارنة الهارنس (أربع حالات)")
      await refreshSession()
    } catch {
      toast.error("تعذر تشغيل مقارنة الهارنس. تأكد أن الخادم يعمل: npm start")
    } finally {
      setCompareRunning(false)
    }
  }

  async function runDemo() {
    setRunning(true)
    setRows([])
    try {
      const leak = await runOpsAgentClient({ kind: "leak", environment: "dev", orgId: "demo" })
      setRows((prev) => [
        ...prev,
        {
          kind: "تسريب معروف — هارنس والبصمة معًا",
          decision: String(leak.result.decision),
          delivered: leak.delivered,
          deliveredOriginal: leak.deliveredOriginal,
          change: leak.change,
          harness: leak.harness,
          intervention: leak.intervention,
        },
      ])

      const mutated = await runOpsAgentClient({
        kind: "mutated",
        environment: "dev",
        orgId: "demo",
      })
      setRows((prev) => [
        ...prev,
        {
          kind: "صياغة متغيرة — هارنس يسمح، البصمة تمنع",
          decision: String(mutated.result.decision),
          delivered: mutated.delivered,
          deliveredOriginal: mutated.deliveredOriginal,
          change: mutated.change,
          harness: mutated.harness,
          intervention: mutated.intervention,
          cut: mutated.cut ?? null,
        },
      ])

      const lookalike = await runOpsAgentClient({
        kind: "lookalike",
        environment: "dev",
        orgId: "demo",
      })
      setRows((prev) => [
        ...prev,
        {
          kind: "يشبه الخطر لفظيًا — السبب مختلف → سماح",
          decision: String(lookalike.result.decision),
          delivered: lookalike.delivered,
          deliveredOriginal: lookalike.deliveredOriginal,
          change: lookalike.change,
          harness: lookalike.harness,
          intervention: lookalike.intervention,
        },
      ])

      const safe = await runOpsAgentClient({ kind: "safe", environment: "dev", orgId: "demo" })
      setRows((prev) => [
        ...prev,
        {
          kind: "مسار مشروع → سماح",
          decision: String(safe.result.decision),
          delivered: safe.delivered,
          deliveredOriginal: safe.deliveredOriginal,
          change: safe.change,
          harness: safe.harness,
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
          deliveredOriginal: cross.deliveredOriginal,
          change: cross.change,
          harness: cross.harness,
          crossContext: Boolean(cross.result.crossContext),
          intervention: cross.intervention,
        },
      ])

      toast.success("اكتمل تشغيل الأثر: مقارنة هارنس، نسخة محذوفة، وشبيه لفظي")
      await refreshSession()
    } catch {
      toast.error("تعذر تشغيل وكيل العمليات. تأكد أن الخادم يعمل: npm start")
    } finally {
      setRunning(false)
    }
  }

  const tableRows = compareRows.length > 0 ? compareRows : rows

  return (
    <>
      <PageHeading
        eyebrow="IMPACT"
        title="أثر المنع على سير العمل"
        description="نفس الطلب مرتين: هارنس الأداة الآن، والبصمة للصياغة التالية. عند المنع تُرسل نسخة محذوفة."
        actions={
          <>
            {tableRows.length > 0 ? (
              <Badge variant="success">أرقام هذه الجلسة</Badge>
            ) : (
              <IllustrativeBadge />
            )}
            <Button
              variant="outline"
              disabled={compareRunning}
              onClick={() => void runHarnessCompare()}
            >
              {compareRunning ? "جاري المقارنة…" : "شغّل مقارنة الهارنس"}
            </Button>
            <Button disabled={running} onClick={() => void runDemo()}>
              {running ? "جاري التشغيل…" : "تشغيل سيناريوهات الفرق"}
            </Button>
          </>
        }
      />

      <Alert>
        <AlertTitle>المستفيد والقياس</AlertTitle>
        <AlertDescription>
          المستفيد: فريق تشغيل الوكيل داخل المؤسسة. التغيّر: عند INTERVENE تُرسل نسخة بلا بيانات
          حساسة، والأصل لا يُرسل. عند ALLOW يُرسل الأصل. القياس من الجلسة: منع{" "}
          {session?.blocked ?? 0} · مطابقة {Math.round((session?.matchRate ?? 0) * 100)}% · بيئات{" "}
          {session?.environmentCount ?? 0}. خريطة الربط الصادقة:{" "}
          <Link className="underline underline-offset-4" href="/architecture">
            المعمارية
          </Link>
          .
        </AlertDescription>
      </Alert>

      {impactChartBlock(
        tableRows.length > 0 ? tableRows : DEMO_IMPACT_ROWS,
        tableRows.length > 0
      )}

      {compareRows.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">جدول مقارنة الهارنس</CardTitle>
            <CardDescription>{HARNESS_DIFF}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-start text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="p-2 font-medium">الحالة</th>
                  <th className="p-2 font-medium">هارنس</th>
                  <th className="p-2 font-medium">بصمة</th>
                  <th className="p-2 font-medium">أصل مُرسل</th>
                  <th className="p-2 font-medium">القطع</th>
                  <th className="p-2 font-medium">جملة</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row.kind} className="border-b last:border-0">
                    <td className="p-2 font-medium">{row.kind}</td>
                    <td className="p-2">
                      <Badge variant="outline">{row.harness}</Badge>
                    </td>
                    <td className="p-2">
                      <Badge
                        variant={
                          row.decision === "INTERVENE"
                            ? "destructive"
                            : row.decision === "VERIFY"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {formatDecision(row.decision)}
                      </Badge>
                    </td>
                    <td className="p-2">{row.deliveredOriginal ? "نعم" : "لا"}</td>
                    <td className="p-2 text-xs">
                      {row.cut ? (
                        <Badge variant="secondary">{row.cut}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">
                      {humanSentence(row) || row.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">تشغيل الوكيل</CardTitle>
          <CardDescription>{HARNESS_DIFF}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              للمقارنة السريعة أمام اللجنة: «شغّل مقارنة الهارنس» (أربع حالات). للسيناريوهات
              الأوسع: «تشغيل سيناريوهات الفرق».
            </p>
          ) : (
            rows.map((row) => (
              <div
                key={row.kind}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{row.kind}</p>
                  <p className="text-xs text-muted-foreground">
                    {humanSentence(row) || row.change}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {harnessLabel(row.harness) ? (
                    <Badge variant="outline">{harnessLabel(row.harness)}</Badge>
                  ) : null}
                  <Badge variant={row.decision === "INTERVENE" ? "destructive" : "secondary"}>
                    بصمة: {formatDecision(row.decision)}
                  </Badge>
                  <Badge variant="outline">
                    {row.intervention === "redact-sensitive"
                      ? "نسخة محذوفة"
                      : row.deliveredOriginal
                        ? "أصل مُرسل"
                        : row.delivered
                          ? "delivered"
                          : "لا إرسال"}
                  </Badge>
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
          <p>
            نتيجة INTERVENE: تُستدعى deliver بنسخة محذوفة (بدون بيانات حساسة)، والأصل لا يُرسل.
            الحدث يُسجَّل بمصدر intercept ثم deliver.
          </p>
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
