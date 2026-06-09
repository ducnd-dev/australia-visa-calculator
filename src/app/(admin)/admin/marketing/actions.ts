"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { runCampaign } from "@/lib/email/send-marketing";

export async function createPlatformCampaign(formData: FormData): Promise<void> {
  const adminProfile = await requireSuperAdmin();
  if (!adminProfile) redirect("/app");

  const name = String(formData.get("name") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const bodyHtml = String(formData.get("bodyHtml") ?? "").trim();

  if (!name || !subject || !bodyHtml) {
    redirect(`/admin/marketing/new?error=${encodeURIComponent("All fields required")}`);
  }

  const admin = createAdminClient();
  if (!admin) redirect(`/admin/marketing?error=Not+configured`);

  const { data, error } = await admin
    .from("email_campaigns")
    .insert({
      scope: "platform",
      organization_id: null,
      created_by: adminProfile.id,
      name,
      subject,
      body_html: bodyHtml,
      template_key: "platform-newsletter",
      segment_filter: { type: "platform_agents" },
      status: "draft",
    })
    .select("id")
    .single();

  if (error) redirect(`/admin/marketing/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/marketing");
  redirect(`/admin/marketing/${data.id}`);
}

export async function sendPlatformCampaign(formData: FormData): Promise<void> {
  const adminProfile = await requireSuperAdmin();
  if (!adminProfile) redirect("/app");

  const campaignId = String(formData.get("campaignId") ?? "");
  const result = await runCampaign(campaignId);
  revalidatePath("/admin/marketing");

  if (!result.ok) {
    redirect(`/admin/marketing/${campaignId}?error=${encodeURIComponent(result.error)}`);
  }

  redirect(`/admin/marketing/${campaignId}?sent=1&count=${result.sent}`);
}
