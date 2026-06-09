import { describe, expect, it } from "vitest";
import {
  assessmentReportHtml,
  assessmentReportSubject,
} from "@/lib/email/templates/assessment-report";

describe("assessment report email", () => {
  it("builds subject with points", () => {
    expect(assessmentReportSubject("Jane Doe", 75)).toContain("75");
    expect(assessmentReportSubject("Jane Doe", 75)).toContain("Jane Doe");
  });

  it("escapes html in client name", () => {
    const html = assessmentReportHtml({
      agencyName: "Test Agency",
      clientName: "<script>",
      totalPoints: 65,
      visaSubclass: "189",
      shareUrl: "https://example.com/share/abc",
      disclaimer: "Not advice",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
