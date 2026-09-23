"use client"

import * as React from "react"
import Link from "next/link"
import {
  CableIcon,
  ChevronLeftIcon,
  GlobeIcon,
  PackageIcon,
} from "lucide-react"

import { PageHeading } from "@/components/causaseal/page-heading"
import { useLanguage } from "@/components/causaseal/language-provider"
import { fetchSession, type SessionSummary } from "@/lib/api/client"
import { HUB_CARDS } from "@/lib/connectors"
import { cn } from "@/lib/utils"

const ICONS = {
  Globe: GlobeIcon,
  Cable: CableIcon,
  Package: PackageIcon,
} as const

function hubCount(session: SessionSummary | null, key: "intercept" | "mcp" | "sdk") {
  if (!session) return 0
  if (key === "intercept") return session.interceptCount ?? 0
  return session.channels?.[key] ?? 0
}

export function ConnectorsView() {
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

  return (
    <>
      <PageHeading
        eyebrow={ar ? "الربط" : "Integration"}
        title={ar ? "الموصّلات" : "Connectors"}
        description={
          ar
            ? "اختر طريقة الربط. كل بطاقة تفتح صفحة فيها الأرقام والشرح."
            : "Pick how to attach. Each card opens a page with numbers and plain steps."
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HUB_CARDS.map((card) => {
          const Icon = ICONS[card.icon]
          const value = hubCount(session, card.countKey)
          return (
            <Link
              key={card.id}
              href={card.href}
              className={cn(
                "group flex h-full min-w-0 flex-col gap-4 rounded-xl border bg-card p-5",
                "transition-colors hover:border-primary/40 hover:bg-primary/5"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <ChevronLeftIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 rtl:rotate-180" />
              </div>
              <div className="min-w-0 flex flex-col gap-1">
                <p className="font-semibold">{ar ? card.titleAr : card.titleEn}</p>
                <p className="text-sm text-muted-foreground">
                  {ar ? card.blurbAr : card.blurbEn}
                </p>
              </div>
              <div className="mt-auto flex flex-col gap-0.5">
                <p className="text-3xl font-bold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">
                  {ar ? "من هذه الجلسة" : "This session"}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
