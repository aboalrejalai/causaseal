"use client"

import { SearchIcon } from "lucide-react"
import * as React from "react"

import { useLanguage } from "@/components/causaseal/language-provider"
import { IllustrativeBadge, PageHeading } from "@/components/causaseal/page-heading"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchEvents } from "@/lib/api/client"
import type { AgentEvent } from "@/lib/contracts"
import { cn } from "@/lib/utils"
import { SEED_EVENTS } from "@/lib/seed-data"

const FILTERS = [
  { value: "all", key: "filter.all" as const },
  { value: "blocked", key: "filter.blocked" as const },
  { value: "verify", key: "filter.verify" as const },
  { value: "allowed", key: "filter.allowed" as const },
]

export function MonitorView() {
  const { t } = useLanguage()
  const [filter, setFilter] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [events, setEvents] = React.useState<AgentEvent[]>(SEED_EVENTS)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    void fetchEvents({ status: filter, q: query })
      .then((data) => {
        if (!cancelled) {
          setEvents(data.events)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          let list = SEED_EVENTS
          if (filter !== "all") list = list.filter((e) => e.status === filter)
          if (query) {
            const q = query.toLowerCase()
            list = list.filter((e) =>
              Object.values(e).join(" ").toLowerCase().includes(q)
            )
          }
          setEvents(list)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [filter, query])

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      void fetchEvents({ status: filter, q: query })
        .then((data) => setEvents(data.events))
        .catch(() => {})
    }, 4000)
    return () => window.clearInterval(timer)
  }, [filter, query])

  return (
    <>
      <PageHeading
        eyebrow="LIVE TELEMETRY"
        title={t("nav.monitor")}
        description="تتبّع قرارات الوكلاء قبل تنفيذ الأدوات."
        actions={
          <>
            <IllustrativeBadge />
            <Badge variant="success" className="gap-1.5">
              <span className="size-1.5 animate-pulse rounded-full bg-success" aria-hidden />
              {t("live")}
            </Badge>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex w-full max-w-full flex-nowrap items-center overflow-x-auto rounded-full border border-border/50 bg-muted/50 p-1"
          role="group"
          aria-label="filters"
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap",
                filter === f.value
                  ? "bg-background text-primary shadow-sm ring-2 ring-primary"
                  : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              {t(f.key)}
            </button>
          ))}
        </div>
        <InputGroup className="max-w-sm shrink-0">
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={t("search.events")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="overflow-hidden rounded-xl border">
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : events.length === 0 ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyTitle>{t("search.empty")}</EmptyTitle>
              <EmptyDescription>جرّب تغيير الفلتر أو كلمة البحث.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الوقت</TableHead>
                <TableHead>الوكيل</TableHead>
                <TableHead>استدعاء الأداة</TableHead>
                <TableHead className="hidden md:table-cell">المسار</TableHead>
                <TableHead>القرار</TableHead>
                <TableHead>الثقة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event, index) => (
                <TableRow key={`${event.time}-${event.tool}-${event.agent}-${index}`}>
                  <TableCell className="font-mono text-xs">{event.time}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{event.agent}</span>
                      <span className="text-xs text-muted-foreground">Agentic AI</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{event.tool}</span>
                      <span className="text-xs text-muted-foreground">Tool call</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {event.path}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        event.status === "blocked"
                          ? "destructive"
                          : event.status === "verify"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {event.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{event.confidence}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  )
}
