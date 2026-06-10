import { createAdminClient } from "@/lib/supabase/admin";
import { getResend } from "@/lib/email/resend";

type AttentionRow = {
  item_type: string;
  priority: string;
  client_id: string;
  client_name: string;
  message: string;
};

export async function sendWeeklyDigests(): Promise<{ sent: number; errors: number }> {
  const admin = createAdminClient();
  const resend = getResend();
  if (!admin || !resend) return { sent: 0, errors: 0 };

  const { data: orgs } = await admin
    .from("organization_email_settings")
    .select("organization_id, reply_to, from_name, organizations(name)")
    .eq("weekly_digest_enabled", true);

  let sent = 0;
  let errors = 0;

  for (const row of orgs ?? []) {
    const orgId = row.organization_id;
    const { data: adminProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("organization_id", orgId)
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    if (!adminProfile) continue;

    const { data: attention } = await admin.rpc("get_attention_items", {
      p_org_id: orgId,
      p_limit: 10,
    });

    const items = (attention ?? []) as AttentionRow[];
    if (items.length === 0) continue;

    const replyTo = row.reply_to;
    if (!replyTo) continue;

    const orgName =
      (row.organizations as unknown as { name: string } | null)?.name ?? row.from_name ?? "Practice";

    const lines = items
      .map((i) => `• ${i.client_name}: ${i.message} (${i.priority})`)
      .join("\n");

    const html = `<p>Hi,</p><p>Weekly practice digest for <strong>${orgName}</strong>:</p><pre style="font-family:system-ui;white-space:pre-wrap">${lines}</pre><p>Review items in your <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/app">dashboard</a>.</p>`;

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_PLATFORM ?? "onboarding@resend.dev",
      to: replyTo,
      subject: `Practice digest — ${items.length} item(s) need attention`,
      html,
    });

    if (result.error) errors += 1;
    else sent += 1;
  }

  return { sent, errors };
}
