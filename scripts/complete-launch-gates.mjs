#!/usr/bin/env node
/**
 * Launch gates G2–G9 runner — runs automatable steps, prints manual steps.
 * Run: npm run beta:complete-gates
 *      npm run beta:complete-gates -- --through=g7
 */
import { spawnSync } from "child_process";
import { loadEnvLocal, projectRoot } from "./load-env-local.mjs";

loadEnvLocal();

const through = process.argv.find((a) => a.startsWith("--through="))?.split("=")[1] ?? "g7";
const DEFAULT_PROD_URL = "https://australia-visa-calculator.vercel.app";
const localSite = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");
const isLocalhost =
  !localSite || localSite.includes("localhost") || localSite.includes("127.0.0.1");
const siteUrl = (
  process.env.SMOKE_BASE_URL ??
  process.env.PRODUCTION_SITE_URL ??
  (isLocalhost ? DEFAULT_PROD_URL : localSite)
)
  .trim()
  .replace(/\/$/, "");
const isProdUrl =
  siteUrl && !siteUrl.includes("localhost") && !siteUrl.includes("127.0.0.1");
const resend = process.env.RESEND_API_KEY?.trim();
const testEmail = process.env.BETA_TEST_EMAIL?.trim();

function run(label, args, env = {}) {
  console.log(`\n>>> ${label}`);
  const r = spawnSync("npm", args, {
    stdio: "inherit",
    shell: true,
    cwd: projectRoot,
    env: { ...process.env, ...env },
  });
  return r.status === 0;
}

const order = ["g2", "g1", "g4", "g6", "g7"];
const idx = order.indexOf(through);
const stopAt = idx >= 0 ? idx : order.length - 1;

console.log("=== Complete launch gates (automated portion) ===\n");

if (!resend || !isProdUrl) {
  console.log("G2 not ready. Run once you have Resend key + production URL:\n");
  console.log(
    "  RESEND_API_KEY=re_xxx LAUNCH_SITE_URL=https://your-app.vercel.app npm run setup:launch-g2"
  );
  console.log("\nThen copy the same vars to Vercel → Environment Variables → Production.\n");
  if (!resend) console.log("  Missing: RESEND_API_KEY");
  if (!isProdUrl) console.log("  Missing: production NEXT_PUBLIC_SITE_URL");
}

let ok = true;

if (resend && isProdUrl && stopAt >= order.indexOf("g2")) {
  ok = run("G2 — beta:preflight", ["run", "beta:preflight"]) && ok;
}

if (stopAt >= order.indexOf("g1")) {
  ok = run("G1 — beta:launch (no smoke)", ["run", "beta:launch"]) && ok;
}

if (stopAt >= order.indexOf("g4")) {
  ok = run("G4 — db:check", ["run", "db:check"]) && ok;
}

if (isProdUrl && stopAt >= order.indexOf("g6")) {
  ok =
    run("G6 — beta:smoke", ["run", "beta:smoke"], { SMOKE_BASE_URL: siteUrl }) && ok;
} else if (stopAt >= order.indexOf("g6")) {
  console.log("\n>>> G6 skipped — set production SMOKE_BASE_URL or NEXT_PUBLIC_SITE_URL");
}

if (resend && testEmail && stopAt >= order.indexOf("g7")) {
  ok = run("G7 — beta:test-email", ["run", "beta:test-email"]) && ok;
} else if (stopAt >= order.indexOf("g7")) {
  console.log("\n>>> G7 skipped — set BETA_TEST_EMAIL in .env.local");
}

console.log("\n=== Manual gates (operator) ===\n");
console.log("G5  npx vercel login && npx vercel deploy --prod");
console.log("G8  Manual smoke — see npm run beta:smoke output (7 steps)");
console.log("G9  docs/BETA-QA-SIGNOFF.md — 2 browsers, sections 1–7");
console.log("A1  docs/BETA-AGENCY-TRACKER.md — design partner session");
console.log("\nStatus: npm run beta:gate-status");

process.exit(ok ? 0 : 1);
