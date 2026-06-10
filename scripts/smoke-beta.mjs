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
  { name: "Stripe webhook (POST only)", path: "/api/stripe/webhook", method: "GET", expectStatus: [405, 400, 401] },
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

console.log("\nManual smoke (signed-in admin):");
console.log("  1. Sign up → dashboard");
console.log("  2. Client + ANZSCO → assessment → share link");
console.log("  3. Settings → team invite → /login?invite= uses production domain");
console.log("  4. /api/clients/export returns CSV when authenticated");

console.log(failed ? `\n❌ ${failed} check(s) failed.` : "\n✓ Automated smoke passed.");
process.exit(failed ? 1 : 0);
