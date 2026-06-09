import { getSessionProfile } from "@/lib/auth/session";

export async function requireSuperAdmin() {
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "super_admin") return null;
  return profile;
}
