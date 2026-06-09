import type { PointsResult } from "../types";
import { calculatePoints } from "./calculate-points";
import type { CalculatorAnswers } from "./calculator-schema";
import { DEFAULT_COMPETITIVE, resolveTargetPoints, type SuggestionTarget } from "./competitive-targets";

export type Effort = "quick" | "medium" | "long";
export interface ImprovementSuggestion {
  id: string;
  label: string;
  delta: number;
  effort: Effort;
  group: "quick" | "pathway" | "longer";
  citation?: string;
}

type Action = { id: string; label: string; effort: Effort; group: ImprovementSuggestion["group"]; apply: (a: CalculatorAnswers) => CalculatorAnswers | null; citation?: string };

const ACTIONS: Action[] = [
  { id: "english_superior", label: "Improve to Superior English", effort: "quick", group: "quick", citation: "6D.2", apply: (a) => a.english === "superior" ? null : { ...a, english: "superior" } },
  { id: "english_proficient", label: "Improve to Proficient English", effort: "quick", group: "quick", citation: "6D.2", apply: (a) => (a.english === "proficient" || a.english === "superior") ? null : { ...a, english: "proficient" } },
  { id: "visa_190", label: "Consider subclass 190 state nomination (+5)", effort: "medium", group: "pathway", citation: "6D.12", apply: (a) => a.visaSubclass === "190" ? null : { ...a, visaSubclass: "190" } },
  { id: "visa_491", label: "Consider subclass 491 regional nomination (+15)", effort: "medium", group: "pathway", citation: "6D.13", apply: (a) => a.visaSubclass === "491" ? null : { ...a, visaSubclass: "491" } },
  { id: "partner_skilled", label: "Partner skills assessment + English (+10)", effort: "medium", group: "quick", citation: "6D.11", apply: (a) => a.partnerStatus === "partner-skilled" ? null : { ...a, partnerStatus: "partner-skilled" } },
  { id: "naati", label: "NAATI/CCL community language test (+5)", effort: "quick", group: "quick", citation: "6D.9", apply: (a) => a.naati ? null : { ...a, naati: true } },
  { id: "professional_year", label: "Complete an Australian Professional Year (+5)", effort: "long", group: "longer", citation: "6D.6", apply: (a) => a.professionalYear ? null : { ...a, professionalYear: true } },
  { id: "regional_study", label: "Regional Australia study (+5)", effort: "long", group: "longer", citation: "6D.10", apply: (a) => a.regionalStudy ? null : { ...a, regionalStudy: true } },
  { id: "aus_study", label: "Australian study requirement (+5)", effort: "long", group: "longer", citation: "6D.8", apply: (a) => a.australianStudy ? null : { ...a, australianStudy: true } },
];

export function suggestImprovements(answers: CalculatorAnswers, result: PointsResult, target: SuggestionTarget = { kind: "competitive", visa: result.visaSubclass }) {
  const targetPoints = resolveTargetPoints(target);
  const gap = targetPoints - result.total;
  if (gap <= 0) return { gap: 0, targetPoints, suggestions: [] as ImprovementSuggestion[] };

  const suggestions: ImprovementSuggestion[] = [];
  for (const action of ACTIONS) {
    const next = action.apply(answers);
    if (!next) continue;
    const delta = calculatePoints(next).total - result.total;
    if (delta > 0) suggestions.push({ id: action.id, label: action.label, delta, effort: action.effort, group: action.group, citation: action.citation });
  }
  suggestions.sort((a, b) => b.delta - a.delta || a.effort.localeCompare(b.effort));
  return { gap, targetPoints, suggestions: suggestions.slice(0, 8) };
}

export function defaultTargetForVisa(visa: CalculatorAnswers["visaSubclass"]): SuggestionTarget {
  return { kind: "competitive", visa };
}
