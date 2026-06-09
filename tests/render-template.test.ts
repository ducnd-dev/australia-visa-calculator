import { describe, expect, it } from "vitest";
import { renderTemplate } from "@/lib/email/render-template";
import { monthlyMarketingLimit } from "@/lib/email/plan-limits";

describe("renderTemplate", () => {
  it("substitutes variables", () => {
    const html = renderTemplate("<p>Hi {{clientName}}, from {{agencyName}}</p>", {
      clientName: "Jane",
      agencyName: "Acme Migration",
    });
    expect(html).toContain("Jane");
    expect(html).toContain("Acme Migration");
  });
});

describe("monthlyMarketingLimit", () => {
  it("returns tier limits", () => {
    expect(monthlyMarketingLimit("trial")).toBe(50);
    expect(monthlyMarketingLimit("agency")).toBe(500);
    expect(monthlyMarketingLimit("enterprise")).toBe(5000);
  });
});
