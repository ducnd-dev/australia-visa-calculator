import { describe, expect, it } from "vitest";
import { englishLevelFromBands } from "@/lib/visa-rules/gsm/english-converter";

describe("englishLevelFromBands", () => {
  it("maps IELTS 7 all bands to proficient", () => {
    expect(
      englishLevelFromBands("ielts", { listening: 7, reading: 7, writing: 7, speaking: 7 })
    ).toBe("proficient");
  });

  it("maps IELTS 8 all bands to superior", () => {
    expect(
      englishLevelFromBands("ielts", { listening: 8, reading: 8, writing: 8, speaking: 8 })
    ).toBe("superior");
  });

  it("returns null when one IELTS band is below competent", () => {
    expect(
      englishLevelFromBands("ielts", { listening: 6, reading: 6, writing: 5.5, speaking: 6 })
    ).toBe(null);
  });

  it("maps PTE 65 all skills to proficient", () => {
    expect(
      englishLevelFromBands("pte", { listening: 65, reading: 65, writing: 65, speaking: 65 })
    ).toBe("proficient");
  });
});
