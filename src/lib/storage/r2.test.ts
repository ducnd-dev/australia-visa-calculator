import { afterEach, describe, expect, it } from "vitest";
import { r2ObjectKey, r2PublicUrl } from "./r2";

describe("r2ObjectKey", () => {
  afterEach(() => {
    delete process.env.R2_KEY_PREFIX;
    delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  });

  it("returns path unchanged when no prefix", () => {
    expect(r2ObjectKey("org-1/logo.png")).toBe("org-1/logo.png");
  });

  it("prepends R2_KEY_PREFIX", () => {
    process.env.R2_KEY_PREFIX = "org-logos";
    expect(r2ObjectKey("org-1/logo.png")).toBe("org-logos/org-1/logo.png");
  });
});

describe("r2PublicUrl", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    delete process.env.R2_KEY_PREFIX;
  });

  it("builds public URL from base and key", () => {
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://cdn.example.com";
    expect(r2PublicUrl("org-1/logo.png")).toBe("https://cdn.example.com/org-1/logo.png");
  });
});
