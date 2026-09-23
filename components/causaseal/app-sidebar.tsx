"use client"

import {
  FileBarChartIcon,
  FingerprintIcon,
  FlaskConicalIcon,
  GitBranchIcon,
  LayoutDashboardIcon,
  RadioIcon,
  TargetIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useLanguage } from "@/components/causaseal/language-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NAV_I18N, type TranslationKey } from "@/lib/i18n"
import { NAV_ITEMS } from "@/lib/nav"

const ICONS = {
  LayoutDashboard: LayoutDashboardIcon,
  Radio: RadioIcon,
  GitBranch: GitBranchIcon,
  Fingerprint: FingerprintIcon,
  FlaskConical: FlaskConicalIcon,
  FileBarChart: FileBarChartIcon,
  Target: TargetIcon,
} as const

type AppSidebarProps = {
  memoryCount?: number
}

export function AppSidebar({ memoryCount = 3 }: AppSidebarProps) {
  const pathname = usePathname()
  const { t, direction } = useLanguage()

  const operations = NAV_ITEMS.filter(
    (item) => NAV_I18N[item.href]?.group === "operations"
  )
  const analysis = NAV_ITEMS.filter(
    (item) => NAV_I18N[item.href]?.group === "analysis"
  )

  function renderGroup(items: (typeof NAV_ITEMS)[number][], labelKey: TranslationKey) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{t(labelKey)}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const Icon = ICONS[item.icon]
              const titleKey = NAV_I18N[item.href]?.titleKey
              const title = titleKey ? t(titleKey) : item.title
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={active} tooltip={title}>
                    <Link href={item.href}>
                      <Icon />
                      <span>{title}</span>
                      {"live" in item && item.live ? (
                        <span
                          className="ms-auto size-2 shrink-0 rounded-full bg-success group-data-[collapsible=icon]:hidden"
                          aria-hidden
                        />
                      ) : null}
                    </Link>
                  </SidebarMenuButton>
                  {"badgeKey" in item && item.badgeKey === "memory" ? (
                    <SidebarMenuBadge>{memoryCount}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <Sidebar
      side={direction === "rtl" ? "right" : "left"}
      collapsible="offcanvas"
      variant="inset"
    >
      <SidebarHeader>
        <div className="flex h-16 items-center gap-3 px-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
            CS
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-bold tracking-wide">
              CAUSASEAL
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {t("brand.subtitle")}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup(operations, "nav.operations")}
        {renderGroup(analysis, "nav.analysis")}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
