"use client"

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"

type ChartRadialTextProps = {
  title: string
  description?: string
  value: number
  max?: number
  centerLabel?: string
  className?: string
}

export function ChartRadialText({
  title,
  description,
  value,
  max = 100,
  centerLabel = "",
  className,
}: ChartRadialTextProps) {
  const clamped = Math.max(0, Math.min(value, max))
  const endAngle = Math.round((clamped / Math.max(max, 1)) * 360)

  const chartData = [
    { metric: "score", value: clamped, fill: "var(--color-score)" },
  ]

  const chartConfig = {
    score: {
      label: centerLabel || title,
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

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
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={90 - endAngle}
            outerRadius={90}
            innerRadius={80}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[90, 80]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {Math.round(clamped)}
                        </tspan>
                        {centerLabel ? (
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            {centerLabel}
                          </tspan>
                        ) : null}
                      </text>
                    )
                  }
                  return null
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
