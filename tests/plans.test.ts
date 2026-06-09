import { describe, expect, it } from "vitest";
import { canExportPdf, canUseBranding, isAgencyPlan, planLabel } from "@/lib/billing/plans";

describe("billing plans", () => {
  it("trial is not agency", () => {
    expect(isAgencyPlan("trial")).toBe(false);
    expect(canUseBranding("trial")).toBe(false);
    expect(canExportPdf("trial")).toBe(false);
    expect(planLabel("trial")).toBe("Trial");
  });

  it("agency unlocks paid features", () => {
    expect(isAgencyPlan("agency")).toBe(true);
    expect(canUseBranding("agency")).toBe(true);
    expect(canExportPdf("agency")).toBe(true);
    expect(planLabel("agency")).toBe("Agency");
  });
});
