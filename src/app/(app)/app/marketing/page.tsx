import Link from "next/link";
import { ArrowRight, Mail, Megaphone, UserX } from "lucide-react";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { StatCard } from "@/components/layout/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlashMessage } from "@/components/ui/flash-message";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";
import { countMarketingSendsThisMonth } from "@/lib/email/send-marketing";
import { monthlyMarketingLimit } from "@/lib/email/plan-limits";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AgencyMarketingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await getSessionProfile();
  const params = await searchParams;
  const supabase = await createClient();
  const admin = createAdminClient();

  let plan = profile?.organizations?.plan ?? "trial";
  let campaigns: { id: string; name: string; status: string; sent_at: string | null; recipient_count: number }[] = [];
  let suppressions = 0;

  if (admin && profile) {
    const { data: org } = await admin.from("organizations").select("plan").eq("id", profile.organization_id).single();
    plan = org?.plan ?? plan;

    const { count } = await admin
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", profile.organization_id)
      .not("unsubscribed_at", "is", null);
    suppressions = count ?? 0;
  }

  if (supabase && profile) {
    const { data } = await supabase
      .from("email_campaigns")
      .select("id, name, status, sent_at, recipient_count")
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: false })
      .limit(10);
    campaigns = data ?? [];
  }

  const sentMonth = profile ? await countMarketingSendsThisMonth(profile.organization_id) : 0;
  const limit = monthlyMarketingLimit(plan);

  return (
    <div className="space-y-8">
      <AppPageHeader
        title="Marketing"
        description="Send email campaigns to clients who opted in. Assessment reports are sent separately."
      >
        <Button asChild>
          <Link href="/app/marketing/campaigns/new">New campaign</Link>
        </Button>
      </AppPageHeader>

      {params.error && <FlashMessage variant="error">{decodeURIComponent(params.error)}</FlashMessage>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Marketing sends (30d)"
          value={sentMonth}
          hint={`Limit: ${limit}/month (${plan})`}
          icon={Mail}
        />
        <StatCard
          label="Suppressions"
          value={suppressions}
          hint="Unsubscribed clients"
          icon={UserX}
        />
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactional</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Assessment reports from client detail do not count toward this limit.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-muted/20 pb-4">
          <CardTitle className="text-base">Recent campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No campaigns yet"
              description="Create your first email campaign to reach clients who opted in to updates."
              className="m-4 border-0 bg-transparent"
            >
              <Button asChild>
                <Link href="/app/marketing/campaigns/new">Create campaign</Link>
              </Button>
            </EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {campaigns.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/app/marketing/campaigns/${c.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{c.name}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {c.status}
                        </Badge>
                        {c.sent_at ? `${c.recipient_count} sent` : "Draft"}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
