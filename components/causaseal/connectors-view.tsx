"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { CheckIcon, CopyIcon, PlugIcon } from "lucide-react"

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
import { formatDecision } from "@/lib/decisions"
import {
  CONNECTOR_CARDS,
  INCIDENT_FIELDS,
  RUN_AGENT_RESULT_FIELDS,
  SDK_SNIPPET,
  mcpClientConfig,
  resolveMcpUrl,
} from "@/lib/connectors"
import { HARNESS_DIFF } from "@/lib/nav"

type TrialKind = "mutated" | "leak" | "lookalike"

type TrialRow = {
  kind: TrialKind
  labelAr: string
  labelEn: string
  harness?: string
  decision?: string
  deliveredOriginal?: boolean
  change?: string
  error?: string
}

const TRIALS: Array<{ kind: TrialKind; labelAr: string; labelEn: string }> = [
  {
    kind: "mutated",
    labelAr: "صياغة متغيرة — صف الفرق",
    labelEn: "Mutated phrasing — difference row",
  },
  {
    kind: "leak",
    labelAr: "تسريب معروف",
    labelEn: "Known leak",
  },
  {
    kind: "lookalike",
    labelAr: "لفظ يشبه والسبب مختلف",
    labelEn: "Lookalike wording, different cause",
  },
]

function harnessLabel(value?: string, lang: "ar" | "en" = "ar") {
  if (value === "BLOCK") return lang === "ar" ? "هارنس: منع" : "Harness: block"
  if (value === "ALLOW") return lang === "ar" ? "هارنس: سماح" : "Harness: allow"
  return null
}

