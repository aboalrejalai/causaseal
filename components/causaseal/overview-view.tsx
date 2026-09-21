"use client"

import Link from "next/link"
import * as React from "react"
import { Bar, BarChart, RadialBar, RadialBarChart } from "recharts"
import {
  FingerprintIcon,
  GaugeIcon,
  ShieldAlertIcon,
  TimerIcon,
} from "lucide-react"

import { CausalPath } from "@/components/causaseal/causal-path"
import { useLanguage } from "@/components/causaseal/language-provider"
import { IllustrativeBadge, PageHeading } from "@/components/causaseal/page-heading"
import { Stat } from "@/components/causaseal/stat"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import { fetchSession, type SessionSummary } from "@/lib/api/client"
import { SEED_EVENTS } from "@/lib/seed-data"

const sparkConfig = {
  value: { label: "أحداث", color: "var(--chart-1)" },
} satisfies ChartConfig

const sparkData = [
  { day: "1", value: 32 },
  { day: "2", value: 48 },
  { day: "3", value: 41 },
  { day: "4", value: 65 },
  { day: "5", value: 54 },
  { day: "6", value: 86 },
  { day: "7", value: 72 },
]

const riskConfig = {
  score: { label: "الخطر", color: "var(--chart-1)" },
} satisfies ChartConfig

const previewNodes = [
  { label: "مصدر غير موثوق", value: "PDF خارجي", risk: false },
  { label: "تأثير على القرار", value: "Prompt Injection", risk: true },
  { label: "أداة ذات صلاحية", value: "Cloud Storage", risk: true },
  { label: "وجهة غير مصرح بها", value: "External API", risk: true },
]

export function OverviewView() {
  const { t } = useLanguage()
  const [session, setSession] = React.useState<SessionSummary | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const load = () => {
      void fetchSession()
        .then((data) => {
          if (!cancelled) setSession(data)
        })
        .catch(() => {})
    }
    load()
    const timer = window.setInterval(load, 4000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  const live = Boolean(session?.hasSession)
  const feed = live && session?.recent?.length ? session.recent : SEED_EVENTS.slice(0, 4)
  const nodes =
    live && session?.lastAnalysis?.nodes?.length ? session.lastAnalysis.nodes : previewNodes
  const riskScore = live && session?.riskScore != null ? session.riskScore : 27
  const riskData = [{ name: "risk", score: riskScore, fill: "var(--chart-1)" }]

  return (
    <>
      <PageHeading
        eyebrow="نظرة تنفيذية مباشرة"
        title="مركز العمليات السببية"
        description="نفهم السبب، نتذكر الفشل، ونمنع إعادة تشكّله قبل الضرر."
        actions={
          <>
            {live ? <Badge variant="success">{t("session")}</Badge> : <IllustrativeBadge />}
            <Button asChild variant="outline">
              <Link href="/investigate?demo=1">عرض SAIF</Link>
            </Button>
            <Button asChild>
              <Link href="/investigate">تحليل حادث جديد</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          variant="gradient"
          icon={<ShieldAlertIcon className="size-5" />}
          label="تهديدات تم منعها"
          value={live ? String(session?.blocked ?? 0) : "12"}
          change="↑ 20%"
          changeLabel="عن الأمس"
          trend="up"
          sentiment="positive"
          changeVariant="chip"
        />
        <Stat
          variant="gradient"
          icon={<FingerprintIcon className="size-5" />}
          label="بصمات X-CFS"
          value={live ? String(session?.fingerprintCount ?? 0) : "3"}
          change="+1"
          changeLabel="هذا الأسبوع"
          trend="up"
          sentiment="positive"
        />
        <Stat
          variant="gradient"
          icon={<GaugeIcon className="size-5" />}
          label="دقة المطابقة"
          value={live ? `${Math.round((session?.matchRate ?? 0) * 100)}%` : "96.4%"}
          change="↑ 2.1%"
          changeLabel="Reformation"
          trend="up"
          sentiment="positive"
          changeVariant="chip"
        />
        <Stat
          variant="gradient"
          icon={<TimerIcon className="size-5" />}
          label="زمن القرار"
          value={
            live && session?.lastLatencyMs != null ? `${session.lastLatencyMs} ms` : "38 ms"
          }
          change="آمن"
          changeLabel="Causal Gate"
          trend="flat"
          sentiment="neutral"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="gap-4 py-4 xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-0">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">تدفق التهديدات الحي</CardTitle>
              <CardDescription>أحداث الوكلاء واستدعاءات الأدوات</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/monitor">عرض الكل</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-4">
            {feed.map((event) => (
              <div
                key={`${event.time}-${event.agent}-${event.tool}`}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">
                    {event.agent} · {event.tool}
                  </p>
                  <p className="text-xs text-muted-foreground">{event.path}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={
                      event.status === "blocked"
                        ? "destructive"
                        : event.status === "verify"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {event.label}
                  </Badge>
                  <time className="text-xs text-muted-foreground">{event.time}</time>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="gap-4 py-4">
          <CardHeader className="flex flex-row items-start justify-between gap-2 px-4 pb-0">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">مؤشر الخطر</CardTitle>
              <CardDescription>تحليل آخر 24 ساعة</CardDescription>
            </div>
            <Badge variant="success">مستقر</Badge>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 px-4">
            <ChartContainer config={riskConfig} className="mx-auto aspect-square h-40">
              <RadialBarChart
                data={riskData}
                startAngle={180}
                endAngle={0}
                innerRadius="60%"
                outerRadius="100%"
              >
                <RadialBar dataKey="score" background cornerRadius={8} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </RadialBarChart>
            </ChartContainer>
            <div className="text-center">
              <p className="text-3xl font-semibold">{riskScore}</p>
              <p className="text-xs text-muted-foreground">/ 100 · منخفض</p>
            </div>
            <Separator />
            <div className="grid w-full gap-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">حقن غير مباشر</span>
                <strong>6</strong>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">تجاوز صلاحيات</span>
                <strong>4</strong>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">تدفق بيانات حساس</span>
                <strong>2</strong>
              </div>
            </div>
            <ChartContainer config={sparkConfig} className="h-16 w-full">
              <BarChart data={sparkData}>
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-4 py-4">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 px-4 pb-0">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">آخر مسار سببي مكتشف</CardTitle>
            <CardDescription>INC-2409 · إعادة تشكّل لبصمة X-CFS-001</CardDescription>
          </div>
          <Badge variant="destructive">تم التدخل</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-4">
          <CausalPath nodes={nodes} />
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
            <span>
              ثقة الدليل{" "}
              <strong>
                {live && session?.lastAnalysis
                  ? `${Math.round(session.lastAnalysis.confidence * 100)}%`
                  : "94%"}
              </strong>
            </span>
            <span>
              البصمة{" "}
              <strong>{live && session?.lastAnalysis ? session.lastAnalysis.matchedSignature : "X-CFS-001"}</strong>
            </span>
            <span>
              زمن القرار{" "}
              <strong>
                {live && session?.lastLatencyMs != null ? `${session.lastLatencyMs} ms` : "1.8 ثانية"}
              </strong>
            </span>
            <Button asChild size="sm" className="ms-auto">
              <Link href="/investigate">فتح التحقيق</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
