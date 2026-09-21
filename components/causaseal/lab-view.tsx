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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { runSermg } from "@/lib/api/client"
import type { MutationResult } from "@/lib/contracts"

export function LabView() {
  const [signatureId, setSignatureId] = React.useState("X-CFS-001")
  const [environment, setEnvironment] = React.useState<"cloud" | "enterprise" | "dev">("cloud")
  const [count, setCount] = React.useState(6)
  const [options, setOptions] = React.useState({
    changePrompt: true,
    changeTool: true,
    changeData: true,
    changePrivilege: false,
  })
  const [results, setResults] = React.useState<MutationResult[]>([])
  const [score, setScore] = React.useState<number | null>(null)
  const [running, setRunning] = React.useState(false)
  const [subtitle, setSubtitle] = React.useState("لم تبدأ التجربة بعد")

  async function handleRun() {
    setRunning(true)
    setResults([])
    setScore(null)
    setSubtitle("جاري توليد الطفرات السببية…")
    try {
      const data = await runSermg({ signatureId, count, environment, ...options })
      // Stream rows for demo feel
      for (let i = 0; i < data.results.length; i++) {
        await new Promise((r) => setTimeout(r, 120))
        setResults((prev) => [...prev, data.results[i]])
      }
      setScore(data.score)
      setSubtitle(`اكتملت ${data.results.length} محاكاة عبر البوابة السببية`)
      toast.success("اكتملت محاكاة SERMG")
    } catch {
      toast.error("تعذر تشغيل المختبر. تأكد أن خادم التحليل يعمل.")
    } finally {
      setRunning(false)
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="GENERATIVE MUTATION LAB"
        title="مختبر SERMG"
        description="محاكاة تغيّر السياق مع الحفاظ على ثوابت الفشل السببية."
        actions={
          <>
            <Badge variant="success">إعادة تشغيل التحليل</Badge>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,22rem)_1fr]">
        <Card className="gap-4 py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-base">إعداد التجربة</CardTitle>
            <CardDescription>اختر البصمة ونطاق الطفرات</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 px-4">
            <Field>
              <FieldLabel>البصمة الأصلية</FieldLabel>
              <Select value={signatureId} onValueChange={setSignatureId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="X-CFS-001">X-CFS-001 · تسريب بيانات</SelectItem>
                    <SelectItem value="X-CFS-002">X-CFS-002 · تجاوز صلاحيات</SelectItem>
                    <SelectItem value="X-CFS-003">X-CFS-003 · تسميم ذاكرة</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>البيئة المستهدفة</FieldLabel>
              <Select
                value={environment}
                onValueChange={(value) =>
                  setEnvironment(value as "cloud" | "enterprise" | "dev")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="cloud">السحابة</SelectItem>
                    <SelectItem value="enterprise">المؤسسة</SelectItem>
                    <SelectItem value="dev">التطوير</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>عدد الطفرات · {count}</FieldLabel>
              <Slider
                min={3}
                max={12}
                step={1}
                value={[count]}
                onValueChange={(v) => setCount(v[0] ?? 6)}
              />
            </Field>

            <FieldSet>
              <FieldLegend>أنواع التغيير</FieldLegend>
              {(
                [
                  ["changePrompt", "تغيير الـPrompt"],
                  ["changeTool", "تغيير الأداة"],
                  ["changeData", "تغيير نوع البيانات"],
                  ["changePrivilege", "تغيير الصلاحيات"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} orientation="horizontal">
                  <Checkbox
                    id={key}
                    checked={options[key]}
                    onCheckedChange={(v) =>
                      setOptions((prev) => ({ ...prev, [key]: v === true }))
                    }
                  />
                  <FieldLabel htmlFor={key} className="font-normal">
                    {label}
                  </FieldLabel>
                </Field>
              ))}
            </FieldSet>

            <Button onClick={handleRun} disabled={running} className="w-full">
              {running ? <Spinner data-icon="inline-start" /> : null}
              {running ? "جاري التشغيل…" : "توليد واختبار الطفرات"}
            </Button>
          </CardContent>
        </Card>

        <Card className="gap-4 py-4">
          <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-0">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">نتائج المحاكاة</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </div>
            <div className="text-2xl font-semibold">
              {score === null ? "—" : `${Math.round(score * 100)}%`}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-4">
            {score !== null ? <Progress value={score * 100} /> : null}
            {results.length === 0 && !running ? (
              <Empty className="border border-dashed py-10">
                <EmptyHeader>
                  <EmptyTitle>لم تبدأ التجربة</EmptyTitle>
                  <EmptyDescription>اختر الإعدادات ثم شغّل المحاكاة.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              results.map((row) => (
                <div
                  key={row.index}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(row.index).padStart(2, "0")}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <strong className="text-sm">{row.title}</strong>
                    <span className="text-xs text-muted-foreground">
                      التشابه السببي {Math.round(row.similarity * 100)}%
                      {row.crossContext
                        ? ` · اكتُشف في ${row.learnedIn === "dev" ? "التطوير" : row.learnedIn === "cloud" ? "السحابة" : "المؤسسة"} ومُنع في ${row.appliedIn === "cloud" ? "السحابة" : row.appliedIn === "dev" ? "التطوير" : "المؤسسة"}`
                        : ""}
                      {row.immunized ? " · لقاح جديد" : ""}
                    </span>
                  </div>
                  <Badge variant={row.outcome === "ALLOW" ? "success" : "destructive"}>
                    {row.outcome}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
