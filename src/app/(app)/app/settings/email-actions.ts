"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";

export async function saveEmailSettings(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") {
    redirect(`/app/settings?error=${encodeURIComponent("Only admins can update email settings")}`);
  }

  const fromName = String(formData.get("fromName") ?? "").trim();
  const replyTo = String(formData.get("replyTo") ?? "").trim();
  if (!fromName) {
    redirect(`/app/settings?error=${encodeURIComponent("From name is required")}`);
  }

  const supabase = await createClient();
  if (!supabase) redirect(`/app/settings?error=${encodeURIComponent("Not configured")}`);

  const { error } = await supabase.from("organization_email_settings").upsert({
    organization_id: profile.organization_id,
    from_name: fromName,
    reply_to: replyTo,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect(`/app/settings?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/settings?emailSaved=1");
}
