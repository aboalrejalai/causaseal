"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Building2Icon,
  CableIcon,
  NetworkIcon,
  ShieldIcon,
} from "lucide-react"

import { PageHeading } from "@/components/causaseal/page-heading"
import { useLanguage } from "@/components/causaseal/language-provider"
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
import { runOpsAgentClient } from "@/lib/api/client"
import {
  ARCH_FLOW,
  ARCH_LATER,
  HARNESS_COMPARE_KINDS,
  STATUS_LABEL,
  type ArchStatus,
} from "@/lib/architecture"
import { formatDecision } from "@/lib/decisions"
import { HARNESS_DIFF } from "@/lib/nav"
import { cn } from "@/lib/utils"

type CompareRow = {
  kind: string
  title: string
  harness: string
  decision: string
  deliveredOriginal: boolean
  intervention: string | null
  cut: string | null
  change: string
  sentence: string
}

function statusVariant(status: ArchStatus): "success" | "secondary" | "outline" {
  if (status === "live") return "success"
  if (status === "simulated") return "secondary"
  return "outline"
}

function sentenceFor(
  harness: string,
  decision: string,
  deliveredOriginal: boolean,
  ar: boolean,
  cut: string | null
) {
  if (harness === "ALLOW" && decision === "INTERVENE" && !deliveredOriginal) {
    const cutBit = cut
      ? ar
        ? ` قُطعت: ${cut}.`
        : ` Cut: ${cut}.`
      : ""
    return ar
      ? `الهارنس سمح. البصمة منعت الأصل وأرسلت نسخة محذوفة.${cutBit}`
      : `Harness allowed. Fingerprint blocked the original and sent a redacted copy.${cutBit}`
  }
  if (harness === "BLOCK" && decision === "INTERVENE") {
    return ar
      ? "الهارنس منع الأداة الآن. البصمة سجّلت الشكل للنسخ التالية."
      : "Harness blocked this tool call. Fingerprint recorded the shape for later forms."
  }
  if (harness === "ALLOW" && decision === "ALLOW" && deliveredOriginal) {
    return ar
      ? "الاثنان سمحا؛ الأصل وصل للصندوق المحاكى."
      : "Both allowed; original reached the simulated outbox."
  }
  if (harness === "ALLOW" && decision === "VERIFY" && !deliveredOriginal) {
    return ar
      ? "الهارنس يسمح. البصمة تراقب (VERIFY)؛ لا إرسال حتى يراجع شخص."
      : "Harness allows. Fingerprint monitors (VERIFY); no send until a person reviews."
  }
  return ar
    ? `هارنس: ${harness} · بصمة: ${decision}`
    : `Harness: ${harness} · Fingerprint: ${decision}`
}

