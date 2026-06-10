#!/usr/bin/env node
/**
 * Apply G2 launch env (RESEND + production SITE_URL) to .env.local.
 * Run with keys inline (do not commit):
 *
 *   RESEND_API_KEY=re_xxx LAUNCH_SITE_URL=https://your-app.vercel.app npm run setup:launch-g2
 *
 * Optional: BETA_TEST_EMAIL=you@example.com
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { projectRoot } from "./load-env-local.mjs";
import { spawnSync } from "child_process";

const localPath = join(projectRoot, ".env.local");

function upsertEnvLine(content, key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) return content.replace(re, line);
  return content.trimEnd() + `\n${line}\n`;
}

const resend = process.env.RESEND_API_KEY?.trim();
const siteUrl = (process.env.LAUNCH_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "")
  .trim()
  .replace(/\/$/, "");
const testEmail = process.env.BETA_TEST_EMAIL?.trim();

if (!resend) {
  console.error("❌ Set RESEND_API_KEY (from https://resend.com/api-keys)");
  console.error("   RESEND_API_KEY=re_xxx LAUNCH_SITE_URL=https://... npm run setup:launch-g2");
  process.exit(1);
}

if (!siteUrl || siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) {
  console.error("❌ Set LAUNCH_SITE_URL to production URL (not localhost)");
  console.error("   Example: LAUNCH_SITE_URL=https://australia-visa-calculator.vercel.app");
  process.exit(1);
}

let content = existsSync(localPath) ? readFileSync(localPath, "utf8") : "";
content = upsertEnvLine(content, "RESEND_API_KEY", resend);
content = upsertEnvLine(content, "NEXT_PUBLIC_SITE_URL", siteUrl);
if (testEmail) content = upsertEnvLine(content, "BETA_TEST_EMAIL", testEmail);

if (!/EMAIL_FROM_PLATFORM=/.test(content)) {
  content = upsertEnvLine(content, "EMAIL_FROM_PLATFORM", "onboarding@resend.dev");
}

writeFileSync(localPath, content.endsWith("\n") ? content : content + "\n", "utf8");
const envPath = join(projectRoot, ".env");
if (existsSync(envPath)) {
  writeFileSync(envPath, readFileSync(localPath, "utf8"), "utf8");
}
console.log("✓ Updated .env.local" + (existsSync(envPath) ? " and .env" : ""));
console.log(`  RESEND_API_KEY: set`);
console.log(`  NEXT_PUBLIC_SITE_URL: ${siteUrl}`);
if (testEmail) console.log(`  BETA_TEST_EMAIL: ${testEmail}`);

console.log("\nVerifying...");
const preflight = spawnSync("npm", ["run", "beta:preflight"], {
  stdio: "inherit",
  shell: true,
  cwd: projectRoot,
});

if (preflight.status !== 0) process.exit(1);

console.log("\nPushing to Vercel Production...");
const push = spawnSync("npm", ["run", "push:vercel-env"], {
  stdio: "inherit",
  shell: true,
  cwd: projectRoot,
});

if (push.status === 0) {
  console.log("\nNext:");
  console.log("  npx vercel deploy --prod");
  if (testEmail) console.log("  npm run beta:test-email");
  console.log("  npm run beta:complete-gates");
}

process.exit(push.status === 0 ? 0 : 1);
