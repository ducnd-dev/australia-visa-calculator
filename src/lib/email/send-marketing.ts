import { createAdminClient } from "@/lib/supabase/admin";
import { getResend } from "@/lib/email/resend";
import { isWithinMarketingLimit, monthlyMarketingLimit } from "@/lib/email/plan-limits";
import { renderTemplate } from "@/lib/email/render-template";
import { parseSegmentFilter, resolveSegment } from "@/lib/email/segments";
import { getOrCreateClientUnsubscribeToken, getOrCreateProfileUnsubscribeToken, unsubscribeUrl } from "@/lib/email/unsubscribe";
import { getSiteUrl } from "@/lib/site-url";

const DISCLAIMER =
  "You received this because your migration agent has your consent to send updates. This is not migration advice.";

export async function countMarketingSendsThisMonth(organizationId: string | null): Promise<number> {
  const admin = createAdminClient();
  if (!admin) return 0;

  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  let query = admin
    .from("email_sends")
    .select("id", { count: "exact", head: true })
    .eq("send_type", "marketing")
    .gte("created_at", start.toISOString());

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  } else {
    query = query.is("organization_id", null);
  }

  const { count } = await query;
  return count ?? 0;
}

export type RunCampaignResult =
  | { ok: true; sent: number; failed: number }
  | { ok: false; error: string };

export async function runCampaign(campaignId: string): Promise<RunCampaignResult> {
  const resend = getResend();
  if (!resend) return { ok: false, error: "RESEND_API_KEY not configured" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase not configured" };

  const { data: campaign, error: campError } = await admin
    .from("email_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campError || !campaign) return { ok: false, error: "Campaign not found" };
  if (campaign.status === "sent" || campaign.status === "sending") {
    return { ok: false, error: "Campaign already sent or in progress" };
  }

  const orgId = campaign.organization_id as string | null;
  let plan = "trial";
  let agencyName = "Your practice";

  if (orgId) {
    const { data: org } = await admin.from("organizations").select("name, plan").eq("id", orgId).single();
    plan = org?.plan ?? "trial";
    agencyName = org?.name ?? agencyName;
  }

  const sentThisMonth = await countMarketingSendsThisMonth(orgId);
  const filter = parseSegmentFilter(campaign.segment_filter);
  const recipients = await resolveSegment(filter, orgId ?? undefined);

  if (recipients.length === 0) {
    return { ok: false, error: "No recipients match this segment" };
  }

  if (!isWithinMarketingLimit(sentThisMonth, plan)) {
    return {
      ok: false,
      error: `Monthly marketing limit reached (${monthlyMarketingLimit(plan)}). Upgrade or wait until next month.`,
    };
  }

  if (sentThisMonth + recipients.length > monthlyMarketingLimit(plan)) {
    return {
      ok: false,
      error: `Would exceed monthly limit (${monthlyMarketingLimit(plan)}). ${recipients.length} recipients, ${sentThisMonth} already sent.`,
    };
  }

  await admin.from("email_campaigns").update({ status: "sending" }).eq("id", campaignId);

  const fromAddress =
    process.env.EMAIL_FROM_DEFAULT_AGENCY ??
    process.env.EMAIL_FROM_PLATFORM ??
    "onboarding@resend.dev";

  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const unsubToken = recipient.clientId
      ? await getOrCreateClientUnsubscribeToken(recipient.clientId)
      : recipient.profileId
        ? await getOrCreateProfileUnsubscribeToken(recipient.profileId)
        : null;

    const html = renderTemplate(campaign.body_html, {
      clientName: recipient.displayName,
      agentName: recipient.displayName,
      agencyName,
      body: campaign.name,
      unsubscribeUrl: unsubToken ? unsubscribeUrl(unsubToken) : getSiteUrl(),
      disclaimer: DISCLAIMER,
    });

    const subject = renderTemplate(campaign.subject, {
      clientName: recipient.displayName,
      agencyName,
    });

    const { data: sendRow } = await admin
      .from("email_sends")
      .insert({
        organization_id: orgId,
        campaign_id: campaignId,
        client_id: recipient.clientId ?? null,
        to_email: recipient.email,
        subject,
        template_key: campaign.template_key,
        send_type: "marketing",
        status: "pending",
      })
      .select("id")
      .single();

    const { error } = await resend.emails.send({
      from: campaign.scope === "platform" ? (process.env.EMAIL_FROM_PLATFORM ?? fromAddress) : fromAddress,
      to: recipient.email,
      subject,
      html,
      headers: unsubToken ? { "List-Unsubscribe": `<${unsubscribeUrl(unsubToken)}>` } : undefined,
    });

    if (error) {
      failed += 1;
      if (sendRow?.id) {
        await admin
          .from("email_sends")
          .update({ status: "failed", error_message: error.message })
          .eq("id", sendRow.id);
      }
    } else {
      sent += 1;
      if (sendRow?.id) {
        await admin.from("email_sends").update({ status: "sent" }).eq("id", sendRow.id);
      }
    }
  }

  await admin
    .from("email_campaigns")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      recipient_count: sent,
    })
    .eq("id", campaignId);

  return { ok: true, sent, failed };
}
