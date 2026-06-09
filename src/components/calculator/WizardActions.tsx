"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function WizardActions({
  step,
  totalSteps,
  onBack,
  onNext,
  nextLabel = "Continue",
  finishLabel,
  onFinish,
  className,
}: {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
  finishLabel?: string;
  onFinish?: () => void;
  className?: string;
}) {
  const isLast = step >= totalSteps - 1;
  const isFirst = step === 0;

  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none",
        className
      )}
    >
      <Button type="button" variant="outline" disabled={isFirst} onClick={onBack} className="gap-1">
        <ChevronLeft className="size-4" aria-hidden />
        Back
      </Button>
      {!isLast ? (
        <Button type="button" onClick={onNext} className="gap-1">
          {nextLabel}
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      ) : finishLabel && onFinish ? (
        <Button type="button" onClick={onFinish}>
          {finishLabel}
        </Button>
      ) : null}
    </div>
  );
}
