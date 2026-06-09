import { describe, expect, it } from "vitest";
import { buildExplainUserPrompt } from "@/lib/ai/prompts/explain-breakdown";

describe("buildExplainUserPrompt", () => {
  it("includes fixed total and breakdown", () => {
    const prompt = buildExplainUserPrompt({
      total: 75,
      visaSubclass: "190",
      tier: "competitive_band",
      tierMessage: "Competitive",
      breakdown: [{ category: "Age", points: 30 }],
      suggestions: [{ label: "NAATI", delta: 5, effort: "quick" }],
      gap: 10,
      rulesVersion: "schedule-6d-test",
    });
    expect(prompt).toContain("FIXED total points: 75");
    expect(prompt).toContain("schedule-6d-test");
    expect(prompt).toContain("do not recalculate");
  });
});
