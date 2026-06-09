"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { runCampaign } from "@/lib/email/send-marketing";
import { parseSegmentFilter } from "@/lib/email/segments";

export async function createAgencyCampaign(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") {
    redirect(`/app/marketing?error=${encodeURIComponent("Only admins can create campaigns")}`);
  }

  const name = String(formData.get("name") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const bodyHtml = String(formData.get("bodyHtml") ?? "").trim();
  const segmentType = String(formData.get("segmentType") ?? "consented_clients");
  const threshold = Number(formData.get("threshold") ?? 65);

  if (!name || !subject || !bodyHtml) {
    redirect(`/app/marketing/campaigns/new?error=${encodeURIComponent("All fields required")}`);
  }

  const segment_filter =
    segmentType === "low_points"
      ? { type: "low_points", threshold }
      : segmentType === "all_clients_with_email"
        ? { type: "all_clients_with_email" }
        : { type: "consented_clients" };

  const supabase = await createClient();
  if (!supabase) redirect(`/app/marketing?error=${encodeURIComponent("Not configured")}`);

  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({
      scope: "organization",
      organization_id: profile.organization_id,
      created_by: profile.id,
      name,
      subject,
      body_html: bodyHtml,
      template_key: "client-follow-up",
      segment_filter: parseSegmentFilter(segment_filter),
      status: "draft",
    })
    .select("id")
    .single();

  if (error) redirect(`/app/marketing/campaigns/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/app/marketing");
  redirect(`/app/marketing/campaigns/${data.id}`);
}

export async function sendAgencyCampaign(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");

  const campaignId = String(formData.get("campaignId") ?? "");
  if (!campaignId) redirect("/app/marketing?error=Missing+campaign");

  const result = await runCampaign(campaignId);
  revalidatePath("/app/marketing");
  revalidatePath(`/app/marketing/campaigns/${campaignId}`);

  if (!result.ok) {
    redirect(`/app/marketing/campaigns/${campaignId}?error=${encodeURIComponent(result.error)}`);
  }

  redirect(
    `/app/marketing/campaigns/${campaignId}?sent=1&count=${result.sent}&failed=${result.failed}`
  );
}
