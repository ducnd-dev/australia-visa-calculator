import { createAdminClient } from "@/lib/supabase/admin";

export type SegmentFilter =
  | { type: "consented_clients" }
  | { type: "all_clients_with_email" }
  | { type: "low_points"; threshold?: number }
  | { type: "platform_agents" };

export type SegmentRecipient = {
  email: string;
  clientId?: string;
  profileId?: string;
  displayName: string;
};

export async function resolveSegment(
  filter: SegmentFilter,
  organizationId?: string
): Promise<SegmentRecipient[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  if (filter.type === "platform_agents") {
    const { data } = await admin
      .from("profiles")
      .select("id, full_name, platform_marketing_opt_in, platform_unsubscribed_at")
      .eq("platform_marketing_opt_in", true)
      .is("platform_unsubscribed_at", null);

    const emails: SegmentRecipient[] = [];
    for (const row of data ?? []) {
      const { data: user } = await admin.auth.admin.getUserById(row.id);
      const email = user?.user?.email;
      if (email) {
        emails.push({
          email,
          profileId: row.id,
          displayName: row.full_name ?? "Agent",
        });
      }
    }
    return emails;
  }

  if (!organizationId) return [];

  if (filter.type === "all_clients_with_email") {
    const { data } = await admin
      .from("clients")
      .select("id, display_name, email, unsubscribed_at")
      .eq("organization_id", organizationId)
      .not("email", "is", null)
      .is("unsubscribed_at", null);

    return (data ?? [])
      .filter((c) => c.email)
      .map((c) => ({
        email: c.email as string,
        clientId: c.id,
        displayName: c.display_name,
      }));
  }

  if (filter.type === "consented_clients") {
    const { data } = await admin
      .from("clients")
      .select("id, display_name, email, marketing_consent_at, unsubscribed_at")
      .eq("organization_id", organizationId)
      .not("email", "is", null)
      .not("marketing_consent_at", "is", null)
      .is("unsubscribed_at", null);

    return (data ?? [])
      .filter((c) => c.email)
      .map((c) => ({
        email: c.email as string,
        clientId: c.id,
        displayName: c.display_name,
      }));
  }

  if (filter.type === "low_points") {
    const threshold = filter.threshold ?? 65;
    const { data: clients } = await admin
      .from("clients")
      .select("id, display_name, email, marketing_consent_at, unsubscribed_at")
      .eq("organization_id", organizationId)
      .not("email", "is", null)
      .not("marketing_consent_at", "is", null)
      .is("unsubscribed_at", null);

    const recipients: SegmentRecipient[] = [];
    for (const client of clients ?? []) {
      if (!client.email) continue;
      const { data: latest } = await admin
        .from("assessments")
        .select("total_points")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latest && latest.total_points < threshold) {
        recipients.push({
          email: client.email,
          clientId: client.id,
          displayName: client.display_name,
        });
      }
    }
    return recipients;
  }

  return [];
}

export function parseSegmentFilter(raw: unknown): SegmentFilter {
  if (typeof raw === "object" && raw !== null && "type" in raw) {
    const t = (raw as { type: string }).type;
    if (t === "all_clients_with_email") return { type: "all_clients_with_email" };
    if (t === "low_points") {
      const threshold =
        "threshold" in raw && typeof (raw as { threshold: unknown }).threshold === "number"
          ? (raw as { threshold: number }).threshold
          : 65;
      return { type: "low_points", threshold };
    }
    if (t === "platform_agents") return { type: "platform_agents" };
  }
  return { type: "consented_clients" };
}
