import { createAdminClient } from "@/lib/supabase/admin";
import { getBillingPeriodDays } from "@/lib/billing/crypto-config";

export function computeBillingExpiresAt(
  currentExpiresAt: string | null | undefined,
  periodDays: number = getBillingPeriodDays()
): Date {
  const now = new Date();
  const current = currentExpiresAt ? new Date(currentExpiresAt) : null;
  const base = current && current > now ? current : now;
  const result = new Date(base);
  result.setUTCDate(result.getUTCDate() + periodDays);
  return result;
}

export async function activateOrgFromPayment(params: {
  organizationId: string;
  payerWallet: string;
  expiresAt: Date;
}): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("organizations")
    .update({
      billing_expires_at: params.expiresAt.toISOString(),
      billing_wallet: params.payerWallet,
      plan: "agency",
      show_ads: false,
    })
    .eq("id", params.organizationId);
}

export async function downgradeExpiredOrgs(): Promise<number> {
  const admin = createAdminClient();
  if (!admin) return 0;

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("organizations")
    .update({
      plan: "trial",
      show_ads: true,
    })
    .eq("plan", "agency")
    .lt("billing_expires_at", now)
    .select("id");

  if (error) return 0;
  return data?.length ?? 0;
}
