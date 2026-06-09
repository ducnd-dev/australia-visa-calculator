"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/layout/SectionCard";
import type { PointsResult } from "@/lib/visa-rules/types";
import type { ImprovementSuggestion } from "@/lib/visa-rules/gsm/suggest-improvements";

type Props = {
  result: PointsResult;
  suggestions: ImprovementSuggestion[];
  gap: number;
  targetPoints?: number;
  assessmentId?: string;
};

export function AiExplainPanel({ result, suggestions, gap, targetPoints, assessmentId }: Props) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onExplain() {
    setLoading(true);
    setError(null);
    try {
      const body = assessmentId
        ? { assessmentId }
        : {
            result: {
              total: result.total,
              visaSubclass: result.visaSubclass,
              tier: result.tier,
              tierMessage: result.tierMessage,
              breakdown: result.breakdown,
            },
            suggestions: suggestions.map((s) => ({
              label: s.label,
              delta: s.delta,
              effort: s.effort,
            })),
            gap,
            targetPoints,
          };

      const res = await fetch("/api/ai/explain-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as { explanation?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      setExplanation(data.explanation ?? "");
    } catch {
      setError("Could not reach AI service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      title="AI explanation"
      description="Plain-language summary for your client. Points are never recalculated by AI."
      className="border-primary/20 bg-primary/[0.02]"
      contentClassName="space-y-4"
    >
      {!explanation && (
        <Button type="button" variant="outline" onClick={onExplain} disabled={loading} className="gap-2">
          <Sparkles className="size-4" aria-hidden />
          {loading ? "Generating…" : "Generate explanation"}
        </Button>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {explanation && (
        <div className="space-y-3">
          <div className="whitespace-pre-wrap rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground shadow-sm">
            {explanation}
          </div>
          <p className="text-xs text-muted-foreground">
            AI-generated summary only. Scores come from the Schedule 6D calculator — not migration
            advice. Verify on official Home Affairs sources before lodging.
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={() => setExplanation(null)}>
            Clear
          </Button>
        </div>
      )}
    </SectionCard>
  );
}
