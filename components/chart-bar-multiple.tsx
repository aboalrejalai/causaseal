"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type BarMultiplePoint = {
  category: string
  seriesA: number
  seriesB?: number
  /** Full Arabic label for tooltip when category is abbreviated. */
  fullLabel?: string
}

type ChartBarMultipleProps = {
  title: string
  description?: string
  data: BarMultiplePoint[]
  config?: ChartConfig
  seriesAKey?: string
  seriesBKey?: string
  showSeriesB?: boolean
  valueFormatter?: (value: number) => string
  className?: string
  truncateTick?: boolean
}

const defaultConfig = {
  seriesA: {
    label: "السلسلة أ",
    color: "var(--chart-1)",
  },
  seriesB: {
    label: "السلسلة ب",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartBarMultiple({
  title,
  description,
  data,
  config = defaultConfig,
  seriesAKey = "seriesA",
  seriesBKey = "seriesB",
  showSeriesB = true,
  valueFormatter,
  className,
  truncateTick = false,
}: ChartBarMultipleProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                truncateTick && typeof value === "string" ? value.slice(0, 8) : String(value)
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  labelFormatter={(_value, payload) => {
                    const full = payload?.[0]?.payload?.fullLabel
                    return typeof full === "string" ? full : String(_value ?? "")
                  }}
                  formatter={
                    valueFormatter
                      ? (value) => valueFormatter(Number(value))
                      : undefined
                  }
                />
              }
            />
            <Bar dataKey={seriesAKey} fill={`var(--color-${seriesAKey})`} radius={4} />
            {showSeriesB ? (
              <Bar dataKey={seriesBKey} fill={`var(--color-${seriesBKey})`} radius={4} />
            ) : null}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
