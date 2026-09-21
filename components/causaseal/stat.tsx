/**
 * Stat — ported from UEP / Saudi NDS (lucide + Soft semantic tokens).
 */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const statVariants = cva("flex flex-col gap-1 rounded-xl p-6", {
  variants: {
    variant: {
      flat: "border bg-card text-card-foreground",
      elevated: "border-none bg-card text-card-foreground shadow-md",
      accent: "border border-primary/20 bg-primary/5 text-primary",
      gradient:
        "border border-primary/10 bg-gradient-to-br from-primary/10 to-transparent",
    },
    size: {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-10",
    },
  },
  defaultVariants: {
    variant: "flat",
    size: "md",
  },
})

type Trend = "up" | "down" | "flat"
type Sentiment = "positive" | "negative" | "neutral"

const TREND_ICONS: Record<Trend, React.ReactNode> = {
  up: <ArrowUpIcon className="size-4" aria-hidden />,
  down: <ArrowDownIcon className="size-4" aria-hidden />,
  flat: <MinusIcon className="size-4" aria-hidden />,
}

const TREND_SENTIMENT: Record<Trend, Sentiment> = {
  up: "positive",
  down: "negative",
  flat: "neutral",
}

function resolveSentiment(trend?: Trend, sentiment?: Sentiment): Sentiment | undefined {
  if (sentiment) return sentiment
  if (trend) return TREND_SENTIMENT[trend]
  return undefined
}

interface StatProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof statVariants> {
  label?: React.ReactNode
  value?: React.ReactNode
  change?: React.ReactNode
  changeLabel?: React.ReactNode
  trend?: Trend
  sentiment?: Sentiment
  changeVariant?: "text" | "chip"
  icon?: React.ReactNode
}

function Stat({
  variant,
  size,
  label,
  value,
  change,
  changeLabel,
  trend,
  sentiment,
  changeVariant = "text",
  icon,
  className,
  children,
  ...props
}: StatProps) {
  return (
    <div className={cn(statVariants({ variant, size }), className)} {...props}>
      {label || icon ? (
        <div className="flex items-center gap-2">
          {icon ? (
            <span className="size-5 shrink-0 text-muted-foreground" aria-hidden>
              {icon}
            </span>
          ) : null}
          {label ? (
            <div className="flex-1 text-sm font-medium text-muted-foreground">{label}</div>
          ) : null}
        </div>
      ) : null}

      {value ? <div className="text-3xl font-bold">{value}</div> : null}

      {change || changeLabel ? (
        <div className="mt-1 flex items-center gap-2">
          {change ? (
            <StatChange trend={trend} sentiment={sentiment} variant={changeVariant}>
              {change}
            </StatChange>
          ) : null}
          {changeLabel ? (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          ) : null}
        </div>
      ) : null}

      {children}
    </div>
  )
}

interface StatChangeProps extends React.ComponentProps<"div"> {
  trend?: Trend
  sentiment?: Sentiment
  variant?: "text" | "chip"
}

function StatChange({
  trend,
  sentiment,
  variant,
  className,
  children,
  ...props
}: StatChangeProps) {
  const resolvedSentiment = resolveSentiment(trend, sentiment)

  const sentimentStyles: Record<Sentiment, string> = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  }

  const chipStyles: Record<Sentiment, string> = {
    positive: "bg-success/15",
    negative: "bg-destructive/15",
    neutral: "bg-muted",
  }

  return (
    <div
      className={cn(
        "flex items-center text-sm font-semibold",
        resolvedSentiment && sentimentStyles[resolvedSentiment],
        variant === "chip" && "rounded-full px-2 py-0.5",
        variant === "chip" && resolvedSentiment && chipStyles[resolvedSentiment],
        className
      )}
      {...props}
    >
      {trend ? <span className="me-1">{TREND_ICONS[trend]}</span> : null}
      {children}
    </div>
  )
}

export { Stat, StatChange, statVariants }
export type { StatProps, StatChangeProps }
