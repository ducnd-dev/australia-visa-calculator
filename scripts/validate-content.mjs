#!/usr/bin/env node
/**
 * Validates marketing static pages for structure, SEO, and cross-links.
 * Run: npm run content:validate
 */
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const marketingDir = join(root, "src/app/(marketing)");

const PAGES = [
  { slug: "privacy", minH2: 3, mustLink: ["/contact", "/terms"] },
  { slug: "disclaimer", minH2: 3, mustLink: ["/privacy", "/terms", "/sources"] },
  { slug: "terms", minH2: 3, mustLink: ["/privacy", "/disclaimer", "/pricing"] },
  { slug: "about", minH2: 2, mustLink: ["/sources", "/disclaimer"] },
  { slug: "contact", minH2: 2, mustLink: ["/privacy", "/calculator"] },
  { slug: "for-agents", minH2: 2, mustLink: ["/disclaimer", "/terms", "/pricing"] },
  { slug: "sources", minH2: 1, mustLink: [] },
  {
    slug: "faq",
    minH2: 0,
    mustLink: ["/disclaimer"],
    extraFiles: ["src/components/faq/FaqAccordion.tsx"],
  },
];

let errors = 0;
let warnings = 0;

function warn(msg) {
  console.warn(`⚠ ${msg}`);
  warnings++;
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  errors++;
}

for (const { slug, minH2, mustLink, extraFiles = [] } of PAGES) {
  const pagePath = join(marketingDir, slug, "page.tsx");
  if (!existsSync(pagePath)) {
    fail(`/${slug}: page not found at ${pagePath}`);
    continue;
  }

  let content = readFileSync(pagePath, "utf8");
  for (const rel of extraFiles) {
    const extraPath = join(root, rel);
    if (existsSync(extraPath)) {
      content += readFileSync(extraPath, "utf8");
    }
  }

  if (!content.includes("StaticPage")) {
    fail(`/${slug}: should wrap content in StaticPage`);
  }

  if (!content.includes("buildMetadata")) {
    warn(`/${slug}: missing buildMetadata export`);
  }

  const h2Count = (content.match(/<h2[\s>]/g) || []).length;
  if (h2Count < minH2) {
    warn(`/${slug}: ${h2Count} h2 section(s), expected at least ${minH2}`);
  }

  const descMatch = content.match(/description:\s*\n?\s*(?:"([^"]+)"|'([^']+)'|`([^`]+)`)/);
  const description = descMatch?.[1] ?? descMatch?.[2] ?? descMatch?.[3];
  if (!description) {
    warn(`/${slug}: missing meta description`);
  } else if (description.length < 50 || description.length > 160) {
    warn(`/${slug}: meta description length ${description.length} (aim 50–160)`);
  }

  for (const href of mustLink) {
    if (!content.includes(`href="${href}"`) && !content.includes(`href='${href}'`)) {
      warn(`/${slug}: should link to ${href}`);
    }
  }

  if (errors === 0 || content.includes("StaticPage")) {
    console.log(`✓ /${slug}`);
  }
}

// Typography plugin must be registered for prose classes to work
const globalsCss = readFileSync(join(root, "src/app/globals.css"), "utf8");
if (!globalsCss.includes('@plugin "@tailwindcss/typography"')) {
  fail("globals.css: missing @plugin \"@tailwindcss/typography\"");
}

const proseUtil = join(root, "src/lib/ui/prose.ts");
if (!existsSync(proseUtil)) {
  fail("src/lib/ui/prose.ts: shared prose styles missing");
}

if (errors) {
  console.error(`\n${errors} error(s), ${warnings} warning(s)`);
  process.exit(1);
}

console.log(`\n${PAGES.length} static pages OK (${warnings} warning(s))`);
