#!/usr/bin/env node
/**
 * HTTP smoke tests against deployed site (public routes + API auth gates).
 * Run: npm run beta:smoke
 * Optional: SMOKE_BASE_URL=https://your-domain.com npm run beta:smoke
 */
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const base = (process.env.SMOKE_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);

const checks = [
  { name: "Home", path: "/", expectStatus: 200 },
  { name: "Calculator", path: "/calculator", expectStatus: 200 },
  { name: "Login", path: "/login", expectStatus: 200 },
  { name: "For agents", path: "/for-agents", expectStatus: 200 },
  { name: "Pricing", path: "/pricing", expectStatus: 200 },
  { name: "App (auth redirect)", path: "/app", expectStatus: [307, 308, 302, 200] },
  { name: "CSV export (auth required)", path: "/api/clients/export", expectStatus: [401, 307, 302] },
  {
    name: "PDF export (auth required)",
    path: "/api/assessments/00000000-0000-0000-0000-000000000000/pdf",
    expectStatus: [401, 307, 302, 403, 404],
  },
  { name: "Billing confirm (POST only)", path: "/api/billing/confirm", method: "GET", expectStatus: [405, 401] },
];

let failed = 0;

console.log(`=== Beta smoke test — ${base} ===\n`);

for (const check of checks) {
  const url = `${base}${check.path}`;
  try {
    const res = await fetch(url, {
      method: check.method ?? "GET",
      redirect: "manual",
    });
    const allowed = Array.isArray(check.expectStatus) ? check.expectStatus : [check.expectStatus];
    if (allowed.includes(res.status)) {
      console.log(`  ✓ ${check.name} (${res.status})`);
    } else {
      console.log(`  ❌ ${check.name} — expected ${allowed.join("|")}, got ${res.status}`);
      failed += 1;
    }
  } catch (err) {
    console.log(`  ❌ ${check.name} — ${err.message}`);
    failed += 1;
  }
}

console.log("\nManual smoke (signed-in admin on production):");
console.log("  1. Sign up → dashboard");
console.log("  2. Client + ANZSCO → assessment → share link opens");
console.log("  3. Phase 8: Download PDF (/api/assessments/[id]/pdf) — logo + breakdown");
console.log("  4. Phase 8: Enable share password → incognito → gate → unlock → results");
console.log("  5. Settings → team invite → /login?invite= uses production domain");
console.log("  6. Phase 8: Resend domain check (if custom from_domain set)");
console.log("  7. /api/clients/export returns CSV when authenticated");

console.log(failed ? `\n❌ ${failed} check(s) failed.` : "\n✓ Automated smoke passed.");
process.exit(failed ? 1 : 0);
