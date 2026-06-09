#!/usr/bin/env node
/** Concatenates supabase/migrations/*.sql → supabase/apply-all.sql for SQL Editor paste */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "supabase", "migrations");
const out = join(root, "supabase", "apply-all.sql");

const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const parts = files.map((f) => {
  const sql = readFileSync(join(dir, f), "utf8").trim();
  return `-- >>> ${f}\n${sql}\n`;
});

writeFileSync(
  out,
  `-- Auto-generated: npm run db:build-apply-all\n-- Paste in Supabase → SQL Editor → Run (once)\n\n${parts.join("\n")}\n`,
  "utf8"
);

console.log(`Wrote ${out} (${files.length} files)`);
