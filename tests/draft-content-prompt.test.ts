import { describe, expect, it } from "vitest";
import {
  buildDraftNoteUserPrompt,
  buildEmailIntroUserPrompt,
} from "@/lib/ai/prompts/draft-content";

describe("draft content prompts", () => {
  it("includes assessment context in agent note prompt", () => {
    const prompt = buildDraftNoteUserPrompt({
      total: 72,
      visaSubclass: "189",
      tier: "competitive_band",
      tierMessage: "Competitive band",
      breakdown: [{ category: "Age", points: 30 }],
      suggestions: [{ label: "Improve English", delta: 10, effort: "medium" }],
      gap: 8,
      rulesVersion: "2026-01",
    });
    expect(prompt).toContain("72");
    expect(prompt).toContain("189");
    expect(prompt).toContain("Improve English");
  });

  it("includes client name in email intro prompt", () => {
    const prompt = buildEmailIntroUserPrompt({
      clientName: "Chen L.",
      total: 78,
      visaSubclass: "189",
      gap: 2,
      suggestions: [{ label: "NAATI", delta: 5 }],
    });
    expect(prompt).toContain("Chen L.");
    expect(prompt).toContain("78");
  });
});
