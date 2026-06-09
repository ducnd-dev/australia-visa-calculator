import type { CalculatorAnswers } from "./calculator-schema";

/** base64url without relying on Node/browser `base64url` encoding (unsupported in some Buffer polyfills). */
function toBase64Url(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeAnswers(answers: CalculatorAnswers): string {
  return toBase64Url(JSON.stringify(answers));
}

export function decodeAnswers(encoded: string): CalculatorAnswers | null {
  try {
    return JSON.parse(fromBase64Url(encoded)) as CalculatorAnswers;
  } catch {
    return null;
  }
}
