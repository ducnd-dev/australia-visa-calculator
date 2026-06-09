"use client";

import type { CalculatorAnswers } from "@/lib/visa-rules/gsm/calculator-schema";
import {
  ENGLISH_INSTRUMENT_DISCLAIMER,
  ENGLISH_LEVEL_GUIDES,
  ENGLISH_STEP_INTRO,
  getEnglishGuide,
} from "@/lib/visa-rules/gsm/english-guide";
import { Label } from "@/components/ui/label";
import { OptionCard } from "@/components/ui/option-card";
import { EnglishScoreConverter } from "./EnglishScoreConverter";

type EnglishLevel = CalculatorAnswers["english"];

export function EnglishLevelField({
  value,
  onChange,
  showIntro = true,
}: {
  value: EnglishLevel;
  onChange: (level: EnglishLevel) => void;
  showIntro?: boolean;
}) {
  const selected = getEnglishGuide(value);

  return (
    <div className="space-y-4">
      {showIntro && (
        <p className="text-sm leading-relaxed text-muted-foreground">{ENGLISH_STEP_INTRO}</p>
      )}
      <EnglishScoreConverter onApply={onChange} />
      <div>
        <Label className="mb-2 block">English level (Schedule 6D)</Label>
        <div className="grid gap-2">
          {ENGLISH_LEVEL_GUIDES.map((g) => (
            <OptionCard
              key={g.level}
              selected={value === g.level}
              onClick={() => onChange(g.level)}
            >
              <span className="font-medium">
                {g.label} ({g.points === 0 ? "0 pts" : `+${g.points} pts`})
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">{g.summary}</span>
            </OptionCard>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-foreground"
        role="region"
        aria-labelledby="english-detail-heading"
      >
        <h3 id="english-detail-heading" className="font-medium text-foreground">
          {selected.label} — what this means
        </h3>
        <p className="mt-2 leading-relaxed">{selected.detail}</p>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Illustrative test scores (verify current instrument)
        </p>
        <ul className="mt-2 space-y-2">
          {selected.tests.map((t) => (
            <li key={t.name}>
              <span className="font-medium text-foreground">{t.name}:</span>{" "}
              <span className="text-muted-foreground">{t.scores}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">{ENGLISH_INSTRUMENT_DISCLAIMER}</p>
      </div>
    </div>
  );
}
