"use client"

import { InfoIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { IllustrativeBadge, PageHeading } from "@/components/causaseal/page-heading"
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
import { fetchReportMetrics } from "@/lib/api/client"
import type { ComplianceControl } from "@/lib/contracts"
import { evaluate as evaluateCompliance } from "@/lib/compliance-client"

const EXPERIMENTS = [
  {
    code: "A",
    phase: "LEARN",
    title: "تعلم من فشل معروف",
    desc: "إعادة بناء السبب وإنشاء X-CFS-001.",
    status: "مكتمل",
  },
  {
    code: "B",
    phase: "RECOGNIZE",
    title: "اكتشاف إعادة التشكّل",
    desc: "تغيّرت التفاصيل وبقيت الثوابت السببية.",
    status: "ناجح",
  },
  {
    code: "C",
    phase: "ALLOW",
    title: "السماح بالسياق المشروع",
    desc: "تشابه بنيوي مع صلاحية ووجهة معتمدة.",
    status: "ناجح",
  },
]

const DECISION_LOG = [
  { decision: "ALLOW", note: "سياق مشروع ووجهة معتمدة", time: "09:41" },
  { decision: "INTERVENE", note: "تسرّب محتمل عبر External API", time: "09:38" },
  { decision: "VERIFY", note: "صلاحية مرتفعة غير معتادة", time: "09:31" },
  { decision: "ALLOW", note: "استعلام قاعدة بيانات ضمن المهمة", time: "09:22" },
]

const DEFAULT_METRICS = [
  { label: "دقة إعادة البناء", value: 0.92 },
  { label: "دقة مطابقة Reformation", value: 0.96 },
  { label: "Recall للمسارات الخطرة", value: 0.89 },
  { label: "السماح الصحيح بالنشاط المشروع", value: 0.94 },
]

export function ReportsView() {
  const [metrics, setMetrics] = React.useState(DEFAULT_METRICS)
  const [fromSession, setFromSession] = React.useState(false)
  const [decisions, setDecisions] = React.useState(DECISION_LOG)
  const [experiments, setExperiments] = React.useState(EXPERIMENTS)
  const [controls] = React.useState<ComplianceControl[]>(() => evaluateCompliance())

  React.useEffect(() => {
    let cancelled = false
    const load = () => {
      void fetchReportMetrics()
        .then((data) => {
          if (cancelled) return
          setMetrics(data.metrics)
          setFromSession(Boolean(data.fromSession))
          if (data.decisions && data.decisions.length > 0) {
            setDecisions(data.decisions)
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
            setMetrics(DEFAULT_METRICS)
            setFromSession(false)
          }
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
    const content = [
      "CAUSASEAL — SAIF 2026 MVP REPORT",
      "A / LEARN: Completed",
      "B / RECOGNIZE: Passed",
      "C / ALLOW: Passed",
      "",
      "Prototype metrics are illustrative and must be replaced with measured experiment results before scientific presentation.",
    ].join("\n")
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }))
    a.download = "CAUSASEAL_MVP_Report.txt"
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success("تم تجهيز التقرير التنفيذي")
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
              {fromSession ? "محسوبة من قرارات هذه الجلسة" : "قيم توضيحية حتى يبدأ العرض"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-4">
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span>{m.label}</span>
                  <strong>{Math.round(m.value * 100)}%</strong>
                </div>
                <Progress value={m.value * 100} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="gap-4 py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-base">سجل القرارات</CardTitle>
            <CardDescription>عيّنة من قرارات البوابة</CardDescription>
          </CardHeader>
          <CardContent className="px-4">
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
          </CardContent>
        </Card>
      </div>

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