export function ArchitectureView() {
  const { language, direction } = useLanguage()
  const ar = language === "ar"
  const Arrow = direction === "rtl" ? ArrowLeftIcon : ArrowRightIcon
  const [running, setRunning] = React.useState(false)
  const [rows, setRows] = React.useState<CompareRow[]>([])
  const [healthLine, setHealthLine] = React.useState<string | null>(null)
  const [healthRunning, setHealthRunning] = React.useState(false)

  async function runHarnessCompare() {
    setRunning(true)
    setRows([])
    try {
      const next: CompareRow[] = []
      for (const spec of HARNESS_COMPARE_KINDS) {
        const outcome = await runOpsAgentClient({
          kind: spec.kind,
          orgId: "demo",
          environment: "dev",
        })
        const decision = String(outcome.result.decision)
        const cut = outcome.cut ?? null
        next.push({
          kind: spec.kind,
          title: ar ? spec.titleAr : spec.titleEn,
          harness: outcome.harness,
          decision,
          deliveredOriginal: outcome.deliveredOriginal,
          intervention: outcome.intervention,
          cut,
          change: outcome.change,
          sentence: sentenceFor(
            outcome.harness,
            decision,
            outcome.deliveredOriginal,
            ar,
            cut
          ),
        })
      }
      setRows(next)
      toast.success(ar ? "اكتملت مقارنة الهارنس (أربع حالات)" : "Harness compare finished (four cases)")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : ar
            ? "تعذر التشغيل — تأكد أن الخادم يعمل"
            : "Run failed — is the server up?"
      )
    } finally {
      setRunning(false)
    }
  }

  async function runHealthSim() {
    setHealthRunning(true)
    setHealthLine(null)
    try {
      const outcome = await runOpsAgentClient({
        kind: "health",
        orgId: "demo",
        environment: "enterprise",
      })
      const decision = String(outcome.result.decision)
      const line = ar
        ? `سيناريو صحي (محاكاة): هارنس ${outcome.harness} · بصمة ${formatDecision(decision)} · ${
            outcome.deliveredOriginal
              ? "أصل وصل لنظام السجلات الصحية (محاكاة)"
              : "الأصل لم يُرسل إلى النظام المحاكى — نسخة محذوفة فقط"
          }`
        : `Health scenario (simulated): harness ${outcome.harness} · fingerprint ${decision} · ${
            outcome.deliveredOriginal
              ? "original reached EHR (simulated)"
              : "original not sent to simulated system — redacted only"
          }`
      setHealthLine(line)
      toast.success(ar ? "سُجّل في المراقبة" : "Logged in monitor")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setHealthRunning(false)
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="ARCHITECTURE"
        title={ar ? "معمارية الربط الصادقة" : "Honest integration map"}
        description={
          ar
            ? "نفس قصة الفريق: بين الوكيل والأثر. الشارات تفرّق الموجود عن المحاكاة عن اللاحق."
            : "Team story: between agent and impact. Badges separate live, simulated, and later."
        }
        actions={
          <Button disabled={running} onClick={() => void runHarnessCompare()}>
            {running
              ? ar
                ? "جاري المقارنة…"
                : "Comparing…"
              : ar
                ? "شغّل مقارنة الهارنس"
                : "Run harness compare"}
          </Button>
        }
      />

      <Alert>
        <NetworkIcon className="size-4" />
        <AlertTitle>
          {ar ? "IAM وEHR وSIEM في شريحة الهدف" : "IAM, EHR, SIEM stay on the target slide"}
        </AlertTitle>
        <AlertDescription>
          {ar
            ? "الديمو يثبت بوابة القرار قبل الأثر عبر HTTP / MCP / SDK. لا Entra شغّال ولا نظام صحي حقيقي في هذه النسخة."
            : "The demo proves the decision gateway before impact over HTTP / MCP / SDK. No live Entra and no real EHR in this build."}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {ar ? "التدفق" : "Flow"}
          </CardTitle>
          <CardDescription>{HARNESS_DIFF}</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <ol className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-stretch">
            {ARCH_FLOW.map((node, index) => {
              const label = STATUS_LABEL[node.status]
              const body = (
                <div
                  className={cn(
                    "flex h-full min-w-0 flex-col gap-2 rounded-xl border p-4",
                    node.href && "transition-colors hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">{index + 1}</span>
                    <Badge variant={statusVariant(node.status)}>
                      {ar ? label.ar : label.en}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold">
                    {ar ? node.titleAr : node.titleEn}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ar ? node.blurbAr : node.blurbEn}
                  </p>
                </div>
              )
              return (
                <li
                  key={node.id}
                  className="flex min-w-0 flex-1 flex-col gap-2 lg:max-w-[14rem]"
                >
                  {node.href ? <Link href={node.href}>{body}</Link> : body}
                  {index < ARCH_FLOW.length - 1 ? (
                    <Arrow
                      className="mx-auto hidden size-4 shrink-0 text-muted-foreground lg:block"
                      aria-hidden
                    />
                  ) : null}
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        {ARCH_LATER.map((node) => {
          const label = STATUS_LABEL[node.status]
          return (
            <Card key={node.id} className="min-w-0">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ShieldIcon className="size-4 text-muted-foreground" />
                  <Badge variant="outline">{ar ? label.ar : label.en}</Badge>
                </div>
                <CardTitle className="text-base">
                  {ar ? node.titleAr : node.titleEn}
                </CardTitle>
                <CardDescription>
                  {ar ? node.blurbAr : node.blurbEn}
                </CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {ar ? "مقارنة الهارنس (أربع حالات)" : "Harness compare (four cases)"}
          </CardTitle>
          <CardDescription>
            {ar
              ? "أرقام حية من الجلسة — مو مزروعة. الصف الحرج: صياغة متغيرة مع قطع مسمّى. الصف الرابع: راقب ولا تمنع."
              : "Live session numbers — not seeded. Critical row: mutated phrasing with a named cut. Fourth row: monitor, do not block."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {ar
                ? "اضغط «شغّل مقارنة الهارنس» لملء الجدول من POST /api/agent/run."
                : "Press “Run harness compare” to fill the table from POST /api/agent/run."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] text-start text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="p-2 font-medium">{ar ? "الحالة" : "Case"}</th>
                    <th className="p-2 font-medium">{ar ? "هارنس" : "Harness"}</th>
                    <th className="p-2 font-medium">{ar ? "بصمة" : "Fingerprint"}</th>
                    <th className="p-2 font-medium">
                      {ar ? "أصل مُرسل" : "Original sent"}
                    </th>
                    <th className="p-2 font-medium">{ar ? "القطع" : "Cut"}</th>
                    <th className="p-2 font-medium">{ar ? "جملة" : "Sentence"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.kind} className="border-b last:border-0">
                      <td className="p-2 font-medium">{row.title}</td>
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
                      <td className="p-2">
                        {row.deliveredOriginal
                          ? ar
                            ? "نعم"
                            : "Yes"
                          : ar
                            ? "لا"
                            : "No"}
                      </td>
                      <td className="p-2 text-xs">
                        {row.cut ? (
                          <Badge variant="secondary">{row.cut}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="max-w-xs p-2 text-xs text-muted-foreground">
                        {row.sentence}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Link className="underline-offset-4 hover:underline" href="/connectors/http">
              HTTP
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/connectors/mcp">
              MCP
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/connectors/sdk">
              SDK
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/monitor">
              {ar ? "المراقبة" : "Monitor"}
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2Icon className="size-4" />
            {ar
              ? "سيناريو صحي واحد (محاكاة)"
              : "One health scenario (simulated)"}
          </CardTitle>
          <CardDescription>
            {ar
              ? "موظف → وكيل → CAUSASEAL → نظام السجلات الصحية (محاكاة) / بوابة البريد (محاكاة). الهوية = orgId demo — ربط IAM لاحقًا."
              : "Employee → agent → CAUSASEAL → EHR (simulated) / email gateway (simulated). Identity = orgId demo — IAM later."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {ar ? "نظام السجلات الصحية (محاكاة)" : "EHR (simulated)"}
            </Badge>
            <Badge variant="secondary">
              {ar ? "بوابة البريد (محاكاة)" : "Email gateway (simulated)"}
            </Badge>
            <Badge variant="outline">
              {ar ? "SOC العرض = المراقبة" : "Demo SOC = monitor"}
            </Badge>
          </div>
          <Button
            variant="outline"
            disabled={healthRunning}
            onClick={() => void runHealthSim()}
            className="w-fit"
          >
            <CableIcon className="size-4" />
            {healthRunning
              ? ar
                ? "جاري التشغيل…"
                : "Running…"
              : ar
                ? "شغّل السيناريو الصحي المحاكى"
                : "Run simulated health scenario"}
          </Button>
          {healthLine ? (
            <p className="text-sm text-muted-foreground">{healthLine}</p>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}
