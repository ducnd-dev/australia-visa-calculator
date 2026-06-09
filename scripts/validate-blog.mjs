#!/usr/bin/env node
/**
 * Validates blog posts for SEO basics. Run: npm run blog:validate
 */
import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const postsDir = join(dirname(fileURLToPath(import.meta.url)), "../src/lib/blog/posts");
const files = readdirSync(postsDir).filter((f) => f.endsWith(".ts") && f !== "index.ts");

let errors = 0;

for (const file of files) {
  const content = readFileSync(join(postsDir, file), "utf8");
  const slugMatch = content.match(/slug:\s*"([^"]+)"/);
  const titleMatch = content.match(/title:\s*"([^"]+)"/);
  const descMatch = content.match(/description:\s*\n?\s*"([^"]+)"/);
  const slug = slugMatch?.[1];
  const title = titleMatch?.[1];
  const description = descMatch?.[1];

  if (!slug || !title || !description) {
    console.error(`✗ ${file}: missing slug, title, or description`);
    errors++;
    continue;
  }
  if (description.length < 50 || description.length > 160) {
    console.warn(`⚠ ${slug}: meta description length ${description.length} (aim 50–160)`);
  }
  if (title.length > 60) {
    console.warn(`⚠ ${slug}: title length ${title.length} (aim ≤60 for SERP)`);
  }
  if (!content.includes('type: "h2"')) {
    console.warn(`⚠ ${slug}: no h2 sections`);
  }
  console.log(`✓ ${slug}`);
}

if (errors) {
  console.error(`\n${errors} error(s)`);
  process.exit(1);
}
console.log(`\n${files.length} posts OK`);
