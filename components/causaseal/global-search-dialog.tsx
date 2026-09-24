"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import {
  FileBarChartIcon,
  FingerprintIcon,
  FlaskConicalIcon,
  GitBranchIcon,
  LayoutDashboardIcon,
  NetworkIcon,
  PlugIcon,
  RadioIcon,
  TargetIcon,
} from "lucide-react"

import { useLanguage } from "@/components/causaseal/language-provider"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { NAV_I18N, type TranslationKey } from "@/lib/i18n"

const SEARCH_ITEMS: Array<{
  href: string
  titleKey: TranslationKey
  icon: React.ComponentType<{ className?: string }>
}> = [
  { href: "/", titleKey: "nav.overview", icon: LayoutDashboardIcon },
  { href: "/monitor", titleKey: "nav.monitor", icon: RadioIcon },
  { href: "/investigate", titleKey: "nav.investigate", icon: GitBranchIcon },
  { href: "/memory", titleKey: "nav.memory", icon: FingerprintIcon },
  { href: "/lab", titleKey: "nav.lab", icon: FlaskConicalIcon },
  { href: "/reports", titleKey: "nav.reports", icon: FileBarChartIcon },
  { href: "/impact", titleKey: "nav.impact", icon: TargetIcon },
  { href: "/architecture", titleKey: "nav.architecture", icon: NetworkIcon },
  { href: "/connectors", titleKey: "nav.connectors", icon: PlugIcon },
]

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const { t } = useLanguage()

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={t("topbar.search")} />
      <CommandList>
        <CommandEmpty>{t("search.empty")}</CommandEmpty>
        <CommandGroup heading={t("search.pages")}>
          {SEARCH_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.href}
                value={`${t(item.titleKey)} ${NAV_I18N[item.href]?.titleKey ?? ""}`}
                onSelect={() => {
                  onOpenChange(false)
                  router.push(item.href)
                }}
              >
                <Icon className="size-4" />
                <span>{t(item.titleKey)}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
