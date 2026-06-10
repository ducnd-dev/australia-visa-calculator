"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAssessment } from "@/app/(app)/app/actions";
import type { CalculatorAnswers } from "@/lib/visa-rules/gsm/calculator-schema";
import { EnglishLevelField } from "./EnglishLevelField";
import { calculateAllPathways, calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { VisaStepSelector } from "./VisaStepSelector";
import { CheckboxField } from "@/components/forms/checkbox-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { OptionCard } from "@/components/ui/option-card";
import { Textarea } from "@/components/ui/textarea";
import { SimpleField } from "@/components/forms/simple-field";
import { ResultsSummary } from "./ResultsSummary";
import { defaultTargetForVisa, suggestImprovements } from "@/lib/visa-rules/gsm/suggest-improvements";

// Re-export step UI by embedding simplified flow: use same state as CalculatorWizard pattern
import { PointsPreview } from "./PointsPreview";
import { StepProgress } from "./StepProgress";
import { WizardActions } from "./WizardActions";
import { CardDescription } from "@/components/ui/card";
import { AiExplainPanel } from "@/components/ai/AiExplainPanel";

const STEPS = ["Visa", "Age & English", "Employment", "Education", "Partner & extras", "Results"] as const;

const defaultAnswers: CalculatorAnswers = {
  visaSubclass: "189", ageBand: "25-32", english: "competent", overseasYears: "0", australianYears: "0",
  qualification: "bachelor", australianStudy: false, regionalStudy: false, specialistEducation: false,
  naati: false, professionalYear: false, partnerStatus: "single",
};

const PARTNER_LABELS: Record<CalculatorAnswers["partnerStatus"], string> = {
  single: "Single / partner AU citizen or PR (+10)",
  "partner-english": "Partner competent English (+5)",
  "partner-skilled": "Partner skills + English (+10)",
};

export function AgencyCalculatorWizard({
  clientId,
  clientName,
  clientEmail,
}: {
  clientId: string;
  clientName: string;
  clientEmail: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<CalculatorAnswers>(defaultAnswers);
  const [agentNotes, setAgentNotes] = useState("");
  const [sendEmailAfterSave, setSendEmailAfterSave] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const result = useMemo(() => { try { return calculatePoints(answers); } catch { return null; } }, [answers]);
  const allPathways = useMemo(() => { try { return calculateAllPathways(answers); } catch { return null; } }, [answers]);
  const suggestionsData = useMemo(() => result ? suggestImprovements(answers, result, defaultTargetForVisa(answers.visaSubclass)) : { gap: 0, suggestions: [] }, [answers, result]);
  const set = <K extends keyof CalculatorAnswers>(key: K, val: CalculatorAnswers[K]) => setAnswers((p) => ({ ...p, [key]: val }));

  const onSave = () => {
    startTransition(async () => {
      const res = await saveAssessment({
        clientId,
        answers,
        agentNotes,
        sendEmailAfterSave: sendEmailAfterSave && !!clientEmail,
      });
      if (res.error) { setSaveError(res.error); return; }
      const params = new URLSearchParams();
      if (res.emailSent) params.set("emailSent", "1");
      if (res.emailError) params.set("emailError", res.emailError);
      const qs = params.toString();
      router.push(`/app/clients/${clientId}${qs ? `?${qs}` : ""}`);
    });
  };

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Client: <span className="font-semibold text-foreground">{clientName}</span>
      </p>
      <div className="mb-6">
        <StepProgress steps={STEPS} current={step} onStepClick={(i) => setStep(i)} />
      </div>
      {result && step < 5 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 lg:hidden">
          <span className="text-sm text-muted-foreground">Live score</span>
          <span className="text-2xl font-semibold tabular-nums text-primary">{result.total}</span>
        </div>
      )}
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle>{STEPS[step]}</CardTitle>
            <CardDescription>Client assessment — saved to practice file</CardDescription>
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
              <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {(["18-24","25-32","33-39","40-44","45+"] as const).map((b) => (
                    <OptionCard key={b} selected={answers.ageBand === b} onClick={() => set("ageBand", b)}>{b}</OptionCard>
                  ))}
                </div>
                <EnglishLevelField
                  value={answers.english}
                  onChange={(level) => set("english", level)}
                  showIntro
                />
              </div>
            )}
            {step === 2 && (
              <>
                <NativeSelect value={answers.overseasYears} onChange={(e) => set("overseasYears", e.target.value as CalculatorAnswers["overseasYears"])}>
                  <option value="0">Overseas: &lt;3 years</option><option value="3">3–4 years</option><option value="5">5–7 years</option><option value="8">8–10 years</option>
                </NativeSelect>
                <NativeSelect value={answers.australianYears} onChange={(e) => set("australianYears", e.target.value as CalculatorAnswers["australianYears"])}>
                  <option value="0">AU: &lt;1 year</option><option value="1">1–2 years</option><option value="3">3–4 years</option><option value="5">5–7 years</option><option value="8">8–10 years</option>
                </NativeSelect>
              </>
            )}
            {step === 3 && (
              <>
                <NativeSelect value={answers.qualification} onChange={(e) => set("qualification", e.target.value as CalculatorAnswers["qualification"])}>
                  <option value="none">No qualification</option><option value="diploma">Diploma</option><option value="bachelor">Bachelor/Master</option><option value="doctorate">Doctorate</option>
                </NativeSelect>
                {[["australianStudy","AU study +5"],["regionalStudy","Regional +5"],["specialistEducation","Specialist +10"]].map(([k,l]) => (
                  <CheckboxField key={k} id={k} label={l} checked={answers[k as keyof CalculatorAnswers] as boolean} onCheckedChange={(v) => set(k as keyof CalculatorAnswers, v as never)} />
                ))}
              </>
            )}
            {step === 4 && (
              <>
                {(["single","partner-english","partner-skilled"] as const).map((p) => (
                  <OptionCard key={p} selected={answers.partnerStatus === p} onClick={() => set("partnerStatus", p)}>{PARTNER_LABELS[p]}</OptionCard>
                ))}
                {[["naati","NAATI +5"],["professionalYear","PY +5"]].map(([k,l]) => (
                  <CheckboxField key={k} id={`agency-${k}`} label={l} checked={answers[k as keyof CalculatorAnswers] as boolean} onCheckedChange={(v) => set(k as keyof CalculatorAnswers, v as never)} />
                ))}
              </>
            )}
            {step === 5 && result && (
              <>
                <ResultsSummary
                  result={result}
                  allPathways={allPathways ?? undefined}
                  suggestions={suggestionsData.suggestions}
                  gap={suggestionsData.gap}
                  answers={answers}
                  variant="agency"
                />
                <AiExplainPanel
                  result={result}
                  suggestions={suggestionsData.suggestions}
                  gap={suggestionsData.gap}
                  targetPoints={"targetPoints" in suggestionsData ? suggestionsData.targetPoints : undefined}
                />
                <SimpleField label="Agent notes" htmlFor="notes">
                  <Textarea id="notes" value={agentNotes} onChange={(e) => setAgentNotes(e.target.value)} rows={3} />
                </SimpleField>
                {clientEmail ? (
                  <CheckboxField
                    id="sendEmailAfterSave"
                    label={`Email assessment report to client (${clientEmail})`}
                    checked={sendEmailAfterSave}
                    onCheckedChange={setSendEmailAfterSave}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Add a client email to send the report automatically after save.</p>
                )}
                {saveError && <FieldError>{saveError}</FieldError>}
                <Button onClick={onSave} disabled={pending}>{pending ? "Saving…" : "Save assessment"}</Button>
              </>
            )}
            {step < 5 && (
              <WizardActions
                step={step}
                totalSteps={STEPS.length}
                onBack={() => setStep((s) => s - 1)}
                onNext={() => setStep((s) => s + 1)}
              />
            )}
            {step === 5 && (
              <Button variant="outline" onClick={() => setStep(4)}>
                Back to edit answers
              </Button>
            )}
          </CardContent>
        </Card>
        <div className="hidden lg:block">
          <PointsPreview result={result} allPathways={allPathways} />
        </div>
      </div>
    </div>
  );
}
