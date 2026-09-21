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
import { PageHeading } from "@/components/causaseal/page-heading"
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchSession, type SessionSummary } from "@/lib/api/client"
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
  const feed = live && session?.recent?.length ? session.recent : []
  const nodes =
    live && session?.lastAnalysis?.nodes?.length ? session.lastAnalysis.nodes : EXAMPLE_NODES
  const riskScore = live && session?.riskScore != null ? session.riskScore : null

  return (
    <>
      <PageHeading
        eyebrow="نظرة تنفيذية مباشرة"
        title="مركز العمليات السببية"
        description={HARNESS_DIFF}
        actions={
          <>
            {live ? <Badge variant="success">{t("session")}</Badge> : null}
            <Button asChild variant="outline">
              <Link href="/investigate?demo=1">عرض SAIF</Link>
            </Button>
            <Button asChild>
              <Link href="/impact">تشغيل الأثر</Link>
            </Button>
          </>
        }
      />

      {!live ? (
        <Alert>
          <AlertTitle>مثال واحد قبل أي جلسة</AlertTitle>
          <AlertDescription>
            مهمة المستخدم: لخّص المرفق. النص المسترجع يطلب نقل أسرار الدخول إلى قناة خارج الفريق.
            الأداة: send_to_workspace. الوجهة غير معتمدة. شغّل عرض SAIF أو صفحة الأثر لترى المنع
            ثم السماح.
          </AlertDescription>
        </Alert>
      ) : null}

      {live ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            variant="gradient"
            icon={<ShieldAlertIcon className="size-5" />}
            label="تهديدات تم منعها"
            value={String(session?.blocked ?? 0)}
            changeLabel="من هذه الجلسة"
            trend="flat"
            sentiment="positive"
          />
          <Stat
            variant="gradient"
            icon={<FingerprintIcon className="size-5" />}
            label="بصمات X-CFS"
            value={String(session?.fingerprintCount ?? 0)}
            changeLabel="في الذاكرة"
            trend="flat"
            sentiment="positive"
          />
          <Stat
            variant="gradient"
            icon={<GaugeIcon className="size-5" />}
            label="دقة المطابقة"
            value={`${Math.round((session?.matchRate ?? 0) * 100)}%`}
            changeLabel="من أحداث الجلسة"
            trend="flat"
            sentiment="positive"
          />
          <Stat
            variant="gradient"
            icon={<TimerIcon className="size-5" />}
            label="زمن القرار"
            value={
              session?.lastLatencyMs != null ? `${session.lastLatencyMs} ms` : "—"
            }
            changeLabel="Causal Gate"
            trend="flat"
            sentiment="neutral"
          />
        </div>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>لا توجد أرقام جلسة بعد</EmptyTitle>
            <EmptyDescription>
              العدادات تظهر فقط بعد تحليل أو تشغيل وكيل العمليات. لا نعرض أرقامًا مزروعة.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/impact">اذهب إلى الأثر</Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}

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
                فارغ حتى يمر طلب عبر البوابة.
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
              {live ? "من أحداث الجلسة" : "يظهر بعد أول منع أو سماح"}
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
