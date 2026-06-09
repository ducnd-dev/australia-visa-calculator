import Link from "next/link";
import { Users } from "lucide-react";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { ClientAvatar } from "@/components/layout/ClientAvatar";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";

export default async function ClientsPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  const { data: clients } =
    supabase && profile
      ? await supabase
          .from("clients")
          .select("id, display_name, email, internal_ref, updated_at")
          .eq("organization_id", profile.organization_id)
          .order("updated_at", { ascending: false })
      : { data: [] };

  const list = clients ?? [];

  return (
    <div className="space-y-8">
      <AppPageHeader
        title="Clients"
        description="Client profiles, assessment history, and email reports in one place."
      >
        <Button asChild>
          <Link href="/app/clients/new">Add client</Link>
        </Button>
      </AppPageHeader>

      {list.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Create a client profile before saving assessments or sending branded reports."
        >
          <Button asChild>
            <Link href="/app/clients/new">Add first client</Link>
          </Button>
        </EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((c) => (
            <li key={c.id}>
              <Link href={`/app/clients/${c.id}`} className="block h-full">
                <Card className="h-full border-border/80 p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <ClientAvatar name={c.display_name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{c.display_name}</p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {c.email ?? c.internal_ref ?? "No contact details"}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Updated {new Date(c.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
