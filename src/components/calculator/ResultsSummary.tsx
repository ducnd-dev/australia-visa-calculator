"use client";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LAST_UPDATED } from "@/lib/visa-rules/sources";
import type { AllPathwayScores } from "@/lib/visa-rules/gsm/calculate-all-pathways";
import type { CalculatorAnswers } from "@/lib/visa-rules/gsm/calculator-schema";
import type { PointsResult } from "@/lib/visa-rules/types";
import type { ImprovementSuggestion } from "@/lib/visa-rules/gsm/suggest-improvements";
import { EOI_MINIMUM_POINTS } from "@/lib/visa-rules/sources";
import { cn } from "@/lib/utils";
import { PathwayScoresPanel } from "./PathwayScoresPanel";
import { ResultsInsights } from "./ResultsInsights";

function tierVariant(tier: PointsResult["tier"]) {
  if (tier === "strong") return "success" as const;
  if (tier === "competitive_band") return "warning" as const;
  return "default" as const;
}

function scoreTone(total: number) {
  if (total < EOI_MINIMUM_POINTS) return "text-destructive";
  if (total < 80) return "text-amber-600 dark:text-amber-500";
  return "text-primary";
}

export function ResultsSummary({
  result,
  allPathways,
  suggestions,
  gap,
  shareUrl,
  answers,
  variant = "public",
  showAds = true,
}: {
  result: PointsResult;
  allPathways?: AllPathwayScores;
  suggestions: ImprovementSuggestion[];
  gap: number;
  shareUrl?: string;
  answers?: CalculatorAnswers;
  /** Agency app: hide ads and public calculator CTAs */
  variant?: "public" | "agency";
  /** When false, hide ads even on public variant (paid org) */
  showAds?: boolean;
}) {
  const isAgency = variant === "agency";
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Estimated total</p>
            <p className={cn("mt-1 text-5xl font-bold tabular-nums tracking-tight", scoreTone(result.total))}>
              {result.total}
              <span className="ml-2 text-2xl font-semibold text-muted-foreground">pts</span>
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{result.tierMessage}</p>
          </div>
          <Badge variant={tierVariant(result.tier)} className="text-sm">
            Subclass {result.visaSubclass}
          </Badge>
        </div>
      </div>

      {allPathways && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
            <CardTitle className="text-lg">All GSM pathway scores</CardTitle>
            <p className="text-sm text-muted-foreground">
              Same Schedule 6D answers — nomination points differ by subclass.
            </p>
          </CardHeader>
          <CardContent className="pt-5">
            <PathwayScoresPanel all={allPathways} />
          </CardContent>
        </Card>
      )}

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
          <CardTitle className="text-lg">Points breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <caption className="sr-only">Points breakdown</caption>
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th scope="col" className="px-5 py-3 font-medium">
                  Category
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Points
                </th>
              </tr>
            </thead>
            <tbody>
              {[...result.breakdown].sort((a, b) => b.points - a.points).map((line) => (
                <tr key={line.category} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3">
                    {line.category}
                    {line.note && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">{line.note}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{line.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {answers ? (
        <ResultsInsights answers={answers} result={result} />
      ) : (
        gap > 0 &&
        suggestions.length > 0 && (
          <section aria-labelledby="suggestions-heading">
            <h2 id="suggestions-heading" className="mb-3 text-xl font-semibold">
              Ways to reach your target
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Gap: {gap} points (indicative competitive target)
            </p>
            <ul className="space-y-2">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm"
                >
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">+{s.delta}</span>{" "}
                  {s.label}
                  <span className="ml-2 text-xs text-muted-foreground">({s.effort})</span>
                </li>
              ))}
            </ul>
          </section>
        )
      )}

      <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        Estimate only — not migration advice. Confirm on SkillSelect before lodging an EOI. Rules
        updated {LAST_UPDATED}.
      </div>

      {!isAgency && showAds && <AdSlot slot="results-below-summary" format="rectangle" />}

      {!isAgency && (
        <div className="flex flex-wrap gap-3">
          {shareUrl && (
            <Button type="button" onClick={() => navigator.clipboard.writeText(shareUrl)}>
              Copy share link
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/calculator">Start over</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
