"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";

export async function dismissOnboarding(): Promise<void> {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  if (!profile || !supabase) return;

  await supabase.from("organization_onboarding").upsert({
    organization_id: profile.organization_id,
    dismissed_at: new Date().toISOString(),
  });

  revalidatePath("/app");
}

export async function seedGettingStartedClient(): Promise<{ error?: string; clientId?: string }> {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  if (!profile || !supabase) return { error: "Not configured" };

  const { count } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", profile.organization_id);

  if ((count ?? 0) > 0) return { error: "You already have clients" };

  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("organization_id", profile.organization_id)
    .eq("is_example", true)
    .maybeSingle();

  if (existing) return { clientId: existing.id };

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      organization_id: profile.organization_id,
      display_name: "Example — Nguyen T.",
      email: null,
      internal_ref: "EXAMPLE-001",
      notes: "Sample client for exploring the workspace. You can archive or delete this profile anytime.",
      anzsco_code: "261313",
      anzsco_title: "Software Engineer",
      status: "lead",
      is_example: true,
    })
    .select("id")
    .single();

  if (error || !client) return { error: error?.message ?? "Could not create example client" };

  revalidatePath("/app");
  revalidatePath("/app/clients");
  return { clientId: client.id };
}
