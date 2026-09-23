"use client"

import { Pie, PieChart } from "recharts"

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

export type PieSlice = {
  key: string
  label: string
  value: number
  fill?: string
}

type ChartPieDonutProps = {
  title: string
  description?: string
  data: PieSlice[]
  config?: ChartConfig
  className?: string
}

export function ChartPieDonut({
  title,
  description,
  data,
  config,
  className,
}: ChartPieDonutProps) {
  const chartConfig =
    config ??
    Object.fromEntries(
      data.map((slice, index) => [
        slice.key,
        {
          label: slice.label,
          color: `var(--chart-${(index % 5) + 1})`,
        },
      ])
    ) satisfies ChartConfig

  const chartData = data.map((slice) => ({
    key: slice.key,
    value: slice.value,
    fill: slice.fill ?? `var(--color-${slice.key})`,
  }))

  if (chartData.length === 0) return null

  return (
    <Card className={className ? `flex flex-col ${className}` : "flex flex-col"}>
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[220px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="key" innerRadius={60} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
