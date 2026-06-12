#!/usr/bin/env node
/**
 * Beta production pre-flight — env vars, site URL, webhook endpoints.
 * Run: npm run beta:preflight
 */
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const isLocalhost =
  !siteUrl || siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1");

const REQUIRED = [
  { key: "NEXT_PUBLIC_SITE_URL", note: "invite links, billing return, share URLs" },
  { key: "NEXT_PUBLIC_SUPABASE_URL" },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    alt: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  },
  { key: "SUPABASE_SERVICE_ROLE_KEY", note: "signup, share, team invites" },
  { key: "RESEND_API_KEY", note: "team invite + assessment email" },
];

const RECOMMENDED = [
  {
    key: "EMAIL_FROM_PLATFORM",
    alt: "EMAIL_FROM_DEFAULT_AGENCY",
    note: "verified domain in production",
  },
  { key: "BASE_RPC_URL", note: "on-chain payment verification" },
  { key: "BILLING_TREASURY_WALLET", note: "USDC recipient" },
  { key: "NEXT_PUBLIC_BILLING_TREASURY_WALLET", note: "client-side transfer target" },
  { key: "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID", note: "wallet connect UI" },
  { key: "CRON_SECRET", note: "expire-billing cron" },
  { key: "OPENAI_API_KEY", note: "AI explain demo" },
];

const OPTIONAL_BRANDING = [
  { key: "R2_ACCOUNT_ID" },
  { key: "R2_ACCESS_KEY_ID" },
  { key: "R2_SECRET_ACCESS_KEY" },
  { key: "R2_BUCKET_NAME" },
  { key: "NEXT_PUBLIC_R2_PUBLIC_URL" },
];

function getEnv(item) {
  return (
    process.env[item.key]?.trim() ||
    (item.alt ? process.env[item.alt]?.trim() : undefined)
  );
}

let failed = 0;

console.log("=== Beta pre-flight ===\n");

if (isLocalhost) {
  console.log("⚠ NEXT_PUBLIC_SITE_URL is localhost or unset — set production URL before deploy.\n");
  failed += 1;
} else {
  console.log(`✓ Site URL: ${siteUrl}\n`);
}

console.log("Required:");
for (const item of REQUIRED) {
  const val = getEnv(item);
  const note = item.note ? ` (${item.note})` : "";
  if (val) {
    console.log(`  ✓ ${item.key}${note}`);
  } else {
    console.log(`  ❌ ${item.key}${note}`);
    failed += 1;
  }
}

console.log("\nRecommended:");
for (const item of RECOMMENDED) {
  const val = getEnv(item);
  const note = item.note ? ` — ${item.note}` : "";
  console.log(`  ${val ? "✓" : "○"} ${item.key}${note}`);
}

const r2Set = OPTIONAL_BRANDING.filter((i) => getEnv(i)).length;
console.log(`\nR2 branding: ${r2Set}/${OPTIONAL_BRANDING.length} vars set`);

if (siteUrl && !isLocalhost) {
  console.log("\nWebhook endpoints (configure in dashboards):");
  console.log(`  Resend:  ${siteUrl}/api/email/webhooks/resend`);
  console.log(`  Cron:    ${siteUrl}/api/cron/expire-billing (Bearer CRON_SECRET)`);
  console.log("\nSmoke test after deploy:");
  console.log(`  npm run beta:smoke`);
}

console.log("\nDatabase:");
console.log("  npm run db:migrate && npm run db:check");
console.log("  Phase 8 columns: assessments.share_password_hash, organizations.seat_limit");

console.log(failed ? `\n❌ ${failed} blocker(s) — fix before beta onboard.` : "\n✓ Required env ready.");
process.exit(failed ? 1 : 0);
