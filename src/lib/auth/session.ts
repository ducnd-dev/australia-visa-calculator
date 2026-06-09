import { createClient } from "@/lib/supabase/server";

export type UserProfile = {
  id: string;
  full_name: string | null;
  organization_id: string;
  role: string;
  organizations: { id: string; name: string; plan: string } | null;
};

export async function getSessionProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, organization_id, role, organizations(id, name, plan)")
    .eq("id", user.id)
    .single();
  if (!data) return null;
  const org = data.organizations as unknown as { id: string; name: string; plan: string } | null;
  return { id: data.id, full_name: data.full_name, organization_id: data.organization_id, role: data.role, organizations: org };
}

export async function requireProfile() {
  const profile = await getSessionProfile();
  if (!profile) return null;
  return profile;
}
