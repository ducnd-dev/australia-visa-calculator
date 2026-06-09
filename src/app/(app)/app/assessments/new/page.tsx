import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Users } from "lucide-react";
import { AgencyCalculatorWizard } from "@/components/calculator/AgencyCalculatorWizard";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { ClientAvatar } from "@/components/layout/ClientAvatar";
import { EmptyState } from "@/components/layout/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewAssessmentPage({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
  const { clientId } = await searchParams;
  const profile = await getSessionProfile();
  const supabase = await createClient();
  if (!supabase || !profile) redirect("/login");

  if (!clientId) {
    const { data: clients } = await supabase
      .from("clients")
      .select("id, display_name")
      .eq("organization_id", profile.organization_id)
      .order("display_name");

    return (
      <div className="max-w-lg space-y-8">
        <AppPageHeader
          title="New assessment"
          description="Select a client to run a Schedule 6D points assessment."
        />

        {(clients ?? []).length === 0 ? (
          <EmptyState
            icon={Users}
            title="No clients yet"
            description="Add a client profile before running an assessment."
          >
            <Button asChild>
              <Link href="/app/clients/new">Add client</Link>
            </Button>
          </EmptyState>
        ) : (
          <Card className="border-border/80 shadow-sm">
            <CardContent className="divide-y divide-border p-0">
              {(clients ?? []).map((c) => (
                <Link
                  key={c.id}
                  href={`/app/assessments/new?clientId=${c.id}`}
                  className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  <ClientAvatar name={c.display_name} />
                  <span className="font-medium text-foreground">{c.display_name}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id, display_name, email")
    .eq("id", clientId)
    .eq("organization_id", profile.organization_id)
    .single();
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="New assessment"
        description={`Running for ${client.display_name}`}
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/assessments/new">Change client</Link>
        </Button>
      </AppPageHeader>

      <AgencyCalculatorWizard
        clientId={client.id}
        clientName={client.display_name}
        clientEmail={client.email}
      />
    </div>
  );
}
