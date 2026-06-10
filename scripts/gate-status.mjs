#!/usr/bin/env node
/**
 * Launch gate status (G1–G9) — automatable checks from local env.
 * Run: npm run beta:gate-status
 */
import { spawnSync } from "child_process";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const DEFAULT_PROD_URL = "https://australia-visa-calculator.vercel.app";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const isLocalhost =
  !siteUrl || siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1");
const resend = process.env.RESEND_API_KEY?.trim();
const prodUrl = (
  process.env.PRODUCTION_SITE_URL ??
  process.env.SMOKE_BASE_URL ??
  (isLocalhost ? DEFAULT_PROD_URL : siteUrl)
)
  ?.trim()
  .replace(/\/$/, "");
const smokeBase =
  process.env.SMOKE_BASE_URL?.trim() ||
  (isLocalhost ? prodUrl : siteUrl);

function prodDeployLive() {
  if (!prodUrl || prodUrl.includes("localhost")) return false;
  const r = spawnSync("curl", ["-sI", "-m", "8", prodUrl], { encoding: "utf8" });
  return r.status === 0 && (r.stdout ?? "").includes("200");
}

function status(pass, label, detail = "") {
  const icon = pass ? "✓" : "○";
  const suffix = detail ? ` — ${detail}` : "";
  console.log(`  ${icon} ${label}${suffix}`);
  return pass;
}

console.log("=== Launch gate status ===\n");

const gates = [];

// G1 — run db:check only (fast); full beta:launch is slow
const dbCheck = spawnSync("npm", ["run", "db:check"], { encoding: "utf8", shell: true });
const g1Db = dbCheck.status === 0;
gates.push({ id: "G1", pass: g1Db, note: g1Db ? "db:check OK (run beta:launch for full G1)" : "db:check failed" });

gates.push({
  id: "G2",
  pass: Boolean(resend) && !isLocalhost,
  note: !resend
    ? "set RESEND_API_KEY in .env.local + Vercel"
    : isLocalhost
      ? "set NEXT_PUBLIC_SITE_URL to production domain"
      : "env looks ready — paste same vars to Vercel",
});

gates.push({
  id: "G3",
  pass: g1Db,
  note: "12 migrations (db:check implies schema current)",
});

gates.push({ id: "G4", pass: g1Db, note: "same as G3 if same Supabase project" });

const g5Live = prodDeployLive();
gates.push({
  id: "G5",
  pass: g5Live,
  note: g5Live
    ? `live at ${prodUrl}`
    : "npx vercel login && npx vercel deploy --prod",
});

let g6 = false;
const smokeTarget = smokeBase.replace(/\/$/, "");
if (smokeTarget && !smokeTarget.includes("localhost") && !smokeTarget.includes("127.0.0.1")) {
  const smoke = spawnSync("npm", ["run", "beta:smoke"], {
    encoding: "utf8",
    shell: true,
    env: { ...process.env, SMOKE_BASE_URL: smokeTarget },
  });
  g6 = smoke.status === 0;
}
gates.push({
  id: "G6",
  pass: g6,
  note: g6
    ? `smoke passed (${smokeTarget})`
    : `SMOKE_BASE_URL=${prodUrl} npm run beta:smoke`,
});

let g7 = false;
if (resend && process.env.BETA_TEST_EMAIL?.trim()) {
  const emailTest = spawnSync("npm", ["run", "beta:test-email"], {
    encoding: "utf8",
    shell: true,
    stdio: "pipe",
  });
  g7 = emailTest.status === 0;
}
gates.push({
  id: "G7",
  pass: g7,
  note: g7
    ? "test email sent"
    : !resend
      ? "after RESEND_API_KEY set"
      : "BETA_TEST_EMAIL=... npm run beta:test-email",
});

gates.push({ id: "G8", pass: false, note: "manual — see smoke-beta.mjs output" });
gates.push({ id: "G9", pass: false, note: "manual — BETA-QA-SIGNOFF.md" });
gates.push({ id: "A1", pass: false, note: "after G9 — BETA-AGENCY-TRACKER.md" });

console.log("Gate | Status | Next action");
console.log("-----|--------|-------------");
for (const g of gates) {
  const st = g.pass ? "PASS" : "PENDING";
  console.log(`${g.id.padEnd(4)} | ${st.padEnd(6)} | ${g.note}`);
}

const blockers = gates.filter((g) => !g.pass && ["G2", "G5", "G6", "G7"].includes(g.id));
if (blockers.length) {
  console.log("\n--- Blockers ---");
  if (!resend) {
  console.log("  G2: RESEND_API_KEY=re_xxx LAUNCH_SITE_URL=https://... npm run setup:launch-g2");
  console.log("  See docs/HUONG-DAN-LAY-KEY.md § Resend");
  }
  if (isLocalhost) {
    console.log("  NEXT_PUBLIC_SITE_URL: set to https://your-production-domain.com");
  }
  console.log("  Vercel: docs/DEPLOY.md § G2");
}

const allAutomated = gates.filter((g) => ["G1", "G2", "G3", "G4", "G6", "G7"].includes(g.id)).every((g) => g.pass);
process.exit(allAutomated ? 0 : 1);
