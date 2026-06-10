import { createAdminClient } from "@/lib/supabase/admin";
import { isAgencyPlan } from "@/lib/billing/plans";

export function monthlyAiLimit(plan: string | null | undefined): number {
  if (isAgencyPlan(plan)) return 500;
  return 10;
}

export async function countAiRequestsThisMonth(organizationId: string): Promise<number> {
  const admin = createAdminClient();
  if (!admin) return 0;

  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const { count } = await admin
    .from("ai_requests")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "ok")
    .gte("created_at", start.toISOString());

  return count ?? 0;
}

export async function canUseAi(
  organizationId: string,
  plan: string,
  aiEnabled: boolean
): Promise<{ allowed: boolean; reason?: string; used: number; limit: number }> {
  if (!aiEnabled) {
    return { allowed: false, reason: "AI is disabled for this workspace.", used: 0, limit: 0 };
  }
  if (!process.env.OPENAI_API_KEY) {
    return { allowed: false, reason: "AI is not configured on the server.", used: 0, limit: 0 };
  }

  const limit = monthlyAiLimit(plan);
  const used = await countAiRequestsThisMonth(organizationId);
  if (used >= limit) {
    return {
      allowed: false,
      reason: `Monthly AI limit reached (${limit}). Upgrade to Professional for more.`,
      used,
      limit,
    };
  }
  return { allowed: true, used, limit };
}
