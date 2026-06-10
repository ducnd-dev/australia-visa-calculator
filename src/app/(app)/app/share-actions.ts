"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { computeShareExpiresAt } from "@/lib/billing/share-link";
import { requireProfile } from "@/lib/auth/session";

async function getAssessmentForOrg(assessmentId: string, organizationId: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("assessments")
    .select("id, client_id, share_token")
    .eq("id", assessmentId)
    .eq("organization_id", organizationId)
    .single();
  return data;
}

export async function revokeShareLink(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");

  const assessmentId = String(formData.get("assessmentId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  const assessment = await getAssessmentForOrg(assessmentId, profile.organization_id);
  if (!assessment) redirect(`/app/clients/${clientId}?error=Assessment+not+found`);

  const admin = createAdminClient();
  if (!admin) redirect(`/app/clients/${clientId}?error=Not+configured`);

  const { error } = await admin
    .from("assessments")
    .update({ share_revoked_at: new Date().toISOString(), share_password_hash: null })
    .eq("id", assessmentId)
    .eq("organization_id", profile.organization_id);

  if (error) redirect(`/app/clients/${clientId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/app/clients/${clientId}`);
  revalidatePath(`/app/assessments/${assessmentId}`);
  redirect(`/app/clients/${clientId}?shareRevoked=1`);
}

export async function regenerateShareLink(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");

  const assessmentId = String(formData.get("assessmentId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  const assessment = await getAssessmentForOrg(assessmentId, profile.organization_id);
  if (!assessment) redirect(`/app/clients/${clientId}?error=Assessment+not+found`);

  const admin = createAdminClient();
  if (!admin) redirect(`/app/clients/${clientId}?error=Not+configured`);

  const { data: org } = await admin
    .from("organizations")
    .select("share_link_expiry_days")
    .eq("id", profile.organization_id)
    .single();

  const newToken = randomBytes(16).toString("hex");
  const shareExpiresAt = computeShareExpiresAt(org?.share_link_expiry_days ?? null);

  const { error } = await admin
    .from("assessments")
    .update({
      share_token: newToken,
      share_revoked_at: null,
      share_expires_at: shareExpiresAt,
      share_password_hash: null,
    })
    .eq("id", assessmentId)
    .eq("organization_id", profile.organization_id);

  if (error) redirect(`/app/clients/${clientId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/app/clients/${clientId}`);
  revalidatePath(`/app/assessments/${assessmentId}`);
  redirect(`/app/clients/${clientId}?shareRegenerated=1`);
}
