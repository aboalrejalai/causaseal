export const NAV_ITEMS = [
  {
    title: "مركز العمليات",
    href: "/",
    icon: "LayoutDashboard",
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
    title: "الأثر",
    href: "/impact",
    icon: "Target",
  },
  {
    title: "الموصّلات",
    href: "/connectors",
    icon: "Plug",
  },
  {
    title: "المراقبة الحية",
    href: "/monitor",
    icon: "Radio",
    live: true,
  },
] as const

export const VIEW_TITLES: Record<string, string> = {
  "/": "مركز العمليات",
  "/investigate": "التحليل السببي",
  "/memory": "ذاكرة X-CFS",
  "/lab": "مختبر SERMG",
  "/reports": "التقارير",
  "/impact": "الأثر",
  "/connectors": "الموصّلات",
  "/connectors/http": "واجهة HTTP",
  "/connectors/mcp": "خادم MCP",
  "/connectors/sdk": "SDK للشريك",
  "/monitor": "المراقبة الحية",
}

/** One-line difference from a tool harness, shown on the first screen. */
export const HARNESS_DIFF =
  "موافقة الهارنس توقف هذه الأداة الآن. البصمة توقف الصياغة التالية لأن الثوابت هي نفسها."
