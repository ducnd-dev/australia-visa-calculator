"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EOI_MINIMUM_POINTS } from "@/lib/visa-rules/sources";
import type { AllPathwayScores } from "@/lib/visa-rules/gsm/calculate-all-pathways";
import type { PointsResult } from "@/lib/visa-rules/types";
import { cn } from "@/lib/utils";
import { PathwayScoresPanel } from "./PathwayScoresPanel";

function scoreTone(total: number) {
  if (total < EOI_MINIMUM_POINTS) return "text-destructive";
  if (total < 80) return "text-amber-600 dark:text-amber-500";
  return "text-primary";
}

export function PointsPreview({
  result,
  allPathways,
}: {
  result: PointsResult | null;
  allPathways?: AllPathwayScores | null;
}) {
  const total = result?.total ?? 0;
  const pct = Math.min(100, Math.round((total / 100) * 100));

  return (
    <Card className="overflow-hidden lg:sticky lg:top-24">
      <CardHeader className="border-b border-border bg-muted/30 pb-4">
        <CardTitle className="text-base font-medium">Live score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {allPathways ? (
          <PathwayScoresPanel all={allPathways} compact />
        ) : (
          <>
            <div className="flex items-end justify-between gap-2">
              <p className={cn("text-5xl font-semibold tabular-nums tracking-tight", scoreTone(total))}>
                {total}
              </p>
              <span className="pb-1 text-sm text-muted-foreground">/ 100+</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  total >= EOI_MINIMUM_POINTS ? "bg-primary" : "bg-destructive/70"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        )}
        <p className="text-xs text-muted-foreground">
          EOI minimum: {EOI_MINIMUM_POINTS} points · Updates as you answer
        </p>
        {result && result.breakdown.some((l) => l.points > 0) && (
          <>
            <Separator />
            <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
              {result.breakdown
                .filter((l) => l.points > 0)
                .map((l) => (
                  <li key={l.category} className="flex justify-between gap-2 text-muted-foreground">
                    <span className="truncate">{l.category}</span>
                    <span className="shrink-0 font-medium text-foreground">+{l.points}</span>
                  </li>
                ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
