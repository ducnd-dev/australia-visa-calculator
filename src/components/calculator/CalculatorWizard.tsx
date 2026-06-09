"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckboxField } from "@/components/forms/checkbox-field";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { OptionCard } from "@/components/ui/option-card";
import { AdSlot } from "@/components/ads/AdSlot";
import { PageIntro } from "@/components/layout/PageIntro";
import { EnglishLevelField } from "./EnglishLevelField";
import { PointsPreview } from "./PointsPreview";
import { ResultsSummary } from "./ResultsSummary";
import { StepProgress } from "./StepProgress";
import { WizardActions } from "./WizardActions";
import { calculateAllPathways, calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { VisaStepSelector } from "./VisaStepSelector";
import { encodeAnswers } from "@/lib/visa-rules/gsm/encode-answers";
import { buildResultsShareUrl } from "@/lib/share-url";
import {
  defaultTargetForVisa,
  suggestImprovements,
} from "@/lib/visa-rules/gsm/suggest-improvements";
import type { CalculatorAnswers } from "@/lib/visa-rules/gsm/calculator-schema";

const STEPS = ["Visa", "Age & English", "Employment", "Education", "Partner & extras", "Results"] as const;

function parseVisaParam(value: string | null): CalculatorAnswers["visaSubclass"] {
  if (value === "190" || value === "491" || value === "189") return value;
  return "189";
}

const defaultAnswers: CalculatorAnswers = {
  visaSubclass: "189",
  ageBand: "25-32",
  english: "competent",
  overseasYears: "0",
  australianYears: "0",
  qualification: "bachelor",
  australianStudy: false,
  regionalStudy: false,
  specialistEducation: false,
  naati: false,
  professionalYear: false,
  partnerStatus: "single",
};

export function CalculatorWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<CalculatorAnswers>(() => ({
    ...defaultAnswers,
    visaSubclass: parseVisaParam(searchParams.get("visa")),
  }));

  const result = useMemo(() => {
    try {
      return calculatePoints(answers);
    } catch {
      return null;
    }
  }, [answers]);

  const allPathways = useMemo(() => {
    try {
      return calculateAllPathways(answers);
    } catch {
      return null;
    }
  }, [answers]);

  const suggestionsData = useMemo(() => {
    if (!result) return { gap: 0, suggestions: [] };
    return suggestImprovements(answers, result, defaultTargetForVisa(answers.visaSubclass));
  }, [answers, result]);

  const set = <K extends keyof CalculatorAnswers>(key: K, value: CalculatorAnswers[K]) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const rawEmp =
    (answers.overseasYears === "0" ? 0 : answers.overseasYears === "3" ? 5 : answers.overseasYears === "5" ? 10 : 15) +
    (answers.australianYears === "0" ? 0 : answers.australianYears === "1" ? 5 : answers.australianYears === "3" ? 10 : answers.australianYears === "5" ? 15 : 20);

  const onFinish = () => {
    const encoded = encodeAnswers(answers);
    router.push(`/results?d=${encoded}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:py-8 lg:pb-8">
      <div className="pointer-events-none fixed inset-x-0 top-16 -z-10 h-80 bg-gradient-to-b from-primary/8 via-sky-400/5 to-transparent" aria-hidden />
      <PageIntro
        eyebrow="Schedule 6D"
        title="Skilled migration points calculator"
        description="One Schedule 6D assessment — see points for subclasses 189, 190, and 491 together as you answer."
      />

      <div className="mb-6">
        <StepProgress steps={STEPS} current={step} onStepClick={(i) => setStep(i)} />
      </div>

      {result && step < STEPS.length - 1 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm lg:hidden">
          <span className="text-sm text-muted-foreground">Estimated score</span>
          <span className="text-2xl font-semibold tabular-nums text-primary">{result.total}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <Card className="border-border/80 bg-card/95 shadow-md backdrop-blur-sm">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle>{STEPS[step]}</CardTitle>
            <CardDescription>
              {step === STEPS.length - 1
                ? "Review your breakdown and share a link to this estimate."
                : "Answer for your situation at invitation (estimate only)."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {step === 0 && (
              <VisaStepSelector
                selected={answers.visaSubclass}
                onSelect={(code) => set("visaSubclass", code)}
                allPathways={allPathways}
              />
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">Age band</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(["18-24", "25-32", "33-39", "40-44", "45+"] as const).map((b) => (
                      <OptionCard key={b} selected={answers.ageBand === b} onClick={() => set("ageBand", b)}>{b}</OptionCard>
                    ))}
                  </div>
                </div>
                <EnglishLevelField value={answers.english} onChange={(level) => set("english", level)} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Overseas skilled employment (last 10 years)</Label>
                  <NativeSelect value={answers.overseasYears} onChange={(e) => set("overseasYears", e.target.value as CalculatorAnswers["overseasYears"])}>
                    <option value="0">Less than 3 years</option>
                    <option value="3">3–4 years</option>
                    <option value="5">5–7 years</option>
                    <option value="8">8–10 years</option>
                  </NativeSelect>
                </div>
                <div>
                  <Field>
                    <FieldLabel htmlFor="australianYears">Australian skilled employment (last 10 years)</FieldLabel>
                    <NativeSelect id="australianYears" value={answers.australianYears} onChange={(e) => set("australianYears", e.target.value as CalculatorAnswers["australianYears"])}>
                    <option value="0">Less than 1 year</option>
                    <option value="1">1–2 years</option>
                    <option value="3">3–4 years</option>
                    <option value="5">5–7 years</option>
                    <option value="8">8–10 years</option>
                  </NativeSelect>
                  </Field>
                </div>
                <p className="text-sm text-muted-foreground">Combined employment points: {Math.min(rawEmp, 20)}/20 max (Schedule 6D.5)</p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Highest qualification</Label>
                  <NativeSelect value={answers.qualification} onChange={(e) => set("qualification", e.target.value as CalculatorAnswers["qualification"])}>
                    <option value="none">None recognised</option>
                    <option value="diploma">Diploma / trade (+10)</option>
                    <option value="bachelor">Bachelor / Master (+15)</option>
                    <option value="doctorate">Doctorate (+20)</option>
                  </NativeSelect>
                </div>
                {[
                  ["australianStudy", "Australian study requirement (+5)"],
                  ["regionalStudy", "Regional study (+5)"],
                  ["specialistEducation", "Specialist STEM education (+10)"],
                ].map(([key, label]) => (
                  <CheckboxField
                    key={key}
                    id={key}
                    label={label}
                    checked={answers[key as keyof CalculatorAnswers] as boolean}
                    onCheckedChange={(v) => set(key as keyof CalculatorAnswers, v as never)}
                  />
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Partner points are separate from your own English band. If your partner is included in the visa application,
                  they must usually show at least <strong>Competent English</strong> (same test thresholds as above) for the +5 band,
                  or a suitable skills assessment plus Competent English for the +10 band.
                </p>
                <div className="grid gap-2">
                  <OptionCard selected={answers.partnerStatus === "single"} onClick={() => set("partnerStatus", "single")}>
                    <span className="font-medium">Single, or partner is Australian citizen / PR (+10)</span>
                    <span className="mt-1 block text-xs text-muted-foreground">Partner not included as a secondary applicant, or exempt</span>
                  </OptionCard>
                  <OptionCard selected={answers.partnerStatus === "partner-english"} onClick={() => set("partnerStatus", "partner-english")}>
                    <span className="font-medium">Partner with Competent English only (+5)</span>
                    <span className="mt-1 block text-xs text-muted-foreground">Included partner meets English only — no eligible skills assessment</span>
                  </OptionCard>
                  <OptionCard selected={answers.partnerStatus === "partner-skilled"} onClick={() => set("partnerStatus", "partner-skilled")}>
                    <span className="font-medium">Partner skills assessment + Competent English (+10)</span>
                    <span className="mt-1 block text-xs text-muted-foreground">Partner has positive skills assessment in a nominated occupation</span>
                  </OptionCard>
                </div>
                {[
                  ["naati", "NAATI/CCL (+5)"],
                  ["professionalYear", "Professional Year (+5)"],
                ].map(([key, label]) => (
                  <CheckboxField
                    key={key}
                    id={`extra-${key}`}
                    label={label}
                    checked={answers[key as keyof CalculatorAnswers] as boolean}
                    onCheckedChange={(v) => set(key as keyof CalculatorAnswers, v as never)}
                  />
                ))}
              </div>
            )}

            {step === 5 && result && allPathways && (
              <ResultsSummary
                result={result}
                allPathways={allPathways}
                suggestions={suggestionsData.suggestions}
                gap={suggestionsData.gap}
                shareUrl={buildResultsShareUrl(encodeAnswers(answers))}
                answers={answers}
              />
            )}

            <WizardActions
              step={step}
              totalSteps={STEPS.length}
              onBack={() => setStep((s) => s - 1)}
              onNext={() => setStep((s) => s + 1)}
              onFinish={onFinish}
              finishLabel="Share results page"
            />
          </CardContent>
        </Card>

        <div className="hidden space-y-6 lg:block">
          <PointsPreview result={result} allPathways={allPathways} />
          <AdSlot slot="calculator-sidebar" format="sidebar" />
        </div>
      </div>
    </div>
  );
}
