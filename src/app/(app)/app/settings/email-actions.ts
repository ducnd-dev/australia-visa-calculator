"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import { checkResendDomain, type ResendDomainStatus } from "@/lib/email/resend-domains";

export async function saveEmailSettings(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") {
    redirect(`/app/settings?error=${encodeURIComponent("Only admins can update email settings")}`);
  }

  const fromName = String(formData.get("fromName") ?? "").trim();
  const replyTo = String(formData.get("replyTo") ?? "").trim();
  const fromDomain = String(formData.get("fromDomain") ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
  const fromDomainVerified = formData.get("fromDomainVerified") === "on";
  if (!fromName) {
    redirect(`/app/settings?error=${encodeURIComponent("From name is required")}`);
  }

  const supabase = await createClient();
  if (!supabase) redirect(`/app/settings?error=${encodeURIComponent("Not configured")}`);

  const { error } = await supabase.from("organization_email_settings").upsert({
    organization_id: profile.organization_id,
    from_name: fromName,
    reply_to: replyTo,
    from_domain: fromDomain || null,
    from_domain_verified: fromDomain ? fromDomainVerified : false,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect(`/app/settings?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/settings?emailSaved=1");
}

export async function verifyResendDomainAction(
  domain: string
): Promise<{ ok: true; status: ResendDomainStatus } | { ok: false; error: string }> {
  const profile = await requireProfile();
  if (!profile) return { ok: false, error: "Not signed in" };
  if (profile.role !== "admin") return { ok: false, error: "Only admins can verify domains" };

  try {
    const status = await checkResendDomain(domain);

    const supabase = await createClient();
    if (!supabase) return { ok: false, error: "Not configured" };

    const { error } = await supabase
      .from("organization_email_settings")
      .update({
        from_domain_verified: status.verified,
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", profile.organization_id)
      .eq("from_domain", status.domain);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/app/settings");
    return { ok: true, status };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Domain check failed";
    return { ok: false, error: message };
  }
}
