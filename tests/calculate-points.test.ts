import { describe, expect, it } from "vitest";
import { calculateAllPathways, calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import type { CalculatorAnswers } from "@/lib/visa-rules/gsm/calculator-schema";

const base: CalculatorAnswers = {
  visaSubclass: "189",
  ageBand: "25-32",
  english: "proficient",
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

describe("calculatePoints", () => {
  it("caps employment at 20", () => {
    const r = calculatePoints({ ...base, overseasYears: "8", australianYears: "8" });
    const emp = r.breakdown.filter((l) => l.category.includes("employment") || l.category.includes("Employment"));
    const empTotal = emp.reduce((s, l) => s + l.points, 0);
    expect(empTotal).toBe(20);
  });

  it("age 45+ gives 0 age points", () => {
    const r = calculatePoints({ ...base, ageBand: "45+" });
    expect(r.breakdown.find((l) => l.category === "Age")?.points).toBe(0);
    expect(r.flags).toContain("age_ineligible");
  });

  it("competent english is 0 points", () => {
    const r = calculatePoints({ ...base, english: "competent" });
    expect(r.breakdown.find((l) => l.category === "English language")?.points).toBe(0);
  });

  it("491 nomination adds 15", () => {
    const r = calculatePoints({ ...base, visaSubclass: "491" });
    expect(r.breakdown.some((l) => l.points === 15 && l.category.includes("491"))).toBe(true);
  });

  it("calculateAllPathways returns scores for 189, 190, and 491", () => {
    const all = calculateAllPathways(base);
    expect(all.pathways).toHaveLength(3);
    const byCode = Object.fromEntries(all.pathways.map((p) => [p.code, p.total]));
    expect(byCode["190"]).toBe(all.baseTotal + 5);
    expect(byCode["491"]).toBe(all.baseTotal + 15);
    expect(byCode["189"]).toBe(all.baseTotal);
  });
});
