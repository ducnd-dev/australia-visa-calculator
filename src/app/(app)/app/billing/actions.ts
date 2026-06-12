"use server";

import { redirect } from "next/navigation";
import { isR2Configured, uploadToR2 } from "@/lib/storage/r2";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth/session";
import { isAgencyPlan } from "@/lib/billing/plans";

async function getOrgBillingFields(organizationId: string) {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("organizations")
    .select("id, name, plan")
    .eq("id", organizationId)
    .single();
  return data;
}

function settingsErrorRedirect(message: string): never {
  redirect(`/app/settings?error=${encodeURIComponent(message)}`);
}

export async function uploadOrgLogo(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") settingsErrorRedirect("Only admins can upload a logo.");

  const org = await getOrgBillingFields(profile.organization_id);
  if (!isAgencyPlan(org?.plan)) {
    settingsErrorRedirect("Upgrade to Professional plan to upload a logo.");
  }

  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) settingsErrorRedirect("No file selected");
  if (file.size > 2 * 1024 * 1024) settingsErrorRedirect("Logo must be under 2MB");

  const allowed = ["image/png", "image/jpeg", "image/webp"];
  if (!allowed.includes(file.type)) settingsErrorRedirect("Use PNG, JPEG, or WebP");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${profile.organization_id}/logo.${ext}`;

  if (!isR2Configured()) {
    settingsErrorRedirect(
      "File storage is not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and NEXT_PUBLIC_R2_PUBLIC_URL."
    );
  }

  const admin = createAdminClient();
  if (!admin) settingsErrorRedirect("Not configured");

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    await uploadToR2({
      key: path,
      body: buffer,
      contentType: file.type,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    settingsErrorRedirect(message);
  }

  const { error: updateError } = await admin
    .from("organizations")
    .update({ logo_path: path })
    .eq("id", profile.organization_id);

  if (updateError) settingsErrorRedirect(updateError.message);

  redirect("/app/settings?saved=1");
}
