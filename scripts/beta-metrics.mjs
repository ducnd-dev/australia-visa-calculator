#!/usr/bin/env node
/**
 * Weekly beta metrics from Supabase (service role).
 * Run: npm run beta:metrics
 */
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceRole) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

async function restGet(path, headers = {}) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      ...headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function count(table, filter = "") {
  const res = await fetch(`${url}/rest/v1/${table}?select=id${filter}`, {
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      Prefer: "count=exact",
      Range: "0-0",
    },
  });
  const range = res.headers.get("content-range");
  if (range) {
    const m = range.match(/\/(\d+)$/);
    if (m) return Number(m[1]);
  }
  const rows = await res.json();
  return Array.isArray(rows) ? rows.length : 0;
}

function pct(n, d) {
  if (!d) return "—";
  return `${((n / d) * 100).toFixed(1)}%`;
}

const now = new Date().toISOString().slice(0, 10);
console.log(`=== Beta metrics — ${now} ===\n`);

try {
  const orgs = await restGet("organizations?select=id,name,plan,created_at");
  const trial = orgs.filter((o) => o.plan === "trial").length;
  const agency = orgs.filter((o) => o.plan === "agency" || o.plan === "enterprise").length;

  console.log("Organizations");
  console.log(`  Total workspaces:     ${orgs.length}`);
  console.log(`  Trial:                ${trial}`);
  console.log(`  Agency / Enterprise:  ${agency}`);

  const activeClients = await count("clients", "&archived_at=is.null");
  const archivedClients = await count("clients", "&archived_at=not.is.null");
  const withAnzsco = await count("clients", "&archived_at=is.null&anzsco_code=not.is.null");

  console.log("\nClients");
  console.log(`  Active:               ${activeClients}`);
  console.log(`  Archived:             ${archivedClients}`);
  console.log(`  With ANZSCO:          ${withAnzsco} (${pct(withAnzsco, activeClients)} of active)`);
  if (orgs.length) {
    console.log(`  Avg active / org:     ${(activeClients / orgs.length).toFixed(1)}`);
  }

  const assessments = await count("assessments");
  const passwordProtected = await count("assessments", "&share_password_hash=not.is.null");
  console.log(`\nAssessments (total):    ${assessments}`);
  console.log(`  Password-protected:   ${passwordProtected}${assessments ? ` (${pct(passwordProtected, assessments)})` : ""}`);

  const emailSettings = await restGet(
    "organization_email_settings?select=from_domain_verified"
  );
  const verifiedDomains = emailSettings.filter((r) => r.from_domain_verified).length;
  console.log(`\nEmail domains verified: ${verifiedDomains} / ${emailSettings.length} org(s) with settings`);

  const invites = await restGet(
    "organization_invites?select=id,accepted_at,created_at"
  );
  const invitesSent = invites.length;
  const invitesAccepted = invites.filter((i) => i.accepted_at).length;
  const invitesPending = invites.filter((i) => !i.accepted_at).length;

  console.log("\nTeam invites");
  console.log(`  Sent (all time):      ${invitesSent}`);
  console.log(`  Accepted:             ${invitesAccepted}`);
  console.log(`  Pending:              ${invitesPending}`);
  if (invitesSent) {
    console.log(`  Accept rate:          ${pct(invitesAccepted, invitesSent)}`);
  }

  const profiles = await restGet("profiles?select=id,role");
  const admins = profiles.filter((p) => p.role === "admin").length;
  const agents = profiles.filter((p) => p.role === "agent").length;
  console.log("\nProfiles");
  console.log(`  Admins:               ${admins}`);
  console.log(`  Agents:               ${agents}`);

  console.log("\n--- Weekly review ---");
  console.log("1. Trial → Agency: check crypto_payments + organizations.plan / billing_expires_at");
  console.log("2. Compare usage: GA4 pageviews /app/clients/*/compare");
  console.log("3. Phase 8 adoption: password share %, verified email domains (above)");
  console.log("4. Time-to-find client: qualitative from agency feedback calls");
  console.log("\nDone.");
} catch (err) {
  console.error("Failed:", err.message);
  process.exit(1);
}
