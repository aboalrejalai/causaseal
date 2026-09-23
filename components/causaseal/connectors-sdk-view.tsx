"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  CheckCircle2Icon,
  CopyIcon,
  FileWarningIcon,
  HelpCircleIcon,
  PackageIcon,
} from "lucide-react"

import { ConnectorPageShell } from "@/components/causaseal/connector-page-shell"
import { Stat } from "@/components/causaseal/stat"
import { useLanguage } from "@/components/causaseal/language-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fetchSession, type SessionSummary } from "@/lib/api/client"
import { SDK_SNIPPET } from "@/lib/connectors"

export function ConnectorsSdkView() {
  const { language } = useLanguage()
  const ar = language === "ar"
  const [session, setSession] = React.useState<SessionSummary | null>(null)

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

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(SDK_SNIPPET)
      toast.success(ar ? "نُسخ المقطع" : "Snippet copied")
    } catch {
      toast.error(ar ? "تعذر النسخ" : "Copy failed")
    }
  }

  const stats = session?.connectorSdk ?? {
    total: 0,
    allow: 0,
    redacted: 0,
    verify: 0,
  }

  return (
    <ConnectorPageShell
      eyebrow="SDK"
      title={ar ? "SDK للشريك" : "Partner SDK"}
      description={
        ar
          ? "دالتان داخل وكيل الشريك: beforeTool ثم applySend."
          : "Two functions inside the partner agent: beforeTool then applySend."
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          variant="gradient"
          icon={<PackageIcon className="size-5" />}
          label={ar ? "نداءات SDK" : "SDK calls"}
          value={String(stats.total)}
          changeLabel={ar ? "من هذه الجلسة" : "This session"}
        />
        <Stat
          variant="gradient"
          icon={<CheckCircle2Icon className="size-5" />}
          label={ar ? "سماح" : "Allow"}
          value={String(stats.allow)}
          changeLabel={ar ? "من هذه الجلسة" : "This session"}
        />
        <Stat
          variant="gradient"
          icon={<FileWarningIcon className="size-5" />}
          label={ar ? "نسخة محذوفة" : "Redacted"}
          value={String(stats.redacted)}
          changeLabel={ar ? "من هذه الجلسة" : "This session"}
        />
        <Stat
          variant="gradient"
          icon={<HelpCircleIcon className="size-5" />}
          label={ar ? "إيقاف للمراجعة" : "Hold for review"}
          value={String(stats.verify)}
          changeLabel={ar ? "من هذه الجلسة" : "This session"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {ar ? "كيف يعمل" : "How it works"}
          </CardTitle>
          <CardDescription>
            {ar
              ? "نداءات SDK تُحسب لأنها تصدم نفس مسار HTTP مع رأس X-Causaseal-Channel: sdk."
              : "SDK calls count because they hit the same HTTP path with X-Causaseal-Channel: sdk."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <ol className="flex list-decimal flex-col gap-3 ps-5">
            <li>
              {ar
                ? "beforeTool يسأل البوابة قبل الإرسال."
                : "beforeTool asks the gateway before sending."}
            </li>
            <li>
              {ar
                ? "applySend عند السماح يبقي النص الأصلي."
                : "On allow, applySend keeps the original body."}
            </li>
            <li>
              {ar
                ? "عند التدخل يبدله بنص «أُزيلت البيانات الحساسة» ولا يرجّع السر. عند التحقق لا يُرجع جسم إرسال."
                : "On intervene it swaps in the redacted note and never returns the secret. On verify it returns no send body."}
            </li>
          </ol>
          <pre className="max-w-full overflow-x-auto break-all rounded-xl border bg-muted/50 p-3 text-[11px] leading-relaxed">
            {SDK_SNIPPET}
          </pre>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => void copySnippet()}>
              <CopyIcon />
              {ar ? "نسخ المقطع" : "Copy snippet"}
            </Button>
            <p className="text-xs text-muted-foreground">
              {ar
                ? "الملف داخل المستودع: connectors/sdk.mjs — غير منشور على npm."
                : "Repo file: connectors/sdk.mjs — not published to npm."}
            </p>
          </div>
        </CardContent>
      </Card>
    </ConnectorPageShell>
  )
}
