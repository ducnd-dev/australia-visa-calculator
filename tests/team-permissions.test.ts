import { describe, expect, it } from "vitest";
import {
  isInviteValid,
  validateInviteAccept,
  INVITE_EXPIRY_DAYS,
} from "@/lib/team/invites";
import { compareAssessments } from "@/lib/visa-rules/gsm/compare-assessments";
import type { CalculatorAnswers } from "@/lib/visa-rules/gsm/calculator-schema";

const baseAnswers: CalculatorAnswers = {
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

describe("isInviteValid", () => {
  it("rejects accepted invites", () => {
    expect(
      isInviteValid({
        accepted_at: "2026-01-01T00:00:00Z",
        expires_at: "2099-01-01T00:00:00Z",
      })
    ).toBe(false);
  });

  it("rejects expired invites", () => {
    expect(
      isInviteValid({
        accepted_at: null,
        expires_at: "2020-01-01T00:00:00Z",
      })
    ).toBe(false);
  });

  it("accepts pending unexpired invites", () => {
    const future = new Date();
    future.setDate(future.getDate() + INVITE_EXPIRY_DAYS);
    expect(
      isInviteValid({
        accepted_at: null,
        expires_at: future.toISOString(),
      })
    ).toBe(true);
  });
});

describe("validateInviteAccept", () => {
  const orgA = "11111111-1111-1111-1111-111111111111";
  const orgB = "22222222-2222-2222-2222-222222222222";

  it("blocks invalid invite", () => {
    expect(
      validateInviteAccept({
        inviteValid: false,
        userEmail: "agent@example.com",
        inviteEmail: "agent@example.com",
        existingOrgId: null,
        inviteOrgId: orgA,
      })
    ).toBe("invalid");
  });

  it("blocks wrong email for new profile", () => {
    expect(
      validateInviteAccept({
        inviteValid: true,
        userEmail: "other@example.com",
        inviteEmail: "agent@example.com",
        existingOrgId: null,
        inviteOrgId: orgA,
      })
    ).toBe("wrong_email");
  });

  it("blocks cross-org existing profile", () => {
    expect(
      validateInviteAccept({
        inviteValid: true,
        userEmail: "agent@example.com",
        inviteEmail: "agent@example.com",
        existingOrgId: orgB,
        inviteOrgId: orgA,
      })
    ).toBe("cross_org");
  });

  it("allows same-org role update", () => {
    expect(
      validateInviteAccept({
        inviteValid: true,
        userEmail: "agent@example.com",
        inviteEmail: "agent@example.com",
        existingOrgId: orgA,
        inviteOrgId: orgA,
      })
    ).toBe(null);
  });
});

describe("compareAssessments extended", () => {
  it("reports +10 english points for competent to proficient", () => {
    const after = { ...baseAnswers, english: "proficient" as const };
    const result = compareAssessments({
      beforeId: "a",
      afterId: "b",
      beforeAnswers: baseAnswers,
      afterAnswers: after,
      beforeDate: "2026-01-01",
      afterDate: "2026-02-01",
    });
    expect(result.totalDelta).toBe(10);
    const englishChange = result.answerChanges.find((c) => c.field === "english");
    expect(englishChange?.field).toBe("english");
    expect(englishChange?.label).toBe("English level");
    expect(englishChange?.before).toContain("Competent English");
    expect(englishChange?.after).toContain("Proficient English");
    expect(englishChange?.pointsDelta).toBe(10);
    const englishBreakdown = result.breakdownChanges.find((b) =>
      b.category.toLowerCase().includes("english")
    );
    expect(englishBreakdown?.delta).toBe(10);
  });
});
