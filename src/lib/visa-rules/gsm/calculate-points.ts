import type { PointsResult } from "../types";
import { calculatorAnswersSchema, type CalculatorAnswers } from "./calculator-schema";
import {
  breakdownForSubclass,
  calculateAllPathways,
  pathwayScore,
} from "./calculate-all-pathways";

export { buildBaseBreakdown, calculateAllPathways } from "./calculate-all-pathways";
export type { AllPathwayScores, PathwayScore } from "./calculate-all-pathways";

export function calculatePoints(input: CalculatorAnswers): PointsResult {
  const a = calculatorAnswersSchema.parse(input);
  const all = calculateAllPathways(a);
  const selected = pathwayScore(all, a.visaSubclass);
  return {
    total: selected.total,
    breakdown: breakdownForSubclass(all, a.visaSubclass),
    tier: selected.tier,
    tierMessage: selected.tierMessage,
    visaSubclass: a.visaSubclass,
    flags: all.flags,
  };
}
