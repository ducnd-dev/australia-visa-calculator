#!/usr/bin/env node
/**
 * Go-live orchestrator (G2→G9). Runs automatable steps; prints operator actions.
 *
 *   npm run go-live              # status + next step
 *   npm run go-live -- --g2      # requires RESEND_API_KEY + LAUNCH_SITE_URL inline
 *   npm run go-live -- --gates   # beta:complete-gates after G2
 */
import { spawnSync } from "child_process";
import { loadEnvLocal, projectRoot } from "./load-env-local.mjs";

loadEnvLocal();

const DEFAULT_PROD_URL = "https://australia-visa-calculator.vercel.app";
const prodUrl = (
  process.env.PRODUCTION_SITE_URL ??
  process.env.LAUNCH_SITE_URL ??
  process.env.SMOKE_BASE_URL ??
  (process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost") ? DEFAULT_PROD_URL : process.env.NEXT_PUBLIC_SITE_URL)
)
  ?.trim()
  .replace(/\/$/, "");

const resend = process.env.RESEND_API_KEY?.trim();
const testEmail = process.env.BETA_TEST_EMAIL?.trim();
const siteLocal = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const isLocalhost = !siteLocal || siteLocal.includes("localhost") || siteLocal.includes("127.0.0.1");

const args = process.argv.slice(2);
const runG2 = args.includes("--g2");
const runGates = args.includes("--gates");

function run(cmd, cmdArgs, env = {}) {
  return spawnSync(cmd, cmdArgs, {
    stdio: "inherit",
    shell: true,
    cwd: projectRoot,
    env: { ...process.env, ...env },
  }).status === 0;
}

function prodReachable() {
  const r = spawnSync("curl", ["-sI", "-m", "8", prodUrl], { encoding: "utf8" });
  return r.status === 0 && (r.stdout ?? "").includes("200");
}

console.log("=== Go-live orchestrator ===\n");
console.log(`Production URL: ${prodUrl}`);
console.log(`Local SITE_URL: ${siteLocal || "(unset)"}`);
console.log(`RESEND_API_KEY: ${resend ? "set" : "MISSING"}`);
console.log(`BETA_TEST_EMAIL: ${testEmail || "(unset)"}\n`);

if (runG2) {
  if (!resend) {
    console.error("❌ Pass RESEND_API_KEY inline:");
    console.error(
      `   RESEND_API_KEY=re_xxx LAUNCH_SITE_URL=${prodUrl} BETA_TEST_EMAIL=you@email.com npm run go-live -- --g2`
    );
    process.exit(1);
  }
  const ok = run("npm", ["run", "setup:launch-g2"], {
    RESEND_API_KEY: resend,
    LAUNCH_SITE_URL: prodUrl,
    ...(testEmail ? { BETA_TEST_EMAIL: testEmail } : {}),
  });
  if (!ok) process.exit(1);
  loadEnvLocal();
}

console.log("--- Gate status ---\n");
run("npm", ["run", "beta:gate-status"], {
  PRODUCTION_SITE_URL: prodUrl,
  ...(prodUrl && isLocalhost ? { SMOKE_BASE_URL: prodUrl } : {}),
});

if (runGates) {
  console.log("\n--- Running automatable gates ---\n");
  const ok = run("npm", ["run", "beta:complete-gates"], {
    SMOKE_BASE_URL: prodUrl,
    NEXT_PUBLIC_SITE_URL: isLocalhost ? prodUrl : siteLocal,
  });
  if (!ok) process.exit(1);
}

const g2Ready = Boolean(process.env.RESEND_API_KEY?.trim()) && !isLocalhost;
const g5Live = prodReachable();
const g6Hint = g5Live ? `SMOKE_BASE_URL=${prodUrl} npm run beta:smoke` : "deploy first";

console.log("\n--- Next operator step ---\n");

if (!process.env.RESEND_API_KEY?.trim()) {
  console.log("1. G2 — get Resend key (docs/HUONG-DAN-LAY-KEY.md §3), then:");
  console.log(
    `   RESEND_API_KEY=re_xxx LAUNCH_SITE_URL=${prodUrl} BETA_TEST_EMAIL=your@email.com npm run setup:launch-g2`
  );
  console.log("2. npm run push:vercel-env && npx vercel deploy --prod");
} else if (isLocalhost) {
  console.log(`1. G2 — run setup:launch-g2 with LAUNCH_SITE_URL=${prodUrl}`);
} else if (!g5Live) {
  console.log("1. G5 — npx vercel login && npx vercel link && npx vercel deploy --prod");
} else if (!testEmail) {
  console.log("1. G7 — set BETA_TEST_EMAIL in .env.local, then npm run beta:test-email");
} else {
  console.log("1. G7 — npm run beta:test-email");
  console.log("2. G8–G9 — docs/LAUNCH-G8-G9-WORKSHEET.md (2 browsers)");
  console.log("3. A1 — docs/BETA-AGENCY-TRACKER.md Agency #1 session");
}

console.log("\nFull status: npm run go-live");
console.log(`G5 deploy live: ${g5Live ? "yes" : "no"} · G2 local ready: ${g2Ready ? "yes" : "no"}`);
console.log(`G6 command: ${g6Hint}`);
