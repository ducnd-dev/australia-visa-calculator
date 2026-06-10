#!/usr/bin/env node
/**
 * Print Vercel Production env checklist (names + set/missing, no secret values).
 * Run after setup:launch-g2 — paste missing vars in Vercel dashboard.
 */
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const REQUIRED = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "EMAIL_FROM_PLATFORM",
];

const RECOMMENDED = [
  "EMAIL_FROM_DEFAULT_AGENCY",
  "RESEND_WEBHOOK_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID_AGENCY_MONTHLY",
  "OPENAI_API_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "NEXT_PUBLIC_R2_PUBLIC_URL",
  "BETA_TEST_EMAIL",
];

function status(key) {
  const alt =
    key === "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
      : undefined;
  const val = process.env[key]?.trim() || alt;
  if (!val) return "MISSING";
  if (key === "NEXT_PUBLIC_SITE_URL" && (val.includes("localhost") || val.includes("127.0.0.1"))) {
    return "LOCALHOST — change before Vercel";
  }
  return "ready to paste";
}

console.log("=== Vercel Production env checklist (G2/G5) ===\n");
console.log("Required:");
for (const k of REQUIRED) {
  console.log(`  [${status(k)}] ${k}`);
}
console.log("\nRecommended:");
for (const k of RECOMMENDED) {
  const s = status(k);
  if (s === "MISSING") console.log(`  [○] ${k}`);
  else console.log(`  [✓] ${k}`);
}
console.log("\nThen: npx vercel login && npx vercel deploy --prod");
