/** Stable share URL for SSR + client (avoids hydration mismatch from window.location). */
export function buildResultsShareUrl(encoded: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/results?d=${encoded}`;
}
