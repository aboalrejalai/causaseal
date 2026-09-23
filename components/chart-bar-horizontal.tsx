"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"

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

export type BarHorizontalPoint = {
  label: string
  value: number
}

type ChartBarHorizontalProps = {
  title: string
  description?: string
  data: BarHorizontalPoint[]
  valueLabel?: string
  valueFormatter?: (value: number) => string
  className?: string
}

export function ChartBarHorizontal({
  title,
  description,
  data,
  valueLabel = "القيمة",
  valueFormatter,
  className,
}: ChartBarHorizontalProps) {
  const chartConfig = {
    value: {
      label: valueLabel,
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 8,
              right: 8,
            }}
          >
            <XAxis type="number" dataKey="value" hide />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={120}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={
                    valueFormatter
                      ? (value) => valueFormatter(Number(value))
                      : undefined
                  }
                />
              }
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
