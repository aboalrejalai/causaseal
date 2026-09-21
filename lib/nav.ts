export const NAV_ITEMS = [
  {
    title: "مركز العمليات",
    href: "/",
    icon: "LayoutDashboard",
  },
  {
    title: "المراقبة الحية",
    href: "/monitor",
    icon: "Radio",
    live: true,
  },
  {
    title: "التحليل السببي",
    href: "/investigate",
    icon: "GitBranch",
  },
  {
    title: "ذاكرة X-CFS",
    href: "/memory",
    icon: "Fingerprint",
    badgeKey: "memory" as const,
  },
  {
    title: "مختبر SERMG",
    href: "/lab",
    icon: "FlaskConical",
  },
  {
    title: "التقارير",
    href: "/reports",
    icon: "FileBarChart",
  },
  {
    title: "الفريق",
    href: "/team",
    icon: "Users",
  },
] as const

export const VIEW_TITLES: Record<string, string> = {
  "/": "مركز العمليات",
  "/monitor": "المراقبة الحية",
  "/investigate": "التحليل السببي",
  "/memory": "ذاكرة X-CFS",
  "/lab": "مختبر SERMG",
  "/reports": "التقارير",
  "/team": "الفريق",
}
