"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type AreaSeriesPoint = {
  label: string
  seriesA: number
  seriesB: number
}

type RangeOption = {
  value: string
  label: string
  take: number | null
}

const DEFAULT_RANGES: RangeOption[] = [
  { value: "7", label: "آخر 7 أحداث", take: 7 },
  { value: "20", label: "آخر 20 حدثًا", take: 20 },
  { value: "all", label: "كل الجلسة", take: null },
]

const defaultConfig = {
  seriesA: {
    label: "منع",
    color: "var(--chart-1)",
  },
  seriesB: {
    label: "سماح",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type ChartAreaInteractiveProps = {
  title: string
  description?: string
  data: AreaSeriesPoint[]
  config?: ChartConfig
  ranges?: RangeOption[]
  defaultRange?: string
  seriesAKey?: string
  seriesBKey?: string
}

export function ChartAreaInteractive({
  title,
  description,
  data,
  config = defaultConfig,
  ranges = DEFAULT_RANGES,
  defaultRange = "all",
  seriesAKey = "seriesA",
  seriesBKey = "seriesB",
}: ChartAreaInteractiveProps) {
  const [range, setRange] = React.useState(defaultRange)

  const filteredData = React.useMemo(() => {
    const option = ranges.find((item) => item.value === range) ?? ranges[ranges.length - 1]
    if (!option?.take) return data
    return data.slice(-option.take)
  }, [data, range, ranges])

  const fillA = `fill-${seriesAKey}`
  const fillB = `fill-${seriesBKey}`

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ms-auto sm:flex"
            aria-label="نطاق العرض"
          >
            <SelectValue placeholder={ranges[0]?.label} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectGroup>
              {ranges.map((option) => (
                <SelectItem key={option.value} value={option.value} className="rounded-lg">
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id={fillA} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${seriesAKey})`} stopOpacity={0.8} />
                <stop offset="95%" stopColor={`var(--color-${seriesAKey})`} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id={fillB} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${seriesBKey})`} stopOpacity={0.8} />
                <stop offset="95%" stopColor={`var(--color-${seriesBKey})`} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey={seriesBKey}
              type="natural"
              fill={`url(#${fillB})`}
              stroke={`var(--color-${seriesBKey})`}
              stackId="a"
            />
            <Area
              dataKey={seriesAKey}
              type="natural"
              fill={`url(#${fillA})`}
              stroke={`var(--color-${seriesAKey})`}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
