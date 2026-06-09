#!/usr/bin/env node
/**
 * Merges .env.example → .env.local: adds missing keys, keeps non-empty local values.
 * Run: npm run setup:env:sync
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseEnv(text) {
  const vars = new Map();
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1);
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    vars.set(key, val);
  }
  return vars;
}

const examplePath = join(root, ".env.example");
const localPath = join(root, ".env.local");

if (!existsSync(examplePath)) {
  console.error("Missing .env.example");
  process.exit(1);
}

const example = parseEnv(readFileSync(examplePath, "utf8"));
const local = existsSync(localPath) ? parseEnv(readFileSync(localPath, "utf8")) : new Map();

const merged = new Map(example);
for (const [k, v] of local) {
  if (v) merged.set(k, v);
}

const quoted = new Set(["EMAIL_FROM_PLATFORM", "EMAIL_FROM_DEFAULT_AGENCY"]);

const sections = [
  { header: "# Synced from .env.example — non-empty .env.local values kept.", keys: [] },
  { header: "# App", keys: ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_SUPPORT_EMAIL"] },
  {
    header: "# Supabase",
    keys: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "DATABASE_URL",
      "SUPABASE_DB_PASSWORD",
    ],
  },
  { header: "# Analytics", keys: ["NEXT_PUBLIC_GA_MEASUREMENT_ID", "NEXT_PUBLIC_ADSENSE_CLIENT_ID"] },
  {
    header: "# Resend",
    keys: ["RESEND_API_KEY", "RESEND_WEBHOOK_SECRET", "EMAIL_FROM_PLATFORM", "EMAIL_FROM_DEFAULT_AGENCY"],
  },
  {
    header: "# Stripe",
    keys: [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "STRIPE_PRICE_ID_AGENCY_MONTHLY",
    ],
  },
  { header: "# OpenAI", keys: ["OPENAI_API_KEY", "AI_MODEL_DEFAULT"] },
  {
    header: "# Cloudflare R2",
    keys: [
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME",
      "R2_KEY_PREFIX",
      "NEXT_PUBLIC_R2_PUBLIC_URL",
    ],
  },
];

const lines = [];
const written = new Set();

for (const { header, keys } of sections) {
  if (header) lines.push(header);
  for (const k of keys) {
    written.add(k);
    const v = merged.get(k) ?? "";
    lines.push(quoted.has(k) && v ? `${k}="${v}"` : `${k}=${v}`);
  }
  lines.push("");
}

for (const [k, v] of merged) {
  if (!written.has(k)) lines.push(`${k}=${v}`);
}

writeFileSync(localPath, lines.join("\n").replace(/\n\n\n+/g, "\n\n"), "utf8");

const envPath = join(root, ".env");
if (existsSync(envPath)) copyFileSync(localPath, envPath);

const added = [...example.keys()].filter((k) => !local.has(k));
console.log("Wrote .env.local");
if (added.length) console.log("  Added keys:", added.join(", "));
console.log(
  "  Preserved",
  [...local.entries()].filter(([, v]) => v).length,
  "non-empty local value(s)"
);
