"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

import { useLanguage } from "@/components/causaseal/language-provider"
import { cn } from "@/lib/utils"

function useIsClient() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useLanguage()
  const mounted = useIsClient()
  const theme = mounted ? (resolvedTheme === "dark" ? "dark" : "light") : "light"

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-border/50 bg-muted/50 p-1"
      role="group"
      aria-label="theme"
    >
      {(
        [
          { value: "light" as const, Icon: SunIcon, label: t("topbar.themeLight") },
          { value: "dark" as const, Icon: MoonIcon, label: t("topbar.themeDark") },
        ] as const
      ).map(({ value, Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={theme === value}
          disabled={!mounted}
          onClick={() => setTheme(value)}
          className={cn(
            "flex size-7 items-center justify-center rounded-full transition-all",
            theme === value
              ? "bg-background text-foreground shadow-sm ring-2 ring-primary"
              : "text-muted-foreground hover:bg-accent/50"
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  )
}
