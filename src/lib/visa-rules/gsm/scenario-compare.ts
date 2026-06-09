import type { CalculatorAnswers } from "./calculator-schema";
import { calculatePoints } from "./calculate-points";
import type { PointsResult } from "../types";

export type ScenarioPreview = {
  id: string;
  label: string;
  total: number;
  delta: number;
};

const SCENARIOS: { id: string; label: string; apply: (a: CalculatorAnswers) => CalculatorAnswers | null }[] = [
  {
    id: "proficient",
    label: "Proficient English",
    apply: (a) => (a.english === "proficient" || a.english === "superior" ? null : { ...a, english: "proficient" }),
  },
  {
    id: "superior",
    label: "Superior English",
    apply: (a) => (a.english === "superior" ? null : { ...a, english: "superior" }),
  },
  {
    id: "partner_skilled",
    label: "Partner skills + English",
    apply: (a) => (a.partnerStatus === "partner-skilled" ? null : { ...a, partnerStatus: "partner-skilled" }),
  },
  {
    id: "visa_491",
    label: "Subclass 491 nomination",
    apply: (a) => (a.visaSubclass === "491" ? null : { ...a, visaSubclass: "491" }),
  },
  {
    id: "visa_190",
    label: "Subclass 190 nomination",
    apply: (a) => (a.visaSubclass === "190" ? null : { ...a, visaSubclass: "190" }),
  },
  {
    id: "naati",
    label: "NAATI/CCL credential",
    apply: (a) => (a.naati ? null : { ...a, naati: true }),
  },
];

export function buildScenarioPreviews(answers: CalculatorAnswers, base: PointsResult): ScenarioPreview[] {
  const previews: ScenarioPreview[] = [];
  for (const s of SCENARIOS) {
    const next = s.apply(answers);
    if (!next) continue;
    const total = calculatePoints(next).total;
    const delta = total - base.total;
    if (delta > 0) previews.push({ id: s.id, label: s.label, total, delta });
  }
  return previews.sort((a, b) => b.delta - a.delta).slice(0, 5);
}
