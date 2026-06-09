"use client";

import { useMemo, useState } from "react";
import type { CalculatorAnswers } from "@/lib/visa-rules/gsm/calculator-schema";
import type { PointsResult } from "@/lib/visa-rules/types";
import { DEFAULT_COMPETITIVE } from "@/lib/visa-rules/gsm/competitive-targets";
import { suggestImprovements } from "@/lib/visa-rules/gsm/suggest-improvements";
import { buildScenarioPreviews } from "@/lib/visa-rules/gsm/scenario-compare";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

export function ResultsInsights({
  answers,
  result,
}: {
  answers: CalculatorAnswers;
  result: PointsResult;
}) {
  const [targetKind, setTargetKind] = useState<"competitive" | "minimum" | "custom">("competitive");
  const [customTarget, setCustomTarget] = useState("80");

  const { gap, suggestions, targetPoints } = useMemo(() => {
    const target =
      targetKind === "minimum"
        ? { kind: "minimum" as const }
        : targetKind === "custom"
          ? { kind: "custom" as const, points: Math.max(65, parseInt(customTarget, 10) || 65) }
          : { kind: "competitive" as const, visa: answers.visaSubclass };
    return suggestImprovements(answers, result, target);
  }, [answers, result, targetKind, customTarget]);

  const scenarios = useMemo(() => buildScenarioPreviews(answers, result), [answers, result]);

  return (
    <div className="space-y-6">
      <section aria-labelledby="target-heading">
        <h2 id="target-heading" className="mb-3 text-xl font-semibold">
          Target & suggestions
        </h2>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="target-kind">Target</Label>
            <NativeSelect
              id="target-kind"
              className="mt-1 min-w-[200px]"
              value={targetKind}
              onChange={(e) => setTargetKind(e.target.value as typeof targetKind)}
            >
              <option value="competitive">
                Competitive ({DEFAULT_COMPETITIVE[answers.visaSubclass]} pts)
              </option>
              <option value="minimum">EOI minimum (65 pts)</option>
              <option value="custom">Custom target</option>
            </NativeSelect>
          </div>
          {targetKind === "custom" && (
            <div>
              <Label htmlFor="custom-target">Points</Label>
              <Input
                id="custom-target"
                type="number"
                min={65}
                max={120}
                className="mt-1 w-24"
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
              />
            </div>
          )}
        </div>
        {gap > 0 && suggestions.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Gap: {gap} points to reach {targetPoints}
            </p>
            <ul className="space-y-2">
              {suggestions.map((s) => (
                <li key={s.id} className="rounded-xl border border-border bg-card p-4 text-sm shadow-sm">
                  <span className="font-medium text-emerald-700">+{s.delta}</span> {s.label}
                  <span className="ml-2 text-xs text-muted-foreground">({s.effort})</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            You meet or exceed the {targetPoints}-point target for this scenario.
          </p>
        )}
      </section>

      {scenarios.length > 0 && (
        <section aria-labelledby="scenarios-heading">
          <h2 id="scenarios-heading" className="mb-3 text-xl font-semibold">
            Quick what-if scenarios
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Indicative totals if you changed one factor (same Schedule 6D rules).
          </p>
          <ul className="space-y-2">
            {scenarios.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
              >
                <span>{s.label}</span>
                <span>
                  <span className="font-medium text-emerald-700">+{s.delta}</span>
                  <span className="ml-2 text-muted-foreground">→ {s.total} pts</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
