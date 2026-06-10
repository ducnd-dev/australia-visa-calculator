import { describe, expect, it } from "vitest";
import { compareAssessments } from "@/lib/visa-rules/gsm/compare-assessments";
import type { CalculatorAnswers } from "@/lib/visa-rules/gsm/calculator-schema";

const base: CalculatorAnswers = {
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

describe("compareAssessments", () => {
  it("detects english upgrade delta", () => {
    const after = { ...base, english: "proficient" as const };
    const result = compareAssessments({
      beforeId: "a",
      afterId: "b",
      beforeAnswers: base,
      afterAnswers: after,
      beforeDate: "2026-01-01",
      afterDate: "2026-02-01",
    });
    expect(result.totalDelta).toBeGreaterThan(0);
    expect(result.answerChanges.some((c) => c.field === "english")).toBe(true);
  });
});
