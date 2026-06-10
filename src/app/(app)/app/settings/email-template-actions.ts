"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth/session";

export async function saveOrgEmailTemplate(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/app/settings?error=" + encodeURIComponent("Admin only"));
  }

  const slug = String(formData.get("slug") ?? "");
  const subject = String(formData.get("subject") ?? "").trim();
  const bodyHtml = String(formData.get("bodyHtml") ?? "").trim();
  if (!slug || !subject || !bodyHtml) {
    redirect("/app/settings?error=" + encodeURIComponent("Missing template fields"));
  }

  const admin = createAdminClient();
  if (!admin) redirect("/app/settings?error=Not+configured");

  const { data: defaultTpl } = await admin
    .from("email_templates")
    .select("name, template_key")
    .eq("scope", "organization")
    .is("organization_id", null)
    .eq("slug", slug)
    .maybeSingle();

  if (!defaultTpl) {
    redirect("/app/settings?error=" + encodeURIComponent("Unknown template"));
  }

  await admin.from("email_templates").upsert(
    {
      scope: "organization",
      organization_id: profile.organization_id,
      slug,
      name: defaultTpl.name,
      template_key: defaultTpl.template_key,
      subject,
      body_html: bodyHtml,
    },
    { onConflict: "scope,organization_id,slug" }
  );

  revalidatePath("/app/settings");
  redirect("/app/settings?templateSaved=1");
}

export async function resetOrgEmailTemplate(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/app/settings?error=" + encodeURIComponent("Admin only"));
  }

  const slug = String(formData.get("slug") ?? "");
  const admin = createAdminClient();
  if (!admin) redirect("/app/settings?error=Not+configured");

  await admin
    .from("email_templates")
    .delete()
    .eq("scope", "organization")
    .eq("organization_id", profile.organization_id)
    .eq("slug", slug);

  revalidatePath("/app/settings");
  redirect("/app/settings?templateSaved=1");
}

export async function saveWeeklyDigestSetting(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/app/settings?error=" + encodeURIComponent("Admin only"));
  }

  const enabled = formData.get("weeklyDigestEnabled") === "on";
  const admin = createAdminClient();
  if (!admin) redirect("/app/settings?error=Not+configured");

  await admin
    .from("organization_email_settings")
    .update({ weekly_digest_enabled: enabled })
    .eq("organization_id", profile.organization_id);

  revalidatePath("/app/settings");
  redirect("/app/settings?emailSaved=1");
}
