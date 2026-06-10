import Link from "next/link";
import { Users } from "lucide-react";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { ClientStatusBadge } from "@/components/clients/ClientStatusBadge";
import { ClientAvatar } from "@/components/layout/ClientAvatar";
import { EmptyState } from "@/components/layout/EmptyState";
import { CLIENT_STATUSES, parseClientStatus } from "@/lib/crm/client-status";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FlashMessage } from "@/components/ui/flash-message";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

function escapeIlike(q: string): string {
  return q.replace(/[%_\\]/g, "\\$&");
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    view?: string;
    sort?: string;
    status?: string;
    archived?: string;
    deleted?: string;
  }>;
}) {
  const profile = await getSessionProfile();
  const params = await searchParams;
  const supabase = await createClient();
  const viewArchived = params.view === "archived";
  const statusFilter = params.status?.trim();
  const sortByName = params.sort === "name";
  const q = params.q?.trim() ?? "";

  function withQuery(base: Record<string, string>) {
    const sp = new URLSearchParams(base);
    if (q) sp.set("q", q);
    if (sortByName) sp.set("sort", "name");
    if (statusFilter && CLIENT_STATUSES.includes(statusFilter as (typeof CLIENT_STATUSES)[number])) {
      sp.set("status", statusFilter);
    }
    const s = sp.toString();
    return s ? `?${s}` : "";
  }

  let query =
    supabase && profile
      ? supabase
          .from("clients")
          .select(
            "id, display_name, email, internal_ref, anzsco_code, anzsco_title, updated_at, status, is_example"
          )
          .eq("organization_id", profile.organization_id)
      : null;

  if (query) {
    if (viewArchived) {
      query = query.not("archived_at", "is", null);
    } else {
      query = query.is("archived_at", null);
      if (statusFilter && CLIENT_STATUSES.includes(statusFilter as (typeof CLIENT_STATUSES)[number])) {
        query = query.eq("status", statusFilter);
      }
    }
    if (q) {
      const pattern = `%${escapeIlike(q)}%`;
      query = query.or(
        `display_name.ilike.${pattern},email.ilike.${pattern},internal_ref.ilike.${pattern},anzsco_code.ilike.${pattern},anzsco_title.ilike.${pattern}`
      );
    }
    query = sortByName
      ? query.order("display_name", { ascending: true })
      : query.order("updated_at", { ascending: false });
  }

  const { data: clients } = query ? await query : { data: [] };
  const list = clients ?? [];

  return (
    <div className="space-y-8">
      <AppPageHeader
        title="Clients"
        description="Client profiles, assessment history, and email reports in one place."
      >
        <Button variant="outline" asChild>
          <a href="/api/clients/export">Export CSV</a>
        </Button>
        <Button asChild>
          <Link href="/app/clients/new">Add client</Link>
        </Button>
      </AppPageHeader>

      {params.archived === "1" && (
        <FlashMessage variant="success">Client archived.</FlashMessage>
      )}
      {params.deleted === "1" && (
        <FlashMessage variant="success">Client deleted.</FlashMessage>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form className="flex flex-1 gap-2" action="/app/clients" method="get">
          <input type="hidden" name="view" value={viewArchived ? "archived" : "active"} />
          {sortByName && <input type="hidden" name="sort" value="name" />}
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search name, email, ref, or ANZSCO…"
            className="max-w-md"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Button variant={!sortByName ? "default" : "outline"} size="sm" asChild>
            <Link href={`/app/clients${withQuery({ view: viewArchived ? "archived" : "active" })}`}>
              Recent
            </Link>
          </Button>
          <Button variant={sortByName ? "default" : "outline"} size="sm" asChild>
            <Link
              href={`/app/clients${withQuery({
                view: viewArchived ? "archived" : "active",
                sort: "name",
              })}`}
            >
              A–Z
            </Link>
          </Button>
          <Button variant={viewArchived ? "outline" : "default"} size="sm" asChild>
            <Link href={`/app/clients${withQuery({ view: "active", ...(sortByName ? { sort: "name" } : {}) })}`}>
              Active
            </Link>
          </Button>
          <Button variant={viewArchived ? "default" : "outline"} size="sm" asChild>
            <Link
              href={`/app/clients${withQuery({
                view: "archived",
                ...(sortByName ? { sort: "name" } : {}),
              })}`}
            >
              Archived
            </Link>
          </Button>
          {!viewArchived &&
            CLIENT_STATUSES.filter((s) => s !== "archived").map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link
                  href={`/app/clients${withQuery({
                    view: "active",
                    status,
                    ...(sortByName ? { sort: "name" } : {}),
                  })}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Link>
              </Button>
            ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Users}
          title={viewArchived ? "No archived clients" : "No clients yet"}
          description={
            viewArchived
              ? "Archived clients are hidden from the active list and marketing segments."
              : "Create a client profile before saving assessments or sending branded reports."
          }
        >
          {!viewArchived && (
            <Button asChild>
              <Link href="/app/clients/new">Add first client</Link>
            </Button>
          )}
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
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{c.display_name}</p>
                        {c.is_example ? (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                            Example
                          </span>
                        ) : (
                          <ClientStatusBadge status={parseClientStatus(c.status)} />
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {c.email ?? c.internal_ref ?? "No contact details"}
                      </p>
                      {c.anzsco_code && (
                        <p className={cn("mt-1 truncate text-xs text-muted-foreground")}>
                          ANZSCO {c.anzsco_code}
                          {c.anzsco_title ? ` · ${c.anzsco_title}` : ""}
                        </p>
                      )}
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
