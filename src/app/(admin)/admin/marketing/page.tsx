import Link from "next/link";
import { ArrowRight, Megaphone, Users } from "lucide-react";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { StatCard } from "@/components/layout/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminMarketingPage() {
  const admin = createAdminClient();
  const { data: campaigns } = admin
    ? await admin
        .from("email_campaigns")
        .select("id, name, status, sent_at, recipient_count")
        .eq("scope", "platform")
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const { count: subscribers } = admin
    ? await admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("platform_marketing_opt_in", true)
        .is("platform_unsubscribed_at", null)
    : { count: 0 };

  return (
    <div className="space-y-8">
      <AppPageHeader
        title="Platform marketing"
        description="Newsletters and product updates for opted-in migration agents."
      >
        <Button asChild>
          <Link href="/admin/marketing/new">New newsletter</Link>
        </Button>
      </AppPageHeader>

      <StatCard
        label="Subscribers"
        value={subscribers ?? 0}
        hint="Agents opted in to product emails"
        icon={Users}
        className="max-w-sm"
      />

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
          <CardTitle className="text-base">Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(campaigns ?? []).length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No platform campaigns yet"
              description="Create a newsletter to reach opted-in agents."
              className="m-4 border-0 bg-transparent"
            >
              <Button asChild>
                <Link href="/admin/marketing/new">New newsletter</Link>
              </Button>
            </EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {(campaigns ?? []).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/marketing/${c.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{c.name}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
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
