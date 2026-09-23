"use client"

import { InfoIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { IllustrativeBadge, PageHeading } from "@/components/causaseal/page-heading"
import { ChartBarHorizontal } from "@/components/chart-bar-horizontal"
import { ChartRadarDots } from "@/components/chart-radar-dots"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchCompliance, fetchReportMetrics } from "@/lib/api/client"
import { metricsToHorizontalBars, metricsToRadar } from "@/lib/chart-session"
import type { ComplianceControl } from "@/lib/contracts"
import { evaluate as evaluateCompliance } from "@/lib/compliance-client"

const EXPERIMENTS = [
  {
    code: "A",
    phase: "LEARN",
    title: "تعلم من فشل معروف",
    desc: "إعادة بناء السبب وإنشاء بصمة.",
    status: "بانتظار العرض",
  },
  {
    code: "B",
    phase: "RECOGNIZE",
    title: "اكتشاف إعادة التشكّل",
    desc: "تغيّرت الصياغة وبقيت الثوابت السببية.",
    status: "بانتظار العرض",
  },
  {
    code: "C",
    phase: "ALLOW",
    title: "السماح بالسياق المشروع",
    desc: "أداة إرسال مع وجهة معتمدة.",
    status: "بانتظار العرض",
  },
]

export function ReportsView() {
  const [metrics, setMetrics] = React.useState<Array<{ label: string; value: number }>>([])
  const [fromSession, setFromSession] = React.useState(false)
  const [decisions, setDecisions] = React.useState<
    Array<{ decision: string; note: string; time: string }>
  >([])
  const [experiments, setExperiments] = React.useState(EXPERIMENTS)
  const [controls, setControls] = React.useState<ComplianceControl[]>(() => evaluateCompliance())
  const [snapshot, setSnapshot] = React.useState<{
    matchRate?: number
    prevention?: number
    correctAllow?: number
    metrics: Array<{ label: string; value: number }>
    decisions?: Array<{ decision: string; note: string; time: string }>
  } | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const load = () => {
      void fetchReportMetrics()
        .then((data) => {
          if (cancelled) return
          setMetrics(data.metrics || [])
          setFromSession(Boolean(data.fromSession))
          setSnapshot(data)
          if (data.decisions && data.decisions.length > 0) {
            setDecisions(data.decisions)
          } else if (!data.fromSession) {
            setDecisions([])
          }
          if (data.experiments) {
            setExperiments(
              EXPERIMENTS.map((exp) => {
                const done =
                  exp.code === "A"
                    ? data.experiments?.learn
                    : exp.code === "B"
                      ? data.experiments?.recognize
                      : data.experiments?.allow
                return { ...exp, status: done ? "من الجلسة" : "بانتظار العرض" }
              })
            )
          }
        })
        .catch(() => {
          if (!cancelled) {
            setMetrics([])
            setFromSession(false)
            setDecisions([])
          }
        })
      void fetchCompliance()
        .then((data) => {
          if (!cancelled) setControls(data.controls)
        })
        .catch(() => {
          if (!cancelled) setControls(evaluateCompliance())
        })
    }
    load()
    const timer = window.setInterval(load, 4000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  function downloadReport() {
    const content = JSON.stringify(
      {
        title: "CAUSASEAL session report",
        fromSession,
        matchRate: snapshot?.matchRate,
        prevention: snapshot?.prevention,
        correctAllow: snapshot?.correctAllow,
        metrics: snapshot?.metrics ?? metrics,
        decisions: snapshot?.decisions ?? decisions,
        feasibility: {
          runtime: "node server.js + JSON state file",
          integration: "one POST /api/gateway/intercept or /api/agent/run before the tool",
          multiTenant: "orgId isolates fingerprints under orgs in causaseal-state.json",
        },
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    )
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([content], { type: "application/json;charset=utf-8" }))
    a.download = "CAUSASEAL_Session_Report.json"
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success("تم تنزيل تقرير الجلسة")
  }

  return (
    <>
      <PageHeading
        eyebrow="EVIDENCE & METRICS"
        title="تقارير إثبات الـMVP"
        description="نتائج التجارب A / B / C دون ادعاءات نجاح مسبقة."
        actions={
          <>
            {fromSession ? <Badge variant="success">أرقام هذه الجلسة</Badge> : <IllustrativeBadge />}
            <Button onClick={downloadReport}>تنزيل التقرير التنفيذي</Button>
          </>
        }
      />

      {fromSession ? (
        <Alert>
          <InfoIcon />
          <AlertTitle>أرقام هذه الجلسة</AlertTitle>
          <AlertDescription>
            المقاييس محسوبة من تحليلات ومختبر هذه الجلسة فقط، وليست ادعاءً علميًا عامًا.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <InfoIcon />
          <AlertTitle>بيانات توضيحية</AlertTitle>
          <AlertDescription>
            لم تُسجَّل تحليلات في هذه الجلسة بعد. شغّل التحليل أو عرض SAIF لتظهر أرقام
            الجلسة.
          </AlertDescription>
        </Alert>
      )}

      {fromSession && metrics.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartRadarDots
            title="ملف الجلسة"
            description="المقاييس الستة من أحداث هذه الجلسة"
            data={metricsToRadar(metrics)}
            valueLabel="%"
          />
          <ChartBarHorizontal
            title="مقاييس الجلسة"
            description="نفس الأرقام كأعمدة أفقية للقراءة"
            data={metricsToHorizontalBars(metrics)}
            valueLabel="%"
            valueFormatter={(value) => `${value}%`}
          />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {experiments.map((exp) => (
          <Card key={exp.code} className="h-full gap-4 py-4">
            <CardHeader className="px-4 pb-0">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline">{exp.code}</Badge>
                <Badge
                  variant={exp.status === "بانتظار العرض" ? "outline" : "success"}
                >
                  {exp.status}
                </Badge>
              </div>
              <CardDescription>{exp.phase}</CardDescription>
              <CardTitle className="line-clamp-2 text-base">{exp.title}</CardTitle>
            </CardHeader>
            <CardContent className="line-clamp-3 px-4 text-sm text-muted-foreground">
              {exp.desc}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="gap-4 py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-base">مقاييس النموذج الأولي</CardTitle>
            <CardDescription>
              {fromSession ? "محسوبة من قرارات هذه الجلسة" : "فارغة حتى تبدأ الجلسة"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-4">
            {metrics.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا مقاييس حتى يمر تحليل عبر البوابة.</p>
            ) : (
              metrics.map((m) => (
              <div key={m.label} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span>{m.label}</span>
                  <strong>{Math.round(m.value * 100)}%</strong>
                </div>
                <Progress value={m.value * 100} />
              </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="gap-4 py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-base">سجل القرارات</CardTitle>
            <CardDescription>من أحداث هذه الجلسة</CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            {decisions.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا قرارات بعد.</p>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>القرار</TableHead>
                  <TableHead>الملاحظة</TableHead>
                  <TableHead>الوقت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisions.map((row) => (
                  <TableRow key={`${row.time}-${row.decision}`}>
                    <TableCell>
                      <Badge
                        variant={
                          row.decision === "INTERVENE"
                            ? "destructive"
                            : row.decision === "VERIFY"
                              ? "outline"
                              : "success"
                        }
                      >
                        {row.decision}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{row.note}</TableCell>
                    <TableCell className="font-mono text-xs">{row.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="gap-4 py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-base">جدوى التشغيل من المعمارية</CardTitle>
          <CardDescription>محسوبة مما بُني في المستودع</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 px-4 text-sm text-muted-foreground">
          <p>التكلفة: عملية server.js + ملف حالة JSON.</p>
          <p>الربط: نداء واحد قبل الأداة عبر /api/gateway/intercept أو /api/agent/run.</p>
          <p>جهة ثانية: عزل البصمات بمفتاح orgId تحت orgs في ملف الحالة.</p>
        </CardContent>
      </Card>

      <Card className="gap-4 py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-base">امتثال NCA / OWASP Agentic AI</CardTitle>
          <CardDescription>
            خريطة ضوابط أولية — الحالة partial/planned حتى اكتمال المحركات
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المعرّف</TableHead>
                <TableHead>الإطار</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="hidden md:table-cell">ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controls.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.framework}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{c.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.status === "mapped"
                          ? "success"
                          : c.status === "partial"
                            ? "outline"
                            : "warning"
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {c.notes}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
