"use client"

import Link from "next/link"
import * as React from "react"
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
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ChartPieDonut } from "@/components/chart-pie-donut"
import { ChartRadialText } from "@/components/chart-radial-text"
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
import { fetchEvents, fetchSession, type SessionSummary } from "@/lib/api/client"
import { DEMO_EVENTS, DEMO_SESSION_STATS } from "@/lib/chart-demo"
import {
  eventsToAreaSeries,
  eventsToDecisionPie,
} from "@/lib/chart-session"
import type { AgentEvent } from "@/lib/contracts"
import { formatDecision } from "@/lib/decisions"
import { HARNESS_DIFF } from "@/lib/nav"

const EXAMPLE_NODES = [
  { label: "مصدر الإدخال", value: "نص مسترجع موجّه", risk: true },
  { label: "تأثير القرار", value: "انقل أسرار الدخول", risk: true },
  { label: "استدعاء أداة", value: "send_to_workspace", risk: true },
  { label: "سياق الوجهة", value: "غير معتمد", risk: true },
]

export function OverviewView() {
  const { t } = useLanguage()
  const [session, setSession] = React.useState<SessionSummary | null>(null)
  const [events, setEvents] = React.useState<AgentEvent[]>([])

  React.useEffect(() => {
    let cancelled = false
    const load = () => {
      void fetchSession()
        .then((data) => {
          if (!cancelled) setSession(data)
        })
        .catch(() => {})
      void fetchEvents()
        .then((data) => {
          if (!cancelled) setEvents(data.events)
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
  const chartEvents = live && events.length > 0 ? events : DEMO_EVENTS
  const feed = live && session?.recent?.length ? session.recent : []
  const nodes =
    live && session?.lastAnalysis?.nodes?.length ? session.lastAnalysis.nodes : EXAMPLE_NODES
  const blocked = live ? (session?.blocked ?? 0) : DEMO_SESSION_STATS.blocked
  const fingerprintCount = live
    ? (session?.fingerprintCount ?? 0)
    : DEMO_SESSION_STATS.fingerprintCount
  const matchRate = live ? (session?.matchRate ?? 0) : DEMO_SESSION_STATS.matchRate
  const latencyMs = live ? session?.lastLatencyMs : DEMO_SESSION_STATS.lastLatencyMs
  const riskScore = live
    ? session?.riskScore != null
      ? session.riskScore
      : null
    : DEMO_SESSION_STATS.riskScore
  const areaData = eventsToAreaSeries(chartEvents)
  const pieData = eventsToDecisionPie(chartEvents)

  return (
    <>
      <PageHeading
        eyebrow="نظرة تنفيذية مباشرة"
        title="مركز العمليات السببية"
        description={HARNESS_DIFF}
        actions={
          <>
            {live ? (
              <Badge variant="success">{t("session")}</Badge>
            ) : (
              <IllustrativeBadge />
            )}
            <Button asChild variant="outline">
              <Link href="/investigate?demo=1">عرض SAIF</Link>
            </Button>
            <Button asChild>
              <Link href="/impact">تشغيل الأثر</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          variant="gradient"
          icon={<ShieldAlertIcon className="size-5" />}
          label="تهديدات تم منعها"
          value={String(blocked)}
          changeLabel={live ? "من هذه الجلسة" : "شكل توضيحي"}
          trend="flat"
          sentiment="positive"
        />
        <Stat
          variant="gradient"
          icon={<FingerprintIcon className="size-5" />}
          label="بصمات X-CFS"
          value={String(fingerprintCount)}
          changeLabel={live ? "في الذاكرة" : "شكل توضيحي"}
          trend="flat"
          sentiment="positive"
        />
        <Stat
          variant="gradient"
          icon={<GaugeIcon className="size-5" />}
          label="دقة المطابقة"
          value={`${Math.round(matchRate * 100)}%`}
          changeLabel={live ? "من أحداث الجلسة" : "شكل توضيحي"}
          trend="flat"
          sentiment="positive"
        />
        <Stat
          variant="gradient"
          icon={<TimerIcon className="size-5" />}
          label="زمن القرار"
          value={latencyMs != null ? `${latencyMs} ms` : "—"}
          changeLabel="Causal Gate"
          trend="flat"
          sentiment="neutral"
        />
      </div>

      {!live ? (
        <Alert>
          <AlertTitle>مثال واحد قبل أي جلسة</AlertTitle>
          <AlertDescription>
            الأشكال أعلاه توضيحية حتى تشغّل الأثر أو عرض SAIF. بعد التشغيل تُستبدل بأرقام هذه
            الجلسة. المهمة: لخّص المرفق؛ النص المسترجع يطلب نقل أسرار الدخول؛ الأداة
            send_to_workspace.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-4">
        <ChartAreaInteractive
          title="تدفق الجلسة"
          description={
            live
              ? "تراكم المنع والسماح عبر أحداث هذه الجلسة"
              : "شكل توضيحي — يتحدث بعد تشغيل الأثر"
          }
          data={areaData}
          config={{
            seriesA: { label: "منع", color: "var(--chart-1)" },
            seriesB: { label: "سماح", color: "var(--chart-2)" },
          }}
          defaultRange="all"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {pieData.length > 0 ? (
            <ChartPieDonut
              title="توزيع القرارات"
              description="تدخل · تحقق · سماح"
              data={pieData}
              config={{
                intervene: { label: "تدخل", color: "var(--chart-1)" },
                verify: { label: "تحقق", color: "var(--chart-3)" },
                allow: { label: "سماح", color: "var(--chart-2)" },
              }}
            />
          ) : null}
          {riskScore != null ? (
            <ChartRadialText
              title="درجة الخطر"
              description={live ? "من نسبة المنع في هذه الجلسة" : "شكل توضيحي"}
              value={riskScore}
              centerLabel="خطر"
            />
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="gap-4 py-4 xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-0">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">تدفق التهديدات الحي</CardTitle>
              <CardDescription>أحداث هذه الجلسة فقط</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/monitor">عرض الكل</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-4">
            {feed.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                فارغ حتى يمر طلب عبر البوابة. شغّل صفحة الأثر لملء الجلسة.
              </p>
            ) : (
              feed.map((event) => (
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
                      {formatDecision(event.label)}
                    </Badge>
                    <time className="text-xs text-muted-foreground">{event.time}</time>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="gap-4 py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-base">مؤشر الخطر</CardTitle>
            <CardDescription>
              {live ? "من أحداث الجلسة" : "شكل توضيحي حتى أول تشغيل"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2 px-4">
            <p className="text-3xl font-semibold">{riskScore == null ? "—" : riskScore}</p>
            {live && session?.lastAnalysis ? (
              <p className="text-center text-xs text-muted-foreground">
                {formatDecision(session.lastAnalysis.decision)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="gap-4 py-4">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-base">
            {live ? "آخر مسار سببي" : "مسار المثال"}
          </CardTitle>
          <CardDescription>
            {live
              ? "من آخر تحليل في الجلسة"
              : "مثال المفاتيح والوجهة الخارجية — اضغط عرض SAIF لإعادة التشغيل"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <CausalPath nodes={nodes} />
          {!live ? (
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/investigate?demo=1">عرض SAIF</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}