export function ConnectorsView() {
  const { language } = useLanguage()
  const ar = language === "ar"
  const [orgId] = React.useState("demo")
  const [mcpUrl, setMcpUrl] = React.useState("http://127.0.0.1:4000/mcp")
  const [running, setRunning] = React.useState<TrialKind | "all" | null>(null)
  const [rows, setRows] = React.useState<TrialRow[]>([])

  React.useEffect(() => {
    setMcpUrl(resolveMcpUrl())
  }, [])

  async function copyText(text: string, okMsg: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(okMsg)
    } catch {
      toast.error(ar ? "تعذر النسخ" : "Copy failed")
    }
  }

  async function runTrial(kind: TrialKind) {
    setRunning(kind)
    try {
      const outcome = await runOpsAgentClient({ kind, orgId, environment: "dev" })
      const row: TrialRow = {
        kind,
        labelAr: TRIALS.find((t) => t.kind === kind)?.labelAr || kind,
        labelEn: TRIALS.find((t) => t.kind === kind)?.labelEn || kind,
        harness: outcome.harness,
        decision: outcome.result.decision,
        deliveredOriginal: outcome.deliveredOriginal,
        change: outcome.change,
      }
      setRows((prev) => {
        const rest = prev.filter((r) => r.kind !== kind)
        return [...rest, row]
      })
      toast.success(
        ar
          ? "سُجّل الحدث — افتح المراقبة لنفس orgId"
          : "Event recorded — open Monitor for the same orgId"
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setRows((prev) => [
        ...prev.filter((r) => r.kind !== kind),
        {
          kind,
          labelAr: TRIALS.find((t) => t.kind === kind)?.labelAr || kind,
          labelEn: TRIALS.find((t) => t.kind === kind)?.labelEn || kind,
          error: message,
        },
      ])
      toast.error(message)
    } finally {
      setRunning(null)
    }
  }

  async function runAll() {
    setRunning("all")
    const next: TrialRow[] = []
    for (const trial of TRIALS) {
      try {
        const outcome = await runOpsAgentClient({
          kind: trial.kind,
          orgId,
          environment: "dev",
        })
        next.push({
          kind: trial.kind,
          labelAr: trial.labelAr,
          labelEn: trial.labelEn,
          harness: outcome.harness,
          decision: outcome.result.decision,
          deliveredOriginal: outcome.deliveredOriginal,
          change: outcome.change,
        })
      } catch (error) {
        next.push({
          kind: trial.kind,
          labelAr: trial.labelAr,
          labelEn: trial.labelEn,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
    setRows(next)
    setRunning(null)
    toast.success(
      ar
        ? "سُجّلت الأحداث — افتح المراقبة لنفس orgId"
        : "Events recorded — open Monitor for the same orgId"
    )
  }

  const configJson = mcpClientConfig(mcpUrl)

  return (
    <>
      <PageHeading
        eyebrow={ar ? "الربط" : "Integration"}
        title={ar ? "الموصّلات" : "Connectors"}
        description={
          ar
            ? "من ينادي البوابة وكيف يُربط نظام الشريك — HTTP وMCP وSDK على نفس العقد."
            : "Who calls the gateway and how a partner system attaches — HTTP, MCP, and SDK on one contract."
        }
        actions={
          <Badge variant="outline" className="gap-1">
            <PlugIcon className="size-3.5" />
            orgId: {orgId}
          </Badge>
        }
      />

      <Alert>
        <AlertTitle>{ar ? "من ينادي البوابة" : "Who calls the gateway"}</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            {ar
              ? "المستفيد فريق يشغّل وكيلًا يملك أداة إرسال. الوكيل يبقى عندهم. CAUSASEAL يُستدعى مرة واحدة قبل تلك الأداة."
              : "The beneficiary is a team running an agent with a send tool. The agent stays with them. CAUSASEAL is called once before that tool."}
          </p>
          <p className="text-foreground font-medium">{HARNESS_DIFF}</p>
          <p>
            {ar
              ? "عند INTERVENE لا يُرسل الأصل؛ تُسلَّم نسخة محذوفة والمهمة تكمل. العزل بمفتاح orgId تحت orgs في ملف الحالة."
              : "On INTERVENE the original is not sent; a redacted copy is delivered and the task continues. Isolation is orgId under orgs in the state file."}
          </p>
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-3">
        {CONNECTOR_CARDS.map((card) => (
          <Card key={card.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">
                  {ar ? card.titleAr : card.titleEn}
                </CardTitle>
                <Badge variant="secondary">
                  {ar ? card.statusAr : card.statusEn}
                </Badge>
              </div>
              <CardDescription>{ar ? card.hookAr : card.hookEn}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex flex-col gap-3 text-sm">
              {card.endpoints ? (
                <ul className="space-y-1 font-mono text-xs">
                  {card.endpoints.map((ep) => (
                    <li key={ep}>{ep}</li>
                  ))}
                </ul>
              ) : null}

              {card.id === "mcp" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-md bg-muted px-2 py-1 text-xs">
                      {mcpUrl}
                    </code>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      onClick={() =>
                        void copyText(
                          mcpUrl,
                          ar ? "نُسخ رابط MCP" : "MCP URL copied"
                        )
                      }
                    >
                      <CopyIcon />
                    </Button>
                  </div>
                  <pre className="max-h-40 overflow-auto rounded-md bg-muted p-2 text-[11px] leading-relaxed">
                    {configJson}
                  </pre>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      void copyText(
                        configJson,
                        ar ? "نُسخ إعداد العميل" : "Client config copied"
                      )
                    }
                  >
                    <CopyIcon />
                    {ar ? "نسخ الإعداد" : "Copy config"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {ar
                      ? "المصادقة: None. من معه الرابط يقرأ ويكتب في حالة النموذج."
                      : "Auth: None. Anyone with the URL can read and write demo state."}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">
                      {ar ? "قراءة (5)" : "Read (5)"}
                    </p>
                    <ul className="space-y-1 text-xs">
                      {card.tools
                        ?.filter((t) => t.readOnly)
                        .map((t) => (
                          <li key={t.name} className="flex gap-2">
                            <Badge variant="outline" className="shrink-0">
                              RO
                            </Badge>
                            <span className="font-mono">{t.name}</span>
                          </li>
                        ))}
                    </ul>
                    <p className="pt-1 text-xs font-medium">
                      {ar ? "كتابة (5)" : "Write (5)"}
                    </p>
                    <ul className="space-y-1 text-xs">
                      {card.tools
                        ?.filter((t) => !t.readOnly)
                        .map((t) => (
                          <li key={t.name} className="font-mono">
                            {t.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {card.id === "sdk" ? (
                <div className="space-y-2">
                  <p className="font-mono text-xs">{card.sdkExport}</p>
                  <p className="text-xs text-muted-foreground">
                    {ar ? card.unpublishedNoteAr : card.unpublishedNoteEn}
                  </p>
                  <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 text-[11px] leading-relaxed">
                    {SDK_SNIPPET}
                  </pre>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {ar ? "جرّب كأنك نظام الشريك" : "Try as the partner system"}
          </CardTitle>
          <CardDescription>
            {ar
              ? "يستدعي POST /api/agent/run على المحرك الحقيقي ويسجّل في الجلسة."
              : "Calls POST /api/agent/run on the real engine and records into the session."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => void runAll()}
              disabled={running !== null}
            >
              {running === "all"
                ? ar
                  ? "جارٍ التشغيل…"
                  : "Running…"
                : ar
                  ? "تشغيل الحالات الثلاث"
                  : "Run three cases"}
            </Button>
            {TRIALS.map((trial) => (
              <Button
                key={trial.kind}
                type="button"
                variant="outline"
                disabled={running !== null}
                onClick={() => void runTrial(trial.kind)}
              >
                {running === trial.kind ? "…" : ar ? trial.labelAr : trial.labelEn}
              </Button>
            ))}
            <Button type="button" variant="ghost" asChild>
              <Link href="/monitor">{ar ? "المراقبة" : "Monitor"}</Link>
            </Button>
          </div>

          {rows.length > 0 ? (
            <ul className="space-y-3">
              {rows.map((row) => (
                <li
                  key={row.kind}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {ar ? row.labelAr : row.labelEn}
                    </p>
                    {row.error ? (
                      <p className="text-xs text-destructive">{row.error}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{row.change}</p>
                    )}
                  </div>
                  {!row.error ? (
                    <div className="flex flex-wrap gap-2">
                      {harnessLabel(row.harness, language) ? (
                        <Badge variant="outline">
                          {harnessLabel(row.harness, language)}
                        </Badge>
                      ) : null}
                      <Badge
                        variant={
                          row.decision === "INTERVENE" ? "destructive" : "secondary"
                        }
                      >
                        {ar ? "بصمة" : "Fingerprint"}:{" "}
                        {row.decision ? formatDecision(row.decision) : "—"}
                      </Badge>
                      <Badge variant="outline">
                        {row.deliveredOriginal
                          ? ar
                            ? "أصل مُرسل"
                            : "Original sent"
                          : ar
                            ? "بلا أصل"
                            : "No original"}
                      </Badge>
                      {row.kind === "mutated" &&
                      row.harness === "ALLOW" &&
                      row.decision === "INTERVENE" ? (
                        <Badge variant="success" className="gap-1">
                          <CheckIcon className="size-3" />
                          {ar ? "فرق عن الهارنس" : "Diff vs harness"}
                        </Badge>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{ar ? "العقد" : "Contract"}</CardTitle>
          <CardDescription>
            {ar
              ? "حقول IncidentInput وحقول رد runOpsAgent"
              : "IncidentInput fields and runOpsAgent response fields"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              IncidentInput
            </p>
            <ul className="space-y-1 font-mono text-xs">
              {INCIDENT_FIELDS.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              runOpsAgent
            </p>
            <ul className="space-y-1 font-mono text-xs">
              {RUN_AGENT_RESULT_FIELDS.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
