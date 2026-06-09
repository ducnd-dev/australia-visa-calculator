"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth/session";

const ALLOWED_MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"] as const;

export async function saveAiSettings(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/app/settings?error=Only+admins+can+edit+AI+settings");

  const admin = createAdminClient();
  if (!admin) redirect("/app/settings?error=Server+not+configured");

  const aiEnabled = formData.get("aiEnabled") === "on";
  const preferredModel = String(formData.get("preferredModel") ?? "gpt-4o-mini");
  if (!ALLOWED_MODELS.includes(preferredModel as (typeof ALLOWED_MODELS)[number])) {
    redirect("/app/settings?error=Invalid+model");
  }

  const { error } = await admin
    .from("organizations")
    .update({ ai_enabled: aiEnabled, preferred_model: preferredModel })
    .eq("id", profile.organization_id);

  if (error) redirect(`/app/settings?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/app/settings");
  redirect("/app/settings?aiSaved=1");
}
