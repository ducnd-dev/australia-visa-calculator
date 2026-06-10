import Link from "next/link";
import { ArrowRight, ClipboardList, Sparkles, Users } from "lucide-react";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { StatCard } from "@/components/layout/StatCard";
import { TrialUpgradeBanner } from "@/components/billing/TrialUpgradeBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";
import { planLabel } from "@/lib/billing/plans";
import { countAiRequestsThisMonth } from "@/lib/ai/limits";
import { countMarketingSendsThisMonth } from "@/lib/email/send-marketing";
import { monthlyAiLimit } from "@/lib/ai/limits";
import { monthlyMarketingLimit } from "@/lib/email/plan-limits";
import { Mail, Sparkles as SparklesIcon } from "lucide-react";

export default async function DashboardPage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  let clientCount = 0;
  let assessmentCount = 0;
  let recentAssessments: {
    id: string;
    total_points: number;
    visa_subclass: string;
    created_at: string;
    client_id: string;
    clients: { display_name: string } | null;
    creator_name: string | null;
  }[] = [];

  if (supabase && profile) {
    const { count: cc } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", profile.organization_id);
    const { count: ac } = await supabase
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", profile.organization_id);
    clientCount = cc ?? 0;
    assessmentCount = ac ?? 0;

    const { data: recent } = await supabase
      .from("assessments")
      .select(
        "id, total_points, visa_subclass, created_at, client_id, clients(display_name), profiles:created_by(full_name)"
      )
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: false })
      .limit(5);
    recentAssessments = (recent ?? []).map((row) => {
      const client = row.clients;
      const resolved =
        client == null
          ? null
          : Array.isArray(client)
            ? (client[0] as { display_name: string } | undefined) ?? null
            : (client as { display_name: string });
      const creator = row.profiles as unknown as { full_name: string | null } | null;
      return {
        id: row.id as string,
        total_points: row.total_points as number,
        visa_subclass: row.visa_subclass as string,
        created_at: row.created_at as string,
        client_id: row.client_id as string,
        clients: resolved,
        creator_name: creator?.full_name ?? null,
      };
    });
  }

  const orgPlan = profile?.organizations?.plan ?? "trial";
  const plan = planLabel(orgPlan);
  const orgName = profile?.organizations?.name ?? "Workspace";
  const isEmpty = clientCount === 0;

  const aiUsed = profile ? await countAiRequestsThisMonth(profile.organization_id) : 0;
  const aiLimit = monthlyAiLimit(orgPlan);
  const marketingUsed = profile ? await countMarketingSendsThisMonth(profile.organization_id) : 0;
  const marketingLimit = monthlyMarketingLimit(orgPlan);

  return (
    <div className="space-y-8">
      <TrialUpgradeBanner plan={profile?.organizations?.plan} />

      <AppPageHeader
        title={`Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
        description={`${orgName} · ${plan} plan`}
      >
        <Button asChild>
          <Link href="/app/assessments/new">New assessment</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/app/clients/new">Add client</Link>
        </Button>
      </AppPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Clients" value={clientCount} hint="Active client profiles" icon={Users} />
        <StatCard
          label="Assessments"
          value={assessmentCount}
          hint="Saved Schedule 6D runs"
          icon={ClipboardList}
        />
        <StatCard
          label="Workspace"
          value={plan}
          hint="PDF & branding on Agency plan"
          icon={Sparkles}
          className="sm:col-span-2 lg:col-span-1"
        />
        <StatCard
          label="AI explanations"
          value={`${aiUsed}/${aiLimit}`}
          hint="Used this month"
          icon={SparklesIcon}
        />
        <StatCard
          label="Marketing sends"
          value={`${marketingUsed}/${marketingLimit}`}
          hint="Used this month"
          icon={Mail}
        />
      </div>

      {isEmpty ? (
        <EmptyState
          icon={Users}
          title="Set up your first client"
          description="Add a client profile, run a Schedule 6D assessment, and share a branded report — all from this dashboard."
        >
          <Button asChild>
            <Link href="/app/clients/new">Add client</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/calculator">Try public calculator</Link>
          </Button>
        </EmptyState>
      ) : (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-muted/20 pb-4">
            <CardTitle className="text-base">Recent assessments</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/app/clients">
                View clients
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentAssessments.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted-foreground">
                No assessments yet.{" "}
                <Link href="/app/assessments/new" className="font-medium text-primary hover:underline">
                  Run your first assessment
                </Link>
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {recentAssessments.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/app/assessments/${a.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {a.clients?.display_name ?? "Client"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Subclass {a.visa_subclass} · {new Date(a.created_at).toLocaleDateString()}
                          {a.creator_name ? ` · ${a.creator_name}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-lg font-semibold tabular-nums text-primary">
                        {a.total_points}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
