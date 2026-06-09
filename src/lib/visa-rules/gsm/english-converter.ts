import type { CalculatorAnswers } from "./calculator-schema";

export type EnglishTest = "ielts" | "pte";

export type EnglishBandScores = {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
};

const IELTS_THRESHOLDS = {
  competent: { listening: 6, reading: 6, writing: 6, speaking: 6 },
  proficient: { listening: 7, reading: 7, writing: 7, speaking: 7 },
  superior: { listening: 8, reading: 8, writing: 8, speaking: 8 },
} as const;

const PTE_THRESHOLDS = {
  competent: { listening: 50, reading: 50, writing: 50, speaking: 50 },
  proficient: { listening: 65, reading: 65, writing: 65, speaking: 65 },
  superior: { listening: 79, reading: 79, writing: 79, speaking: 79 },
} as const;

function meetsThreshold(scores: EnglishBandScores, threshold: EnglishBandScores): boolean {
  return (
    scores.listening >= threshold.listening &&
    scores.reading >= threshold.reading &&
    scores.writing >= threshold.writing &&
    scores.speaking >= threshold.speaking
  );
}

/** Map band scores to Schedule 6D English level (highest band all skills meet). */
export function englishLevelFromBands(
  test: EnglishTest,
  scores: EnglishBandScores
): CalculatorAnswers["english"] | null {
  const thresholds = test === "ielts" ? IELTS_THRESHOLDS : PTE_THRESHOLDS;
  if (meetsThreshold(scores, thresholds.superior)) return "superior";
  if (meetsThreshold(scores, thresholds.proficient)) return "proficient";
  if (meetsThreshold(scores, thresholds.competent)) return "competent";
  return null;
}

export function englishLevelLabel(level: CalculatorAnswers["english"] | null): string {
  if (!level) return "Below Competent";
  if (level === "superior") return "Superior English (+20)";
  if (level === "proficient") return "Proficient English (+10)";
  return "Competent English (0 pts)";
}
