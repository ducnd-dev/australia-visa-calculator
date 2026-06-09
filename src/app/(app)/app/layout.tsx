import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getSessionProfile } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  return <AppShell profile={profile}>{children}</AppShell>;
}
