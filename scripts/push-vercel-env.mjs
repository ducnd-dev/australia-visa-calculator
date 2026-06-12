#!/usr/bin/env node
/**
 * Push non-empty .env.local vars to Vercel Production (excludes LOCAL-only keys).
 * Requires: npx vercel login && npx vercel link
 *
 *   npm run push:vercel-env
 *   npm run push:vercel-env -- --dry-run
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";
import { loadEnvLocal, projectRoot } from "./load-env-local.mjs";

const PROD_URL = "https://australia-visa-calculator.vercel.app";
const dryRun = process.argv.includes("--dry-run");

const LOCAL_ONLY = new Set([
  "DATABASE_URL",
  "SUPABASE_DB_PASSWORD",
  "SUPABASE_DB_HOST",
  "BETA_TEST_EMAIL",
  "SMOKE_BASE_URL",
  "LAUNCH_SITE_URL",
  "PRODUCTION_SITE_URL",
]);

const KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPPORT_EMAIL",
  "NEXT_PUBLIC_AGENCY_PRICE_DISPLAY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "RESEND_WEBHOOK_SECRET",
  "EMAIL_FROM_PLATFORM",
  "EMAIL_FROM_DEFAULT_AGENCY",
  "NEXT_PUBLIC_BASE_CHAIN_ID",
  "BASE_CHAIN_ID",
  "BASE_RPC_URL",
  "BILLING_TREASURY_WALLET",
  "NEXT_PUBLIC_BILLING_TREASURY_WALLET",
  "BILLING_USDC_AMOUNT",
  "NEXT_PUBLIC_BILLING_USDC_AMOUNT",
  "BILLING_PERIOD_DAYS",
  "NEXT_PUBLIC_BILLING_PERIOD_DAYS",
  "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
  "CRON_SECRET",
  "OPENAI_API_KEY",
  "AI_MODEL_DEFAULT",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_KEY_PREFIX",
  "NEXT_PUBLIC_R2_PUBLIC_URL",
  "R2_PUBLIC_URL",
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "NEXT_PUBLIC_ADSENSE_CLIENT_ID",
];

loadEnvLocal();
syncLocalAnonFromPublishable();

/** Force production site URL for Vercel. */
process.env.NEXT_PUBLIC_SITE_URL = PROD_URL;

const localPath = join(projectRoot, ".env.local");
if (existsSync(localPath)) {
  let content = readFileSync(localPath, "utf8");
  const re = /^NEXT_PUBLIC_SITE_URL=.*$/m;
  const line = `NEXT_PUBLIC_SITE_URL=${PROD_URL}`;
  content = re.test(content) ? content.replace(re, line) : content.trimEnd() + `\n${line}\n`;
  if (!dryRun) {
    writeFileSync(localPath, content.endsWith("\n") ? content : content + "\n", "utf8");
    const envPath = join(projectRoot, ".env");
    if (existsSync(envPath)) copyFileSync(localPath, envPath);
    console.log(`✓ Set local NEXT_PUBLIC_SITE_URL=${PROD_URL}`);
  }
}

function getVal(key) {
  if (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    );
  }
  return process.env[key]?.trim();
}

/** Keep local anon in sync when only publishable is set (new Supabase projects). */
function syncLocalAnonFromPublishable() {
  const pub = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!pub || anon) return;
  const localPath = join(projectRoot, ".env.local");
  if (!existsSync(localPath)) return;
  let content = readFileSync(localPath, "utf8");
  const re = /^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$/m;
  const line = `NEXT_PUBLIC_SUPABASE_ANON_KEY=${pub}`;
  content = re.test(content) ? content.replace(re, line) : content.trimEnd() + `\n${line}\n`;
  writeFileSync(localPath, content.endsWith("\n") ? content : content + "\n", "utf8");
  const envPath = join(projectRoot, ".env");
  if (existsSync(envPath)) copyFileSync(localPath, envPath);
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = pub;
}

console.log("=== Push env → Vercel Production ===\n");
if (dryRun) console.log("(dry-run — no changes)\n");

let pushed = 0;
let skipped = 0;
const missing = [];

for (const key of KEYS) {
  if (LOCAL_ONLY.has(key)) continue;
  const val = getVal(key);
  if (!val) {
    missing.push(key);
    continue;
  }

  if (dryRun) {
    console.log(`  would push ${key}`);
    pushed++;
    continue;
  }

  const r = spawnSync(
    "npx",
    ["vercel", "env", "add", key, "production", "--force", "--yes", "--value", val],
    {
      encoding: "utf8",
      cwd: projectRoot,
      stdio: ["pipe", "pipe", "pipe"],
    }
  );

  if (r.status === 0) {
    console.log(`  ✓ ${key}`);
    pushed++;
  } else {
    const err = (r.stderr || r.stdout || "").trim();
    console.error(`  ✗ ${key}: ${err.slice(0, 120)}`);
    skipped++;
  }
}

console.log(`\nPushed: ${pushed}, failed: ${skipped}`);
if (missing.length) {
  console.log("\nMissing locally (add to .env.local then re-run):");
  for (const k of missing) console.log(`  ○ ${k}`);
}

if (!dryRun && pushed > 0) {
  console.log("\nNext: npx vercel deploy --prod");
}

process.exit(skipped > 0 ? 1 : 0);
