"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

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

export type RadarPoint = {
  axis: string
  value: number
}

type ChartRadarDotsProps = {
  title: string
  description?: string
  data: RadarPoint[]
  valueLabel?: string
  className?: string
}

export function ChartRadarDots({
  title,
  description,
  data,
  valueLabel = "القيمة",
  className,
}: ChartRadarDotsProps) {
  const chartConfig = {
    value: {
      label: valueLabel,
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card className={className}>
      <CardHeader className="items-center">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={data}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="axis" />
            <PolarGrid />
            <Radar
              dataKey="value"
              fill="var(--color-value)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
