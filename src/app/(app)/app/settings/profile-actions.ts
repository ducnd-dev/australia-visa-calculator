"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { agencyProfileSchema, normalizeWebsite } from "@/lib/billing/agency-profile";
import { requireProfile } from "@/lib/auth/session";

function settingsErrorRedirect(message: string): never {
  redirect(`/app/settings?error=${encodeURIComponent(message)}`);
}

export async function saveAgencyProfile(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") {
    settingsErrorRedirect("Only admins can update agency profile");
  }

  const expiryRaw = String(formData.get("shareLinkExpiryDays") ?? "").trim();
  const parsed = agencyProfileSchema.safeParse({
    maraNumber: String(formData.get("maraNumber") ?? "") || undefined,
    registeredBusinessName: String(formData.get("registeredBusinessName") ?? "") || undefined,
    phone: String(formData.get("phone") ?? "") || undefined,
    website: String(formData.get("website") ?? "") || undefined,
    disclaimerFooter: String(formData.get("disclaimerFooter") ?? "") || undefined,
    shareLinkExpiryDays: expiryRaw ? Number(expiryRaw) : null,
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid profile data";
    settingsErrorRedirect(msg);
  }

  const admin = createAdminClient();
  if (!admin) settingsErrorRedirect("Not configured");

  const { error } = await admin
    .from("organizations")
    .update({
      mara_number: parsed.data.maraNumber || null,
      registered_business_name: parsed.data.registeredBusinessName || null,
      phone: parsed.data.phone || null,
      website: normalizeWebsite(parsed.data.website),
      disclaimer_footer: parsed.data.disclaimerFooter || null,
      share_link_expiry_days: parsed.data.shareLinkExpiryDays ?? null,
    })
    .eq("id", profile.organization_id);

  if (error) settingsErrorRedirect(error.message);

  redirect("/app/settings?profileSaved=1");
}
