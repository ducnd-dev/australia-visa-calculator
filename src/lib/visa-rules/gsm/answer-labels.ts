import type { CalculatorAnswers } from "./calculator-schema";
import { englishLevelLabel } from "./english-converter";

export const ANSWER_FIELD_LABELS: Record<keyof CalculatorAnswers, string> = {
  visaSubclass: "Visa subclass",
  ageBand: "Age band",
  english: "English level",
  overseasYears: "Overseas skilled employment",
  australianYears: "Australian skilled employment",
  qualification: "Educational qualification",
  australianStudy: "Australian study requirement",
  regionalStudy: "Regional study",
  specialistEducation: "Specialist education qualification",
  naati: "Credentialled community language (NAATI)",
  professionalYear: "Professional year in Australia",
  partnerStatus: "Partner skills",
  clientReference: "Client reference",
};

const VISA_LABELS: Record<CalculatorAnswers["visaSubclass"], string> = {
  "189": "Subclass 189 (Skilled Independent)",
  "190": "Subclass 190 (State nominated)",
  "491": "Subclass 491 (Regional nominated)",
};

const AGE_LABELS: Record<CalculatorAnswers["ageBand"], string> = {
  "18-24": "18–24 years",
  "25-32": "25–32 years (30 pts)",
  "33-39": "33–39 years (25 pts)",
  "40-44": "40–44 years (15 pts)",
  "45+": "45 years or over (0 pts)",
};

const EMPLOYMENT_LABELS: Record<
  CalculatorAnswers["overseasYears"] | CalculatorAnswers["australianYears"],
  string
> = {
  "0": "Less than 3 years",
  "1": "At least 1 year (Australian only)",
  "3": "3 to less than 5 years",
  "5": "5 to less than 8 years",
  "8": "8 years or more",
};

const QUALIFICATION_LABELS: Record<CalculatorAnswers["qualification"], string> = {
  none: "No recognised qualification",
  diploma: "Diploma or trade qualification",
  bachelor: "Bachelor degree or higher",
  doctorate: "Doctorate",
};

const PARTNER_LABELS: Record<CalculatorAnswers["partnerStatus"], string> = {
  single: "Single / partner not claiming points",
  "partner-english": "Partner with competent English",
  "partner-skilled": "Partner with competent English and skills assessment",
};

export function formatAnswerLabel(
  key: keyof CalculatorAnswers,
  value: unknown
): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (key === "english") {
    return englishLevelLabel(value as CalculatorAnswers["english"]);
  }
  if (key === "visaSubclass") {
    return VISA_LABELS[value as CalculatorAnswers["visaSubclass"]] ?? String(value);
  }
  if (key === "ageBand") {
    return AGE_LABELS[value as CalculatorAnswers["ageBand"]] ?? String(value);
  }
  if (key === "overseasYears" || key === "australianYears") {
    return EMPLOYMENT_LABELS[value as CalculatorAnswers["overseasYears"]] ?? String(value);
  }
  if (key === "qualification") {
    return QUALIFICATION_LABELS[value as CalculatorAnswers["qualification"]] ?? String(value);
  }
  if (key === "partnerStatus") {
    return PARTNER_LABELS[value as CalculatorAnswers["partnerStatus"]] ?? String(value);
  }
  return String(value);
}

/** Points delta for a single field change (before vs after answers). */
export function answerChangePointsDelta(
  field: keyof CalculatorAnswers,
  before: CalculatorAnswers,
  after: CalculatorAnswers,
  breakdownChanges: { category: string; delta: number }[]
): number | null {
  const related: Partial<Record<keyof CalculatorAnswers, string[]>> = {
    english: ["English language"],
    ageBand: ["Age"],
    overseasYears: ["Skilled employment (overseas)", "Employment adjustment"],
    australianYears: ["Skilled employment (Australia)", "Employment adjustment"],
    qualification: ["Education"],
    australianStudy: ["Australian study"],
    regionalStudy: ["Regional study"],
    specialistEducation: ["Specialist education"],
    naati: ["Credentialled community language"],
    professionalYear: ["Professional year"],
    partnerStatus: ["Partner"],
    visaSubclass: ["nomination"],
  };
  const categories = related[field];
  if (!categories?.length) return null;
  const delta = breakdownChanges
    .filter((b) => categories.some((c) => b.category.toLowerCase().includes(c.toLowerCase())))
    .reduce((sum, b) => sum + b.delta, 0);
  return delta !== 0 ? delta : null;
}
