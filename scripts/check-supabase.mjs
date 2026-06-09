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
  "organization_email_settings",
  "email_templates",
  "email_campaigns",
  "email_events",
  "ai_requests",
];

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publishable =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

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

async function restTableOk(table) {
  const col = TABLE_PROBE_COLUMN[table] ?? "id";
  const res = await fetch(`${url}/rest/v1/${table}?select=${col}&limit=1`, {
    headers: {
      apikey: publishable,
      Authorization: `Bearer ${publishable}`,
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

console.log("\n=== Migrations to apply (in order) ===");
const migrations = [
  "20260101000000_initial_schema.sql",
  "20260201000000_stripe_billing.sql",
  "20260301000000_email.sql",
  "20260401000000_email_marketing.sql",
  "20260501000000_ai.sql",
  "20260601000000_data_api_grants.sql",
];
for (const m of migrations) console.log(" ", m);

console.log("\nDone.");
