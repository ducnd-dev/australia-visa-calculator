import { createAdminClient } from "@/lib/supabase/admin";
import { getResend } from "@/lib/email/resend";
import {
  assessmentReportHtml,
  assessmentReportSubject,
} from "@/lib/email/templates/assessment-report";
import { getSiteUrl } from "@/lib/stripe/client";

const DISCLAIMER =
  "This is an estimate only and is not migration advice. Confirm scores via official Department of Home Affairs sources before lodging an EOI.";

export type SendAssessmentReportInput = {
  organizationId: string;
  assessmentId: string;
  clientId: string;
  createdBy: string;
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
    .select("id, total_points, visa_subclass, share_token, client_id, organization_id, clients(display_name, email, unsubscribed_at)")
    .eq("id", input.assessmentId)
    .eq("organization_id", input.organizationId)
    .single();

  if (assessmentError || !assessment) {
    return { ok: false, error: "Assessment not found" };
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
    .select("name")
    .eq("id", input.organizationId)
    .single();

  const { data: emailSettings } = await admin
    .from("organization_email_settings")
    .select("from_name, reply_to")
    .eq("organization_id", input.organizationId)
    .maybeSingle();

  const agencyName = emailSettings?.from_name ?? org?.name ?? "Your migration agent";
  const fromAddress =
    process.env.EMAIL_FROM_DEFAULT_AGENCY ??
    process.env.EMAIL_FROM_PLATFORM ??
    "onboarding@resend.dev";
  const replyTo = emailSettings?.reply_to || undefined;

  const shareUrl = `${getSiteUrl()}/share/${assessment.share_token}`;
  const subject = assessmentReportSubject(client.display_name, assessment.total_points);
  const html = assessmentReportHtml({
    agencyName,
    clientName: client.display_name,
    totalPoints: assessment.total_points,
    visaSubclass: assessment.visa_subclass,
    shareUrl,
    disclaimer: DISCLAIMER,
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
