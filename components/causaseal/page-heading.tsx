"use client"

import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/causaseal/language-provider"

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-0 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1.5">
        {eyebrow ? (
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function IllustrativeBadge() {
  const { t } = useLanguage()
  return <Badge variant="outline">{t("illustrative")}</Badge>
}
