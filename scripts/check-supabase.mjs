#!/usr/bin/env node
/**
 * Verifies Supabase env + connectivity + expected tables.
 * Run: node scripts/check-supabase.mjs
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i);
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const EXPECTED_TABLES = [
  "organizations",
  "profiles",
  "clients",
  "assessments",
  "organization_invites",
  "organization_email_settings",
  "email_templates",
  "email_campaigns",
  "email_events",
  "ai_requests",
];

/** Phase 5+ columns — probed via REST select when service role available */
const EXPECTED_COLUMNS = [
  { table: "clients", columns: ["anzsco_code", "anzsco_title", "archived_at"] },
  { table: "organization_email_settings", columns: ["from_domain", "from_domain_verified"] },
];

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publishable =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const BETA_ENV = [
  { key: "NEXT_PUBLIC_SITE_URL", required: false, note: "production domain before deploy" },
  { key: "NEXT_PUBLIC_SUPABASE_URL", required: true },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", alt: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", required: true },
  { key: "SUPABASE_SERVICE_ROLE_KEY", required: true, note: "signup, share links, team invites" },
  { key: "RESEND_API_KEY", required: true, note: "team invite + assessment emails" },
  { key: "EMAIL_FROM_PLATFORM", required: false, note: "or EMAIL_FROM_DEFAULT_AGENCY" },
  { key: "STRIPE_SECRET_KEY", required: false, note: "billing upgrade" },
  { key: "STRIPE_WEBHOOK_SECRET", required: false, note: "subscription sync" },
  { key: "R2_ACCOUNT_ID", required: false, note: "logo upload (Agency branding)" },
];

function keyStatus(val, label) {
  if (!val) return `MISSING (${label})`;
  return `set (${val.slice(0, 12)}…)`;
}

console.log("=== Supabase configuration ===\n");
console.log("NEXT_PUBLIC_SUPABASE_URL:", url ? "set" : "MISSING");
console.log("Publishable/anon key:", keyStatus(publishable, "required for /login"));
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  serviceRole ? keyStatus(serviceRole, "required for signup org + /share") : "MISSING or empty"
);

if (!url || !publishable) {
  console.log("\n❌ Cannot connect: add URL + publishable key to .env.local");
  process.exit(1);
}

const TABLE_PROBE_COLUMN = {
  organization_email_settings: "organization_id",
  unsubscribe_tokens: "token",
};

async function restTableOk(table, apiKey = publishable) {
  const col = TABLE_PROBE_COLUMN[table] ?? "id";
  const res = await fetch(`${url}/rest/v1/${table}?select=${col}&limit=1`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (res.status === 404) {
    const body = await res.json().catch(() => ({}));
    if (body?.code === "PGRST205") {
      return { ok: false, message: "table missing or not exposed to Data API (PGRST205)" };
    }
  }
  if (!res.ok) {
    const text = await res.text();
    return { ok: false, message: `${res.status} ${text.slice(0, 120)}` };
  }
  return { ok: true };
}

async function restColumnsOk(table, columns) {
  const select = columns.join(",");
  const key = serviceRole ?? publishable;
  const res = await fetch(`${url}/rest/v1/${table}?select=${select}&limit=0`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    if (text.includes("column") || res.status === 400) {
      return { ok: false, message: `missing column(s): ${text.slice(0, 160)}` };
    }
    return { ok: false, message: `${res.status} ${text.slice(0, 120)}` };
  }
  return { ok: true };
}

console.log("\n=== Connection test (REST / Data API) ===");
const orgProbe = await restTableOk("organizations");
if (orgProbe.ok) {
  console.log("✓ organizations reachable via REST");
} else {
  console.log("❌ organizations:", orgProbe.message);
  console.log("\n→ Run: npm run db:migrate (needs DATABASE_URL in .env.local)");
  console.log("→ Or paste SQL files in Supabase SQL Editor (supabase/migrations/, in order)");
  console.log(
    "→ If tables exist in SQL but REST fails: Dashboard → Integrations → Data API → expose schema `public`"
  );
}

const EXTRA_TABLES = ["stripe_webhook_events", "email_sends", "unsubscribe_tokens"];
const allTables = [...EXPECTED_TABLES, ...EXTRA_TABLES];

console.log("\n=== Tables (REST / Data API) ===");
for (const table of allTables) {
  const probe = await restTableOk(table);
  if (probe.ok) {
    console.log(`  ✓ ${table}`);
  } else {
    console.log(`  ❌ ${table}: ${probe.message}`);
  }
}

console.log("\n=== Phase 5+ columns ===");
for (const { table, columns } of EXPECTED_COLUMNS) {
  const probe = await restColumnsOk(table, columns);
  if (probe.ok) {
    console.log(`  ✓ ${table} (${columns.join(", ")})`);
  } else {
    console.log(`  ❌ ${table}: ${probe.message}`);
    console.log("     → Run migrations 20260802000000_client_crm.sql and 20260901000000_email_domain.sql");
  }
}

console.log("\n=== Beta env checklist ===");
for (const item of BETA_ENV) {
  const val =
    process.env[item.key]?.trim() ||
    (item.alt ? process.env[item.alt]?.trim() : undefined);
  const status = val ? "✓" : item.required ? "❌" : "○";
  const note = item.note ? ` — ${item.note}` : "";
  console.log(`  ${status} ${item.key}${note}`);
}

console.log("\n=== Migrations to apply (in order) ===");
const migrations = [
  "20260101000000_initial_schema.sql",
  "20260201000000_stripe_billing.sql",
  "20260301000000_email.sql",
  "20260401000000_email_marketing.sql",
  "20260501000000_ai.sql",
  "20260601000000_data_api_grants.sql",
  "20260701000000_agency_profile.sql",
  "20260801000000_team_invites.sql",
  "20260802000000_client_crm.sql",
  "20260901000000_email_domain.sql",
];
for (const m of migrations) console.log(" ", m);

console.log("\nDone.");
