import type { CalculatorAnswers } from "./calculator-schema";

export type EnglishLevel = CalculatorAnswers["english"];

export type EnglishLevelGuide = {
  level: EnglishLevel;
  label: string;
  points: number;
  summary: string;
  detail: string;
  /** Illustrative scores — always verify current legislative instrument */
  tests: { name: string; scores: string }[];
};

export const ENGLISH_LEVEL_GUIDES: EnglishLevelGuide[] = [
  {
    level: "competent",
    label: "Competent English",
    points: 0,
    summary: "Meets the usual minimum for lodging an EOI — scores 0 extra points in Schedule 6D.",
    detail:
      "Competent English is the baseline many applicants need before SkillSelect accepts an Expression of Interest. In the points test it does not add points, but without at least this level you generally cannot claim English for EOI purposes. You must hold an accepted test result (usually within the validity period) at the time you are invited to apply.",
    tests: [
      { name: "IELTS Academic / General Training", scores: "At least 6.0 in each band (Listening, Reading, Writing, Speaking)" },
      { name: "PTE Academic", scores: "At least 50 in each communicative skill" },
      { name: "TOEFL iBT", scores: "Listening 12, Reading 13, Writing 21, Speaking 18 (or higher per band rules)" },
      { name: "Cambridge C1 Advanced", scores: "At least 169 in each skill" },
      { name: "OET", scores: "At least B in each component (where OET is accepted for your pathway)" },
    ],
  },
  {
    level: "proficient",
    label: "Proficient English",
    points: 10,
    summary: "+10 points — a common target when competing in SkillSelect invitation rounds.",
    detail:
      "Proficient English is one of the most cost-effective point gains for many clients. It requires higher scores than Competent across accepted tests. Results must be from an approved test and still valid when the Department assesses the visa. Functional or vocational English does not count as Proficient for these points.",
    tests: [
      { name: "IELTS Academic / General Training", scores: "At least 7.0 in each band" },
      { name: "PTE Academic", scores: "At least 65 in each communicative skill" },
      { name: "TOEFL iBT", scores: "Listening 24, Reading 24, Writing 27, Speaking 23" },
      { name: "Cambridge C1 Advanced", scores: "At least 185 in each skill" },
      { name: "OET", scores: "At least B in each component (check current instrument for OET mapping)" },
    ],
  },
  {
    level: "superior",
    label: "Superior English",
    points: 20,
    summary: "+20 points — maximum English band under Schedule 6D for most GSM applicants.",
    detail:
      "Superior English adds the highest English points available in the skilled points test. It is difficult to achieve and often requires dedicated preparation. Only count Superior if the client meets the exact score thresholds in the current legislative instrument — partial improvements (e.g. 7.5 in one IELTS band) may still only qualify as Proficient.",
    tests: [
      { name: "IELTS Academic / General Training", scores: "At least 8.0 in each band" },
      { name: "PTE Academic", scores: "At least 79 in each communicative skill" },
      { name: "TOEFL iBT", scores: "Listening 28, Reading 29, Writing 30, Speaking 26" },
      { name: "Cambridge C1 Advanced", scores: "At least 200 in each skill" },
      { name: "OET", scores: "At least A in each component (where accepted — confirm instrument)" },
    ],
  },
];

export const ENGLISH_STEP_INTRO =
  "Schedule 6D awards 0, 10, or 20 points for English. Choose the band that matches your client's best valid test result at invitation — not their target score. Competent English is often required to lodge an EOI but earns no extra points.";

export const ENGLISH_INSTRUMENT_DISCLAIMER =
  "Test score equivalents change when the Department updates legislative instruments. Always confirm current requirements on immi.homeaffairs.gov.au before lodging.";

export function englishBreakdownNote(level: EnglishLevel): string {
  const guide = ENGLISH_LEVEL_GUIDES.find((g) => g.level === level);
  if (!guide) return "";
  if (level === "competent") {
    return `${guide.label} — 0 points in the points test. Typical minimum: IELTS 6 each band or PTE 50 each. Still required for many EOIs.`;
  }
  if (level === "proficient") {
    return `${guide.label} — +10 points. Typical: IELTS 7 each band or PTE 65 each.`;
  }
  return `${guide.label} — +20 points. Typical: IELTS 8 each band or PTE 79 each.`;
}

export function getEnglishGuide(level: EnglishLevel): EnglishLevelGuide {
  return ENGLISH_LEVEL_GUIDES.find((g) => g.level === level) ?? ENGLISH_LEVEL_GUIDES[0];
}
