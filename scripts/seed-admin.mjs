#!/usr/bin/env node
/**
 * Create or upgrade a full-access admin (workspace admin + super_admin + Professional plan).
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='YourSecurePass1!' npm run seed:admin
 *
 * If ADMIN_PASSWORD is omitted, a random password is generated and printed once.
 */
import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const email = process.env.ADMIN_EMAIL?.trim()?.toLowerCase();
let password = process.env.ADMIN_PASSWORD?.trim();
const fullName = process.env.ADMIN_FULL_NAME?.trim() || "Dev Admin";
const orgName = process.env.ADMIN_ORG_NAME?.trim() || "Demo Migration Practice";

if (!url || !serviceKey) {
  console.error("❌ Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!email) {
  console.error("❌ Set ADMIN_EMAIL=your@email.com");
  console.error("   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed:admin");
  process.exit(1);
}

const generated = !password;
if (!password) {
  password = randomBytes(12).toString("base64url");
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(target) {
  let page = 1;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const user = data.users.find((u) => u.email?.toLowerCase() === target);
    if (user) return user;
    if (data.users.length < 200) break;
    page++;
  }
  return null;
}

async function main() {
  console.log("=== Seed full admin ===\n");

  let userId;
  const existing = await findUserByEmail(email);

  if (existing) {
    userId = existing.id;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    console.log(`✓ Updated existing auth user: ${email}`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`✓ Created auth user: ${email}`);
  }

  const { data: profile } = await admin.from("profiles").select("id, organization_id").eq("id", userId).maybeSingle();

  let orgId = profile?.organization_id;

  if (!orgId) {
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const { data: org, error: orgErr } = await admin
      .from("organizations")
      .insert({
        name: orgName,
        slug: `${slug}-${userId.slice(0, 8)}`,
        plan: "agency",
        show_ads: false,
        stripe_subscription_status: "active",
        ai_enabled: true,
        preferred_model: "gpt-4o-mini",
      })
      .select("id")
      .single();
    if (orgErr) throw orgErr;
    orgId = org.id;
    console.log(`✓ Created organization: ${orgName}`);

    const { error: profErr } = await admin.from("profiles").insert({
      id: userId,
      organization_id: orgId,
      full_name: fullName,
      role: "super_admin",
      platform_marketing_opt_in: false,
    });
    if (profErr) throw profErr;
    console.log("✓ Created profile: super_admin");
  } else {
    await admin
      .from("organizations")
      .update({
        plan: "agency",
        show_ads: false,
        stripe_subscription_status: "active",
        ai_enabled: true,
      })
      .eq("id", orgId);

    await admin
      .from("profiles")
      .update({ role: "super_admin", full_name: fullName })
      .eq("id", userId);

    console.log(`✓ Upgraded existing workspace to Professional + super_admin`);
  }

  await admin.from("organization_email_settings").upsert({
    organization_id: orgId,
    from_name: orgName,
    reply_to: email,
  });

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  console.log("\n--- Login ---");
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}${generated ? "  (generated — save it)" : ""}`);
  console.log(`Login:    ${siteUrl}/login`);
  console.log(`App:      ${siteUrl}/app`);
  console.log(`Platform admin: ${siteUrl}/admin/marketing`);
  console.log("\nRole: super_admin · Plan: agency (Professional) — PDF, branding, billing, marketing");
}

main().catch((err) => {
  console.error("❌", err.message ?? err);
  process.exit(1);
});
