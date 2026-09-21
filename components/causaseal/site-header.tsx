"use client"

import { LanguagesIcon, SearchIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"

import { GlobalSearchDialog } from "@/components/causaseal/global-search-dialog"
import { useLanguage } from "@/components/causaseal/language-provider"
import { ThemeToggle } from "@/components/causaseal/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NAV_I18N } from "@/lib/i18n"

export function SiteHeader() {
  const pathname = usePathname()
  const { t, toggleLanguage } = useLanguage()
  const [searchOpen, setSearchOpen] = React.useState(false)

  const titleKey = NAV_I18N[pathname]?.titleKey
  const title = titleKey ? t(titleKey) : t("shell.protection")

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[var(--topbar-height)] shrink-0 items-center gap-2 border-b border-border/30 bg-card px-2 sm:px-4 dark:bg-sidebar">
        <SidebarTrigger className="-ms-0.5" aria-label={t("topbar.menu")} />

        <div className="hidden min-w-0 flex-col gap-0.5 sm:flex">
          <span className="truncate text-xs text-muted-foreground">
            {t("shell.protection")}
          </span>
          <span className="truncate text-sm font-semibold">{title}</span>
        </div>

        <div className="flex flex-1 justify-center px-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="relative hidden w-full max-w-md cursor-pointer items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-muted-foreground transition-colors hover:bg-muted md:flex"
          >
            <SearchIcon className="size-4 shrink-0" />
            <span className="truncate text-sm">{t("topbar.search")}</span>
            <span className="ms-auto rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">
              {t("topbar.searchShortcut")}
            </span>
          </button>
        </div>

        <div className="ms-auto flex items-center gap-1 sm:gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={t("topbar.search")}
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon />
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                aria-label={t("topbar.language")}
              >
                <LanguagesIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("topbar.language")}</TooltipContent>
          </Tooltip>

          <ThemeToggle />
        </div>
      </header>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
