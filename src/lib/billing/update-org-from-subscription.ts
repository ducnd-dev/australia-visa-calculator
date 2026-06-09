import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateOrgFromSubscription(
  organizationId: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const status = subscription.status;
  const active = status === "active" || status === "trialing";

  await admin
    .from("organizations")
    .update({
      stripe_subscription_id: subscription.id,
      stripe_subscription_status: status,
      plan: active ? "agency" : "trial",
      show_ads: !active,
    })
    .eq("id", organizationId);
}

export async function downgradeOrg(organizationId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("organizations")
    .update({
      stripe_subscription_id: null,
      stripe_subscription_status: "canceled",
      plan: "trial",
      show_ads: true,
    })
    .eq("id", organizationId);
}

export async function setOrgPastDue(organizationId: string, subscriptionId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("organizations")
    .update({
      stripe_subscription_id: subscriptionId,
      stripe_subscription_status: "past_due",
    })
    .eq("id", organizationId);
}
