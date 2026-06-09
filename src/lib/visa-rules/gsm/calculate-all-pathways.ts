import { EOI_MINIMUM_POINTS } from "../sources";
import type { BreakdownLine, ScoreTier, VisaSubclass } from "../types";
import { calculatorAnswersSchema, type CalculatorAnswers } from "./calculator-schema";
import { englishBreakdownNote } from "./english-guide";
import {
  AGE_POINTS,
  AUSTRALIAN_EMPLOYMENT_POINTS,
  BONUS_POINTS,
  EMPLOYMENT_POINTS_CAP,
  ENGLISH_POINTS,
  NOMINATION_POINTS,
  OVERSEAS_EMPLOYMENT_POINTS,
  PARTNER_POINTS,
  QUALIFICATION_POINTS,
} from "./schedule-6d.rules";
import { GSM_PATHWAYS, gsmPathwayByCode } from "./visa-pathways";

function scoreToTier(total: number): { tier: ScoreTier; message: string } {
  if (total < EOI_MINIMUM_POINTS) {
    return {
      tier: "below_minimum",
      message: "You may need to improve your points to reach the 65-point EOI minimum.",
    };
  }
  if (total < 80) {
    return {
      tier: "competitive_band",
      message: "You may be eligible to lodge an EOI, but competition can be high for your occupation.",
    };
  }
  return {
    tier: "strong",
    message: "Strong estimated score — still confirm against SkillSelect and invitation trends.",
  };
}

export function buildBaseBreakdown(a: CalculatorAnswers): { breakdown: BreakdownLine[]; flags: string[] } {
  const breakdown: BreakdownLine[] = [];
  const flags: string[] = [];

  breakdown.push({ category: "Age", points: AGE_POINTS[a.ageBand], citation: "6D.1" });
  if (a.ageBand === "45+") flags.push("age_ineligible");

  breakdown.push({
    category: "English language",
    points: ENGLISH_POINTS[a.english],
    note: englishBreakdownNote(a.english),
    citation: "6D.2",
  });

  const overseas = OVERSEAS_EMPLOYMENT_POINTS[a.overseasYears];
  const australian = AUSTRALIAN_EMPLOYMENT_POINTS[a.australianYears];
  const rawEmp = overseas + australian;
  const capped = Math.min(rawEmp, EMPLOYMENT_POINTS_CAP);
  if (overseas > 0) {
    breakdown.push({ category: "Skilled employment (overseas)", points: overseas, citation: "6D.3" });
  }
  if (australian > 0) {
    breakdown.push({ category: "Skilled employment (Australia)", points: australian, citation: "6D.4" });
  }
  if (rawEmp > EMPLOYMENT_POINTS_CAP) {
    breakdown.push({
      category: "Employment adjustment (combined cap)",
      points: capped - rawEmp,
      note: "Maximum 20 points combined (Schedule 6D.5)",
      citation: "6D.5",
    });
    flags.push("employment_capped");
  }

  if (a.qualification !== "none") {
    breakdown.push({
      category: "Education",
      points: QUALIFICATION_POINTS[a.qualification],
      citation: "6D.7",
    });
  }
  if (a.australianStudy) {
    breakdown.push({ category: "Australian study", points: BONUS_POINTS.australianStudy, citation: "6D.8" });
  }
  if (a.regionalStudy) {
    breakdown.push({ category: "Regional study", points: BONUS_POINTS.regionalStudy, citation: "6D.10" });
  }
  if (a.specialistEducation) {
    breakdown.push({
      category: "Specialist education",
      points: BONUS_POINTS.specialistEducation,
      citation: "6D.7A",
    });
  }
  if (a.naati) {
    breakdown.push({
      category: "Credentialled community language",
      points: BONUS_POINTS.naati,
      citation: "6D.9",
    });
  }
  if (a.professionalYear) {
    breakdown.push({ category: "Professional year", points: BONUS_POINTS.professionalYear, citation: "6D.6" });
  }

  breakdown.push({ category: "Partner", points: PARTNER_POINTS[a.partnerStatus], citation: "6D.11" });

  return { breakdown, flags };
}

export type PathwayScore = {
  code: VisaSubclass;
  label: string;
  shortLabel: string;
  nominationPoints: number;
  total: number;
  tier: ScoreTier;
  tierMessage: string;
};

export type AllPathwayScores = {
  baseTotal: number;
  baseBreakdown: BreakdownLine[];
  flags: string[];
  selectedSubclass: VisaSubclass;
  pathways: PathwayScore[];
};

function nominationLine(code: VisaSubclass, points: number): BreakdownLine {
  if (code === "190") {
    return {
      category: "State/Territory nomination (190)",
      points,
      citation: "6D.12",
    };
  }
  return {
    category: "Regional nomination (491)",
    points,
    citation: "6D.13",
  };
}

/** Schedule 6D base score + totals for every GSM subclass (189, 190, 491). */
export function calculateAllPathways(input: CalculatorAnswers): AllPathwayScores {
  const a = calculatorAnswersSchema.parse(input);
  const { breakdown: baseBreakdown, flags } = buildBaseBreakdown(a);
  const baseTotal = baseBreakdown.reduce((s, l) => s + l.points, 0);

  const pathways: PathwayScore[] = GSM_PATHWAYS.map((meta) => {
    const nom = NOMINATION_POINTS[meta.code];
    const total = baseTotal + nom;
    const { tier, message } = scoreToTier(total);
    return {
      code: meta.code,
      label: meta.label,
      shortLabel: meta.shortLabel,
      nominationPoints: nom,
      total,
      tier,
      tierMessage: message,
    };
  });

  return {
    baseTotal,
    baseBreakdown,
    flags,
    selectedSubclass: a.visaSubclass,
    pathways,
  };
}

export function breakdownForSubclass(all: AllPathwayScores, code: VisaSubclass): BreakdownLine[] {
  const breakdown = [...all.baseBreakdown];
  const nom = NOMINATION_POINTS[code];
  if (nom > 0) breakdown.push(nominationLine(code, nom));
  return breakdown;
}

export function pathwayScore(all: AllPathwayScores, code: VisaSubclass): PathwayScore {
  return all.pathways.find((p) => p.code === code) ?? all.pathways[0];
}

export function nominationLabel(code: VisaSubclass): string {
  return gsmPathwayByCode(code).nominationNote;
}
