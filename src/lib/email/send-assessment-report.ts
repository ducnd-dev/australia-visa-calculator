import { createAdminClient } from "@/lib/supabase/admin";
import { resolveDisclaimerFooter } from "@/lib/billing/agency-profile";
import { canUseBranding } from "@/lib/billing/plans";
import { orgLogoPublicUrl } from "@/lib/billing/org-logo-url";
import { isShareLinkActive } from "@/lib/billing/share-link";
import { getResend } from "@/lib/email/resend";
import {
  assessmentReportHtml,
  assessmentReportSubject,
} from "@/lib/email/templates/assessment-report";
import { getSiteUrl } from "@/lib/site-url";
import { calculateAllPathways } from "@/lib/visa-rules/gsm/calculate-points";
import { calculatorAnswersSchema } from "@/lib/visa-rules/gsm/calculator-schema";

export type SendAssessmentReportInput = {
  organizationId: string;
  assessmentId: string;
  clientId: string;
  createdBy: string;
  emailIntro?: string;
};

export async function sendAssessmentReportEmail(
  input: SendAssessmentReportInput
): Promise<{ ok: true; resendId: string } | { ok: false; error: string }> {
  const resend = getResend();
  if (!resend) return { ok: false, error: "RESEND_API_KEY is not configured" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Supabase admin not configured" };

  const { data: assessment, error: assessmentError } = await admin
    .from("assessments")
    .select(
      "id, total_points, visa_subclass, share_token, answers, share_revoked_at, share_expires_at, client_id, organization_id, clients(display_name, email, unsubscribed_at)"
    )
    .eq("id", input.assessmentId)
    .eq("organization_id", input.organizationId)
    .single();

  if (assessmentError || !assessment) {
    return { ok: false, error: "Assessment not found" };
  }

  const shareStatus = isShareLinkActive(assessment);
  if (!shareStatus.active) {
    return { ok: false, error: shareStatus.reason ?? "Share link is not active" };
  }

  const client = assessment.clients as unknown as {
    display_name: string;
    email: string | null;
    unsubscribed_at: string | null;
  } | null;

  if (!client?.email) {
    return { ok: false, error: "Client has no email address" };
  }
  if (client.unsubscribed_at) {
    return { ok: false, error: "Client has unsubscribed from emails" };
  }

  const { data: org } = await admin
    .from("organizations")
    .select(
      "name, plan, logo_path, mara_number, registered_business_name, phone, website, disclaimer_footer"
    )
    .eq("id", input.organizationId)
    .single();

  const { data: emailSettings } = await admin
    .from("organization_email_settings")
    .select("from_name, reply_to, from_domain, from_domain_verified")
    .eq("organization_id", input.organizationId)
    .maybeSingle();

  const agencyName = emailSettings?.from_name ?? org?.name ?? "Your migration agent";
  const platformFrom =
    process.env.EMAIL_FROM_DEFAULT_AGENCY ??
    process.env.EMAIL_FROM_PLATFORM ??
    "onboarding@resend.dev";
  const customDomain =
    emailSettings?.from_domain_verified && emailSettings.from_domain
      ? emailSettings.from_domain
      : null;
  const fromAddress = customDomain
    ? `${agencyName.replace(/[<>@]/g, "")} <reports@${customDomain}>`
    : platformFrom;
  const replyTo = emailSettings?.reply_to || undefined;

  const shareUrl = `${getSiteUrl()}/share/${assessment.share_token}`;
  const subject = assessmentReportSubject(client.display_name, assessment.total_points);
  const disclaimer = resolveDisclaimerFooter(org?.disclaimer_footer, org?.mara_number);
  const branded = canUseBranding(org?.plan);
  const logoUrl = branded ? orgLogoPublicUrl(org?.logo_path) : null;

  let pathwaySummary: string | null = null;
  try {
    const answers = calculatorAnswersSchema.parse(assessment.answers);
    const all = calculateAllPathways(answers);
    pathwaySummary = all.pathways
      .map((p) => `Subclass ${p.code}: ${p.total} pts`)
      .join(" · ");
  } catch {
    pathwaySummary = null;
  }

  const html = assessmentReportHtml({
    agencyName: org?.registered_business_name ?? agencyName,
    clientName: client.display_name,
    totalPoints: assessment.total_points,
    visaSubclass: assessment.visa_subclass,
    shareUrl,
    disclaimer,
    logoUrl,
    maraNumber: org?.mara_number,
    pathwaySummary,
    phone: org?.phone,
    website: org?.website,
    customIntro: input.emailIntro ?? null,
  });

  const { data: sendRow } = await admin
    .from("email_sends")
    .insert({
      organization_id: input.organizationId,
      client_id: input.clientId,
      assessment_id: input.assessmentId,
      created_by: input.createdBy,
      to_email: client.email,
      subject,
      template_key: "assessment_report",
      send_type: "transactional",
      status: "pending",
    })
    .select("id")
    .single();

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: client.email,
      subject,
      html,
      replyTo,
    });

    if (error) {
      if (sendRow?.id) {
        await admin
          .from("email_sends")
          .update({ status: "failed", error_message: error.message })
          .eq("id", sendRow.id);
      }
      return { ok: false, error: error.message };
    }

    if (sendRow?.id) {
      await admin
        .from("email_sends")
        .update({ status: "sent", resend_id: data?.id ?? null })
        .eq("id", sendRow.id);
    }

    return { ok: true, resendId: data?.id ?? "" };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Send failed";
    if (sendRow?.id) {
      await admin
        .from("email_sends")
        .update({ status: "failed", error_message: message })
        .eq("id", sendRow.id);
    }
    return { ok: false, error: message };
  }
}
