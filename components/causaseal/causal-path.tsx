import { ChevronLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { CausalNode } from "@/lib/contracts"

export function CausalPath({
  nodes,
  className,
}: {
  nodes: CausalNode[]
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-stretch md:gap-2",
        className
      )}
      role="list"
      aria-label="المسار السببي"
    >
      {nodes.map((node, index) => (
        <div key={`${node.label}-${index}`} className="flex flex-1 items-stretch gap-2" role="listitem">
          <div
            className={cn(
              "flex min-h-24 flex-1 flex-col gap-1 rounded-lg border p-3",
              node.risk
                ? "border-destructive/40 bg-[var(--status-error-bg)]"
                : "border-border bg-card"
            )}
          >
            <span className="text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <strong className="text-sm font-semibold">{node.label}</strong>
            <span className="text-xs text-muted-foreground">{node.value}</span>
          </div>
          {index < nodes.length - 1 ? (
            <div className="hidden items-center md:flex" aria-hidden>
              <ChevronLeftIcon className="size-4 text-muted-foreground rtl:rotate-180" />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
