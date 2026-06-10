import { describe, expect, it } from "vitest";
import {
  agencyProfileSchema,
  formatMaraLine,
  resolveDisclaimerFooter,
} from "@/lib/billing/agency-profile";
import { computeShareExpiresAt, isShareLinkActive } from "@/lib/billing/share-link";

describe("agency profile", () => {
  it("validates MARN as 6-8 digits", () => {
    expect(agencyProfileSchema.safeParse({ maraNumber: "123456" }).success).toBe(true);
    expect(agencyProfileSchema.safeParse({ maraNumber: "abc" }).success).toBe(false);
  });

  it("formats MARA line", () => {
    expect(formatMaraLine("1234567")).toBe("Registered Migration Agent MARN 1234567");
    expect(formatMaraLine(null)).toBeNull();
  });

  it("resolves disclaimer with MARN", () => {
    const text = resolveDisclaimerFooter(null, "123456");
    expect(text).toContain("MARN 123456");
  });
});

describe("share link", () => {
  it("computes expiry from days", () => {
    const expires = computeShareExpiresAt(30);
    expect(expires).toBeTruthy();
    const days = Math.round(
      (new Date(expires!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    expect(days).toBeGreaterThanOrEqual(29);
    expect(days).toBeLessThanOrEqual(31);
  });

  it("detects revoked and expired links", () => {
    expect(isShareLinkActive({ share_revoked_at: new Date().toISOString() }).active).toBe(false);
    expect(
      isShareLinkActive({ share_expires_at: new Date(Date.now() - 1000).toISOString() }).active
    ).toBe(false);
    expect(isShareLinkActive({}).active).toBe(true);
  });
});
