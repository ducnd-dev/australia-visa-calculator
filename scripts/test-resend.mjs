#!/usr/bin/env node
/**
 * Send a test email via Resend — beta launch gate G7.
 * Run: BETA_TEST_EMAIL=you@example.com npm run beta:test-email
 */
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const apiKey = process.env.RESEND_API_KEY?.trim();
const to = process.env.BETA_TEST_EMAIL?.trim();
const from =
  process.env.EMAIL_FROM_PLATFORM?.trim() ||
  process.env.EMAIL_FROM_DEFAULT_AGENCY?.trim() ||
  "onboarding@resend.dev";

if (!apiKey) {
  console.error("❌ RESEND_API_KEY is required");
  process.exit(1);
}

if (!to) {
  console.error("❌ BETA_TEST_EMAIL is required (recipient for test send)");
  console.error("   Example: BETA_TEST_EMAIL=you@agency.com npm run beta:test-email");
  process.exit(1);
}

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

console.log("=== Beta test email (G7) ===\n");
console.log(`From:    ${from}`);
console.log(`To:      ${to}`);
console.log(`Site:    ${siteUrl}\n`);

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to: [to],
    subject: "Beta launch gate — test email",
    html: `<p>If you received this, Resend is configured for beta onboard.</p>
<p>Site URL: <a href="${siteUrl}">${siteUrl}</a></p>
<p>Sent at ${new Date().toISOString()}</p>`,
    text: `Beta launch gate test. Site: ${siteUrl}`,
  }),
});

const body = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error("❌ Resend API error:", res.status, body.message ?? JSON.stringify(body));
  process.exit(1);
}

console.log("✓ Test email sent");
if (body.id) console.log(`  Resend id: ${body.id}`);
console.log("\nCheck inbox (and spam). Gate G7 passes when email arrives.");
