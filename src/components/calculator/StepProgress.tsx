"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function StepProgress({
  steps,
  current,
  onStepClick,
}: {
  steps: readonly string[];
  current: number;
  onStepClick?: (index: number) => void;
}) {
  const progress = ((current + 1) / steps.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-foreground">
          Step {current + 1} of {steps.length}
        </span>
        <span className="text-muted-foreground">{steps[current]}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={current + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
        />
      </div>
      <ol className="hidden gap-2 sm:grid sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          const canJump = onStepClick && i < current;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={!canJump}
                onClick={() => canJump && onStepClick(i)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs transition-colors",
                  active && "border-primary bg-primary/5 text-foreground",
                  done && !active && "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
                  !done && !active && "border-transparent text-muted-foreground",
                  canJump && "cursor-pointer",
                  !canJump && "cursor-default"
                )}
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                    active && "bg-primary text-primary-foreground",
                    done && !active && "bg-primary/20 text-primary",
                    !done && !active && "bg-muted text-muted-foreground"
                  )}
                >
                  {done && !active ? <Check className="size-3" /> : i + 1}
                </span>
                <span className="line-clamp-2 leading-tight">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
