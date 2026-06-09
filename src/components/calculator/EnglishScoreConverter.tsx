"use client";

import { useMemo, useState } from "react";
import type { CalculatorAnswers } from "@/lib/visa-rules/gsm/calculator-schema";
import {
  englishLevelFromBands,
  englishLevelLabel,
  type EnglishTest,
} from "@/lib/visa-rules/gsm/english-converter";
import { ENGLISH_INSTRUMENT_DISCLAIMER } from "@/lib/visa-rules/gsm/english-guide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

const BANDS = [
  { key: "listening" as const, label: "Listening" },
  { key: "reading" as const, label: "Reading" },
  { key: "writing" as const, label: "Writing" },
  { key: "speaking" as const, label: "Speaking" },
];

export function EnglishScoreConverter({ onApply }: { onApply: (level: CalculatorAnswers["english"]) => void }) {
  const [test, setTest] = useState<EnglishTest>("ielts");
  const [scores, setScores] = useState({ listening: "", reading: "", writing: "", speaking: "" });
  const [open, setOpen] = useState(false);

  const parsed = useMemo(() => {
    const nums = BANDS.map((b) => parseFloat(scores[b.key]));
    if (nums.some((n) => Number.isNaN(n))) return null;
    return {
      listening: nums[0],
      reading: nums[1],
      writing: nums[2],
      speaking: nums[3],
    };
  }, [scores]);

  const level = parsed ? englishLevelFromBands(test, parsed) : null;

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Convert test scores → level
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Test score converter</p>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
      <div>
        <Label htmlFor="english-test">Test</Label>
        <NativeSelect
          id="english-test"
          className="mt-1 w-full"
          value={test}
          onChange={(e) => setTest(e.target.value as EnglishTest)}
        >
          <option value="ielts">IELTS (each band)</option>
          <option value="pte">PTE Academic (each skill)</option>
        </NativeSelect>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {BANDS.map((b) => (
          <div key={b.key}>
            <Label htmlFor={`score-${b.key}`}>{b.label}</Label>
            <Input
              id={`score-${b.key}`}
              type="number"
              min={0}
              max={test === "ielts" ? 9 : 90}
              step={test === "ielts" ? 0.5 : 1}
              className="mt-1"
              value={scores[b.key]}
              onChange={(e) => setScores((s) => ({ ...s, [b.key]: e.target.value }))}
              placeholder={test === "ielts" ? "6.0" : "50"}
            />
          </div>
        ))}
      </div>
      {parsed && (
        <p className="text-sm">
          Suggested level: <strong>{englishLevelLabel(level)}</strong>
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!level}
          onClick={() => level && onApply(level)}
        >
          Apply to calculator
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{ENGLISH_INSTRUMENT_DISCLAIMER}</p>
    </div>
  );
}
