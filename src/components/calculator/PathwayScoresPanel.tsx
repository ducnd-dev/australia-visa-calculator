"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AllPathwayScores } from "@/lib/visa-rules/gsm/calculate-all-pathways";
import { gsmPathwayByCode } from "@/lib/visa-rules/gsm/visa-pathways";
import { getVisasByCategory } from "@/lib/visa-rules/visa-catalog";
import { EOI_MINIMUM_POINTS } from "@/lib/visa-rules/sources";

const GSM_META = Object.fromEntries(getVisasByCategory("gsm").map((v) => [v.code, v]));

function tierVariant(tier: AllPathwayScores["pathways"][0]["tier"]) {
  if (tier === "strong") return "success" as const;
  if (tier === "competitive_band") return "warning" as const;
  return "default" as const;
}

function scoreTone(total: number) {
  if (total < EOI_MINIMUM_POINTS) return "text-destructive";
  if (total < 80) return "text-amber-600 dark:text-amber-500";
  return "text-primary";
}

export function PathwayScoresPanel({
  all,
  compact = false,
}: {
  all: AllPathwayScores;
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <p className={cn("text-sm text-muted-foreground", compact && "text-xs")}>
        Base Schedule 6D:{" "}
        <span className="font-semibold tabular-nums text-foreground">{all.baseTotal}</span> pts
        {all.pathways.some((p) => p.nominationPoints > 0) && " · nomination added per pathway below"}
      </p>
      <div className={cn("grid gap-3", compact ? "grid-cols-1" : "sm:grid-cols-3")}>
        {all.pathways.map((p) => {
          const selected = p.code === all.selectedSubclass;
          const meta = GSM_META[p.code];
          const pathway = gsmPathwayByCode(p.code);
          return (
            <div
              key={p.code}
              className={cn(
                "rounded-xl border px-4 py-3 transition-colors",
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card/80"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Subclass {p.code}
                  </p>
                  <p className={cn("text-sm font-medium text-foreground", compact && "text-xs")}>
                    {meta?.label ?? p.label}
                  </p>
                  {!compact && meta?.description && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {meta.description}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{pathway.shortLabel}</p>
                </div>
                {selected && (
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    Selected
                  </Badge>
                )}
              </div>
              <p className={cn("mt-2 text-3xl font-semibold tabular-nums", scoreTone(p.total), compact && "text-2xl")}>
                {p.total}
              </p>
              {p.nominationPoints > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">includes +{p.nominationPoints} nomination</p>
              )}
              <Badge variant={tierVariant(p.tier)} className="mt-2 text-[10px]">
                {p.tier === "below_minimum"
                  ? "Below EOI min"
                  : p.tier === "competitive_band"
                    ? "May lodge EOI"
                    : "Strong estimate"}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
