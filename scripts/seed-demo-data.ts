#!/usr/bin/env npx tsx
/**
 * Seed realistic practice data for local/staging demos.
 *
 *   ADMIN_EMAIL=admin@example.com npm run seed:demo
 *   ADMIN_EMAIL=admin@example.com npm run seed:demo -- --reset
 *
 * Requires: Supabase keys in .env.local, migrations applied (`npm run db:migrate`),
 *           user must already exist (use seed:admin first).
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./load-env-local.mjs";
import { calculatePoints } from "../src/lib/visa-rules/gsm/calculate-points";
import type { CalculatorAnswers } from "../src/lib/visa-rules/gsm/calculator-schema";
import {
  defaultTargetForVisa,
  suggestImprovements,
} from "../src/lib/visa-rules/gsm/suggest-improvements";

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const adminEmail = process.env.ADMIN_EMAIL?.trim()?.toLowerCase();
const reset = process.argv.includes("--reset");

if (!url || !serviceKey) {
  console.error("❌ Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const adminEmailResolved = adminEmail ?? "";
if (!adminEmailResolved) {
  console.error("❌ Set ADMIN_EMAIL=your@email.com (same user as seed:admin)");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

type ClientSeed = {
  ref: string;
  display_name: string;
  email: string | null;
  status: "lead" | "active" | "lodged" | "archived";
  anzsco_code: string | null;
  anzsco_title: string | null;
  notes: string | null;
  marketing_consent: boolean;
  archived?: boolean;
  assessments?: {
    answers: CalculatorAnswers;
    created_days_ago: number;
    agent_notes?: string;
    share_expires_days?: number | null;
    share_revoked?: boolean;
  }[];
  emails?: {
    subject: string;
    status: "sent" | "failed";
    days_ago: number;
    link_assessment_index?: number;
  }[];
};

const CLIENTS: ClientSeed[] = [
  {
    ref: "DEMO-001",
    display_name: "Chen Wei L.",
    email: "chen.wei.demo@example.com",
    status: "active",
    anzsco_code: "261313",
    anzsco_title: "Software Engineer",
    notes: "Primary skilled independent pathway. IELTS 8.0 each band — verified on file.",
    marketing_consent: true,
    assessments: [
      {
        created_days_ago: 12,
        answers: {
          visaSubclass: "189",
          ageBand: "25-32",
          english: "superior",
          overseasYears: "5",
          australianYears: "1",
          qualification: "bachelor",
          australianStudy: true,
          regionalStudy: false,
          specialistEducation: false,
          naati: false,
          professionalYear: true,
          partnerStatus: "single",
        },
        agent_notes:
          "Strong GSM profile. Discuss state nomination as backup if 189 rounds remain competitive.",
        share_expires_days: 30,
      },
    ],
    emails: [
      {
        subject: "Points assessment: 85 points — Chen Wei L.",
        status: "sent",
        days_ago: 11,
        link_assessment_index: 0,
      },
    ],
  },
  {
    ref: "DEMO-002",
    display_name: "Nguyen Thi T.",
    email: "nguyen.demo@example.com",
    status: "lead",
    anzsco_code: "254415",
    anzsco_title: "Registered Nurse",
    notes: "Initial enquiry — awaiting English test results.",
    marketing_consent: true,
  },
  {
    ref: "DEMO-003",
    display_name: "Raj Patel",
    email: "raj.patel.demo@example.com",
    status: "active",
    anzsco_code: "221111",
    anzsco_title: "Accountant (General)",
    notes: "Below competitive threshold — English upgrade is main lever.",
    marketing_consent: false,
    assessments: [
      {
        created_days_ago: 8,
        answers: {
          visaSubclass: "189",
          ageBand: "40-44",
          english: "competent",
          overseasYears: "3",
          australianYears: "0",
          qualification: "bachelor",
          australianStudy: false,
          regionalStudy: false,
          specialistEducation: false,
          naati: false,
          professionalYear: false,
          partnerStatus: "partner-english",
        },
        agent_notes: "Gap to competitive ~15 pts. Recommend PTE academic retest.",
        share_expires_days: 14,
      },
    ],
  },
  {
    ref: "DEMO-004",
    display_name: "James Williams",
    email: "j.williams.demo@example.com",
    status: "lodged",
    anzsco_code: "233211",
    anzsco_title: "Civil Engineer",
    notes: "Lodged EOI — tracking invitation rounds.",
    marketing_consent: true,
    assessments: [
      {
        created_days_ago: 95,
        answers: {
          visaSubclass: "190",
          ageBand: "33-39",
          english: "proficient",
          overseasYears: "5",
          australianYears: "0",
          qualification: "bachelor",
          australianStudy: false,
          regionalStudy: false,
          specialistEducation: false,
          naati: false,
          professionalYear: false,
          partnerStatus: "single",
        },
        agent_notes: "Baseline before PY completion.",
      },
      {
        created_days_ago: 18,
        answers: {
          visaSubclass: "190",
          ageBand: "33-39",
          english: "proficient",
          overseasYears: "5",
          australianYears: "0",
          qualification: "bachelor",
          australianStudy: false,
          regionalStudy: false,
          specialistEducation: false,
          naati: false,
          professionalYear: true,
          partnerStatus: "single",
        },
        agent_notes: "After professional year — use compare view with client.",
        share_expires_days: 60,
      },
    ],
    emails: [
      {
        subject: "Points assessment: 75 points — James Williams",
        status: "sent",
        days_ago: 17,
        link_assessment_index: 1,
      },
    ],
  },
  {
    ref: "DEMO-005",
    display_name: "Anna Kim",
    email: "anna.kim.demo@example.com",
    status: "active",
    anzsco_code: "241111",
    anzsco_title: "Early Childhood Teacher",
    notes: "Re-assessment due — circumstances may have changed.",
    marketing_consent: true,
    assessments: [
      {
        created_days_ago: 195,
        answers: {
          visaSubclass: "491",
          ageBand: "25-32",
          english: "proficient",
          overseasYears: "0",
          australianYears: "3",
          qualification: "bachelor",
          australianStudy: true,
          regionalStudy: true,
          specialistEducation: false,
          naati: false,
          professionalYear: false,
          partnerStatus: "partner-skilled",
        },
        share_expires_days: null,
      },
    ],
  },
  {
    ref: "DEMO-006",
    display_name: "Michael O'Brien",
    email: null,
    status: "active",
    anzsco_code: "351311",
    anzsco_title: "Chef",
    notes: "Phone-only contact — add email before sending report.",
    marketing_consent: false,
    assessments: [
      {
        created_days_ago: 5,
        answers: {
          visaSubclass: "491",
          ageBand: "33-39",
          english: "proficient",
          overseasYears: "8",
          australianYears: "3",
          qualification: "diploma",
          australianStudy: false,
          regionalStudy: false,
          specialistEducation: false,
          naati: true,
          professionalYear: false,
          partnerStatus: "single",
        },
      },
    ],
  },
  {
    ref: "DEMO-007",
    display_name: "Rosa Santos",
    email: "rosa.demo@example.com",
    status: "active",
    anzsco_code: null,
    anzsco_title: null,
    notes: "Occupation list not confirmed — add ANZSCO before skills assessment advice.",
    marketing_consent: true,
    assessments: [
      {
        created_days_ago: 3,
        answers: {
          visaSubclass: "189",
          ageBand: "25-32",
          english: "proficient",
          overseasYears: "3",
          australianYears: "0",
          qualification: "bachelor",
          australianStudy: false,
          regionalStudy: false,
          specialistEducation: false,
          naati: false,
          professionalYear: false,
          partnerStatus: "single",
        },
      },
    ],
  },
  {
    ref: "DEMO-008",
    display_name: "Former Client — Lee H.",
    email: "lee.archived@example.com",
    status: "archived",
    anzsco_code: "262112",
    anzsco_title: "ICT Security Specialist",
    notes: "Matter closed — lodged with another agent.",
    marketing_consent: false,
    archived: true,
    assessments: [
      {
        created_days_ago: 400,
        answers: {
          visaSubclass: "189",
          ageBand: "33-39",
          english: "superior",
          overseasYears: "5",
          australianYears: "0",
          qualification: "bachelor",
          australianStudy: false,
          regionalStudy: false,
          specialistEducation: true,
          naati: false,
          professionalYear: false,
          partnerStatus: "single",
        },
        share_revoked: true,
      },
    ],
  },
];

async function findUserByEmail(target: string) {
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

async function clearDemoData(orgId: string) {
  const { data: clients } = await admin
    .from("clients")
    .select("id")
    .eq("organization_id", orgId)
    .like("internal_ref", "DEMO-%");

  const ids = (clients ?? []).map((c) => c.id);
  if (ids.length === 0) {
    console.log("  (no DEMO-* clients to remove)");
    return;
  }

  await admin.from("email_sends").delete().in("client_id", ids);
  await admin.from("assessments").delete().in("client_id", ids);
  await admin.from("clients").delete().in("id", ids);
  console.log(`✓ Removed ${ids.length} demo client(s) and related records`);
}

async function main() {
  console.log("=== Seed demo practice data ===\n");

  const user = await findUserByEmail(adminEmailResolved);
  if (!user) {
    console.error(`❌ No auth user for ${adminEmailResolved} — run npm run seed:admin first`);
    process.exit(1);
  }

  const { data: profile, error: profErr } = await admin
    .from("profiles")
    .select("id, organization_id, full_name")
    .eq("id", user.id)
    .single();
  if (profErr || !profile) {
    console.error("❌ Profile not found for user");
    process.exit(1);
  }

  const orgId = profile.organization_id;
  console.log(`Workspace: ${orgId}`);
  console.log(`Agent: ${profile.full_name ?? adminEmailResolved}\n`);

  if (reset) {
    console.log("Resetting demo data…");
    await clearDemoData(orgId);
  }

  const { count: existingDemo } = await admin
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .like("internal_ref", "DEMO-%");

  if ((existingDemo ?? 0) > 0 && !reset) {
    console.log(`ℹ ${existingDemo} DEMO-* client(s) already exist. Use --reset to replace.`);
    process.exit(0);
  }

  await admin
    .from("organizations")
    .update({
      mara_number: "2318245",
      registered_business_name: "Pacific Migration Practice Pty Ltd",
      phone: "+61 2 9000 1234",
      website: "https://example-migration.com.au",
      share_link_expiry_days: 90,
    })
    .eq("id", orgId);

  await admin.from("organization_onboarding").upsert({
    organization_id: orgId,
    dismissed_at: new Date().toISOString(),
  });

  console.log("✓ Practice profile + onboarding dismissed");

  let clientCount = 0;
  let assessmentCount = 0;

  for (const seed of CLIENTS) {
    const { data: client, error: clientErr } = await admin
      .from("clients")
      .insert({
        organization_id: orgId,
        display_name: seed.display_name,
        email: seed.email,
        internal_ref: seed.ref,
        notes: seed.notes,
        anzsco_code: seed.anzsco_code,
        anzsco_title: seed.anzsco_title,
        status: seed.status,
        marketing_consent_at: seed.marketing_consent ? daysAgo(30) : null,
        archived_at: seed.archived ? daysAgo(60) : null,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (clientErr || !client) {
      throw new Error(`Client ${seed.ref}: ${clientErr?.message}`);
    }
    clientCount++;

    const assessmentIds: string[] = [];

    for (const a of seed.assessments ?? []) {
      const result = calculatePoints(a.answers);
      const suggestions = suggestImprovements(
        a.answers,
        result,
        defaultTargetForVisa(result.visaSubclass)
      );

      const shareExpiresAt =
        a.share_expires_days != null ? daysFromNow(a.share_expires_days) : null;

      const { data: assessment, error: aErr } = await admin
        .from("assessments")
        .insert({
          organization_id: orgId,
          client_id: client.id,
          created_by: profile.id,
          visa_subclass: a.answers.visaSubclass,
          answers: a.answers,
          breakdown: result.breakdown,
          total_points: result.total,
          agent_notes: a.agent_notes ?? null,
          suggestions_json: suggestions,
          share_expires_at: shareExpiresAt,
          share_revoked_at: a.share_revoked ? daysAgo(30) : null,
          created_at: daysAgo(a.created_days_ago),
        })
        .select("id, share_token")
        .single();

      if (aErr || !assessment) {
        throw new Error(`Assessment for ${seed.ref}: ${aErr?.message}`);
      }
      assessmentIds.push(assessment.id);
      assessmentCount++;
    }

    for (const e of seed.emails ?? []) {
      if (!seed.email) continue;
      const assessmentId =
        e.link_assessment_index != null ? assessmentIds[e.link_assessment_index] : null;

      await admin.from("email_sends").insert({
        organization_id: orgId,
        client_id: client.id,
        assessment_id: assessmentId,
        created_by: profile.id,
        to_email: seed.email,
        subject: e.subject,
        template_key: "assessment_report",
        status: e.status,
        error_message: e.status === "failed" ? "Mailbox unavailable (demo)" : null,
        send_type: "transactional",
        created_at: daysAgo(e.days_ago),
      });
    }
  }

  // Failed email in last 7 days (attention queue) — Chen's second send
  const { data: chen } = await admin
    .from("clients")
    .select("id, email")
    .eq("organization_id", orgId)
    .eq("internal_ref", "DEMO-001")
    .single();

  if (chen?.email) {
    await admin.from("email_sends").insert({
      organization_id: orgId,
      client_id: chen.id,
      created_by: profile.id,
      to_email: chen.email,
      subject: "Follow-up: skilled migration points (demo failed send)",
      template_key: "client-follow-up",
      status: "failed",
      error_message: "Recipient mailbox full (demo)",
      send_type: "transactional",
      created_at: daysAgo(2),
    });
  }

  // Share expiring within 7 days — Raj Patel
  const { data: rajClient } = await admin
    .from("clients")
    .select("id")
    .eq("organization_id", orgId)
    .eq("internal_ref", "DEMO-003")
    .single();

  if (rajClient) {
    const { data: rajA } = await admin
      .from("assessments")
      .select("id")
      .eq("client_id", rajClient.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (rajA) {
      await admin
        .from("assessments")
        .update({ share_expires_at: daysFromNow(5) })
        .eq("id", rajA.id);
    }
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  console.log(`\n✓ Created ${clientCount} clients, ${assessmentCount} assessments`);
  console.log("\n--- Demo scenarios on dashboard ---");
  console.log("  • Needs attention: Nguyen (no assessment), Raj (low points),");
  console.log("    Michael (no email), Rosa (no ANZSCO), Anna (stale), failed email, share expiring");
  console.log("  • Compare: James Williams (2 assessments)");
  console.log("  • Status filters: Lead, Active, Lodged, Archived");
  console.log("\n--- Open app ---");
  console.log(`Login: ${siteUrl}/login`);
  console.log(`App:   ${siteUrl}/app`);
  console.log(`\nRe-seed: npm run seed:demo -- --reset`);
}

main().catch((err) => {
  console.error("❌", err instanceof Error ? err.message : err);
  process.exit(1);
});
