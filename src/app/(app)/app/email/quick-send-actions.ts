"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend } from "@/lib/email/resend";
import { renderTemplate } from "@/lib/email/render-template";
import { resolveDisclaimerFooter } from "@/lib/billing/agency-profile";
import { getSiteUrl } from "@/lib/site-url";

export async function sendQuickTemplateEmail(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");

  const clientId = String(formData.get("clientId") ?? "");
  const templateSlug = String(formData.get("templateSlug") ?? "client-follow-up");
  const clientName = String(formData.get("clientName") ?? "Client");

  const admin = createAdminClient();
  const resend = getResend();
  if (!admin || !resend) {
    redirect(`/app/clients/${clientId}?emailError=${encodeURIComponent("Email not configured")}`);
  }

  const { data: template } = await admin
    .from("email_templates")
    .select("subject, body_html, template_key")
    .eq("scope", "organization")
    .is("organization_id", null)
    .eq("slug", templateSlug)
    .maybeSingle();

  if (!template) {
    redirect(`/app/clients/${clientId}?emailError=${encodeURIComponent("Template not found")}`);
  }

  const { data: client } = await admin
    .from("clients")
    .select("email, unsubscribed_at")
    .eq("id", clientId)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!client?.email || client.unsubscribed_at) {
    redirect(`/app/clients/${clientId}?emailError=${encodeURIComponent("Client cannot receive email")}`);
  }

  const { data: org } = await admin
    .from("organizations")
    .select("name, disclaimer_footer")
    .eq("id", profile.organization_id)
    .single();

  const siteUrl = getSiteUrl();
  const vars = {
    clientName,
    agencyName: org?.name ?? "Your practice",
    disclaimer: resolveDisclaimerFooter(org?.disclaimer_footer),
    unsubscribeUrl: `${siteUrl}/unsubscribe/pending`,
  };

  const subject = renderTemplate(template.subject, vars);
  const html = renderTemplate(template.body_html, vars);

  const { data: emailSettings } = await admin
    .from("organization_email_settings")
    .select("from_name, reply_to")
    .eq("organization_id", profile.organization_id)
    .single();

  const send = await resend.emails.send({
    from: `${emailSettings?.from_name ?? org?.name ?? "Practice"} <onboarding@resend.dev>`,
    to: client.email,
    replyTo: emailSettings?.reply_to ?? undefined,
    subject,
    html,
  });

  await admin.from("email_sends").insert({
    organization_id: profile.organization_id,
    client_id: clientId,
    created_by: profile.id,
    to_email: client.email,
    subject,
    template_key: template.template_key,
    resend_id: send.data?.id ?? null,
    status: send.error ? "failed" : "sent",
    error_message: send.error?.message ?? null,
    send_type: "transactional",
  });

  revalidatePath(`/app/clients/${clientId}`);
  if (send.error) {
    redirect(`/app/clients/${clientId}?emailError=${encodeURIComponent(send.error.message)}`);
  }
  redirect(`/app/clients/${clientId}?emailSent=1`);
}
