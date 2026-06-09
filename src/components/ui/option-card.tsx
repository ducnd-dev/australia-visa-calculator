"use client"

import { cn } from "@/lib/utils"

export function OptionCard({
  selected,
  onClick,
  className,
  children,
}: {
  selected: boolean
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "border-primary bg-primary/5 text-foreground"
          : "border-border bg-background hover:border-ring/50 hover:bg-muted/50",
        className
      )}
    >
      {children}
    </button>
  )
}
