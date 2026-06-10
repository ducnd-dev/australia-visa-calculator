#!/usr/bin/env node
/**
 * Beta launch gate orchestrator — test, build, db:check, preflight, optional smoke.
 * Run: npm run beta:launch
 *      npm run beta:launch -- --smoke
 */
import { spawnSync } from "child_process";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const withSmoke = process.argv.includes("--smoke");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

function runStep(label, args, env = {}) {
  console.log(`\n=== ${label} ===\n`);
  const result = spawnSync(npmCmd, args, {
    stdio: "inherit",
    env: { ...process.env, ...env },
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    return { ok: false, label };
  }
  return { ok: true, label };
}

const blockers = [];

const steps = [
  runStep("G1a — Vitest", ["run", "test"]),
  runStep("G1b — Production build", ["run", "build"]),
  runStep("G4 — Database check", ["run", "db:check"]),
  runStep("Preflight env", ["run", "beta:preflight"]),
];

for (const step of steps) {
  if (!step.ok) blockers.push(step.label);
}

if (withSmoke) {
  const smokeBase =
    process.env.SMOKE_BASE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!smokeBase || smokeBase.includes("localhost") || smokeBase.includes("127.0.0.1")) {
    console.log("\n⚠ --smoke skipped: set SMOKE_BASE_URL to production URL");
    blockers.push("G6 smoke (SMOKE_BASE_URL not set to production)");
  } else {
    const smoke = runStep("G6 — HTTP smoke", ["run", "beta:smoke"], {
      SMOKE_BASE_URL: smokeBase.replace(/\/$/, ""),
    });
    if (!smoke.ok) blockers.push(smoke.label);
  }
}

console.log("\n=== Launch summary ===\n");

if (blockers.length === 0) {
  console.log("✓ READY for deploy (G1 + G4 preflight passed)");
  console.log("\nNext steps:");
  console.log("  1. Set Vercel env (G2) — see docs/DEPLOY.md");
  console.log("  2. npm run db:migrate on production DB if different (G3)");
  console.log("  3. Deploy to Vercel (G5)");
  console.log("  4. SMOKE_BASE_URL=https://... npm run beta:launch -- --smoke");
  console.log("  5. BETA_TEST_EMAIL=you@domain.com npm run beta:test-email (G7)");
  process.exit(0);
}

console.log("❌ NOT READY — fix blockers:");
for (const b of blockers) console.log(`  - ${b}`);
process.exit(1);
