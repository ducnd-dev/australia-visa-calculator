#!/usr/bin/env node
/**
 * Applies supabase/migrations/*.sql to the linked Supabase Postgres database.
 *
 * Requires in .env.local (one of):
 *   DATABASE_URL=postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres
 *   SUPABASE_DB_PASSWORD=...  (uses NEXT_PUBLIC_SUPABASE_URL for project ref)
 *
 * Run: npm run db:migrate
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Client } = pg;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(root, "supabase", "migrations");

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

function projectRefFromUrl(url) {
  const m = url?.match(/https:\/\/([^.]+)\.supabase\.co/);
  return m?.[1] ?? null;
}

function resolveDatabaseUrl() {
  const direct = process.env.DATABASE_URL?.trim();
  if (direct) return direct;

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const ref = projectRefFromUrl(supabaseUrl);
  if (password && ref) {
    const host = process.env.SUPABASE_DB_HOST?.trim() || `db.${ref}.supabase.co`;
    return `postgresql://postgres:${encodeURIComponent(password)}@${host}:5432/postgres`;
  }

  return null;
}

/** Migrations need session/direct (5432), not transaction pooler (6543). */
function migrationConnectionUrl(url) {
  let u = url.trim();
  try {
    const parsed = new URL(u);
    if (parsed.port === "6543" || parsed.searchParams.has("pgbouncer")) {
      parsed.port = "5432";
      parsed.searchParams.delete("pgbouncer");
      u = parsed.toString();
      console.log("ℹ Using session pooler (port 5432) for migrations — not transaction mode (6543).\n");
    }
  } catch {
    /* keep raw string */
  }
  return u;
}

function listMigrationFiles() {
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

loadEnvLocal();

const databaseUrl = resolveDatabaseUrl();
if (!databaseUrl) {
  console.error("❌ Missing database credentials.\n");
  console.error("Add to .env.local (Supabase → Project Settings → Database):");
  console.error("  DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@db.[ref].supabase.co:5432/postgres");
  console.error("  — or —");
  console.error("  SUPABASE_DB_PASSWORD=[database password]");
  console.error("\nThen run: npm run db:migrate");
  process.exit(1);
}

const files = listMigrationFiles();
if (files.length === 0) {
  console.error("❌ No SQL files in supabase/migrations/");
  process.exit(1);
}

const client = new Client({
  connectionString: migrationConnectionUrl(databaseUrl),
  ssl: { rejectUnauthorized: false },
});

console.log("=== Supabase migrations ===\n");
console.log(`Found ${files.length} migration file(s).\n`);

try {
  await client.connect();

  await client.query(`
    create table if not exists public.app_schema_migrations (
      version text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const { rows: appliedRows } = await client.query(
    "select version from public.app_schema_migrations order by version"
  );
  const applied = new Set(appliedRows.map((r) => r.version));

  let ran = 0;
  let skipped = 0;

  for (const file of files) {
    const version = file.replace(/\.sql$/, "");
    if (applied.has(version)) {
      console.log(`  ○ skip ${file} (already applied)`);
      skipped++;
      continue;
    }

    const sql = readFileSync(join(migrationsDir, file), "utf8");
    console.log(`  → apply ${file} ...`);

    await client.query("begin");
    try {
      await client.query(sql);
      await client.query(
        "insert into public.app_schema_migrations (version) values ($1)",
        [version]
      );
      await client.query("commit");
      console.log(`  ✓ ${file}`);
      ran++;
    } catch (err) {
      await client.query("rollback");
      console.error(`  ✗ ${file} failed:`, err.message);
      process.exit(1);
    }
  }

  console.log(`\nDone. Applied: ${ran}, skipped: ${skipped}.`);
  if (ran > 0) {
    console.log("\nNext: npm run db:check");
    console.log(
      "If REST still returns PGRST205, expose `public` in Dashboard → Integrations → Data API → Exposed schemas."
    );
  }
} catch (err) {
  console.error("❌ Connection failed:", err.message);
  if (/password authentication failed/i.test(err.message)) {
    console.error("\n→ Supabase → Settings → Database → reset Database password.");
    console.error("→ Copy Connection string → Session mode (port 5432), not Transaction (6543).");
  }
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
