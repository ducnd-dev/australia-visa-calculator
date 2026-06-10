import Link from "next/link";
import { CreditCard, Sparkles } from "lucide-react";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlashMessage } from "@/components/ui/flash-message";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { agencyPriceDisplay } from "@/lib/billing/display-price";
import { planLabel, isAgencyPlan } from "@/lib/billing/plans";
import { openBillingPortal, startCheckout } from "./actions";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribed?: string; canceled?: string; error?: string }>;
}) {
  const profile = await getSessionProfile();
  const params = await searchParams;
  const admin = createAdminClient();

  let subscriptionStatus: string | null = null;
  if (admin && profile) {
    const { data } = await admin
      .from("organizations")
      .select("plan, stripe_subscription_status, stripe_customer_id")
      .eq("id", profile.organization_id)
      .single();
    subscriptionStatus = data?.stripe_subscription_status ?? null;
  }

  const plan = profile?.organizations?.plan ?? "trial";
  const isPaid = isAgencyPlan(plan);
  const isAdmin = profile?.role === "admin";
  const agencyPrice = agencyPriceDisplay();

  return (
    <div className="max-w-2xl space-y-8">
      <AppPageHeader
        title="Billing"
        description={
          isAdmin
            ? "Manage your Professional plan subscription, PDF export, and branded share links."
            : "View your workspace plan. Contact your admin to upgrade or change billing."
        }
      />

      {!isAdmin && (
        <FlashMessage variant="warning">
          You are signed in as an agent. Only workspace admins can upgrade or manage subscriptions.
        </FlashMessage>
      )}

      {params.subscribed === "1" && (
        <FlashMessage variant="success">
          Subscription active. PDF export and branded share links are now enabled.
        </FlashMessage>
      )}
      {params.error && <FlashMessage variant="error">{decodeURIComponent(params.error)}</FlashMessage>}
      {params.canceled === "1" && (
        <FlashMessage variant="warning">Checkout canceled. You can upgrade anytime.</FlashMessage>
      )}
      {subscriptionStatus === "past_due" && (
        <FlashMessage variant="error">
          Payment failed. Update your payment method in the billing portal.
        </FlashMessage>
      )}

      <SectionCard
        title="Current plan"
        description={isPaid ? "Your workspace includes practice branding features." : "Trial includes unlimited clients and assessments."}
        contentClassName="space-y-4 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <Badge variant={isPaid ? "success" : "default"}>{planLabel(plan)}</Badge>
          {isPaid && <Sparkles className="size-4 text-primary" aria-hidden />}
        </div>

        {isPaid ? (
          <ul className="list-inside list-disc space-y-1.5">
            <li>Branded client share links with your logo</li>
            <li>PDF export for assessments</li>
            <li>Branded practice workspace (no third-party promos)</li>
          </ul>
        ) : (
          <ul className="list-inside list-disc space-y-1.5">
            <li>Unlimited clients and assessments (trial)</li>
            <li>Generic share links</li>
            <li>
              Upgrade to Professional ({agencyPrice}) for PDF export and branded share links
            </li>
          </ul>
        )}

        {isAdmin ? (
          <div className="flex flex-wrap gap-3 pt-2">
            {!isPaid ? (
              <form action={startCheckout}>
                <Button type="submit" className="gap-2">
                  <CreditCard className="size-4" aria-hidden />
                  Upgrade to Professional — {agencyPrice}
                </Button>
              </form>
            ) : (
              <form action={openBillingPortal}>
                <Button type="submit" variant="outline" className="gap-2">
                  <CreditCard className="size-4" aria-hidden />
                  Manage subscription
                </Button>
              </form>
            )}
            {isPaid && (
              <Button variant="ghost" asChild>
                <Link href="/app/settings">Logo & settings</Link>
              </Button>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Contact your workspace admin to change billing.</p>
        )}
      </SectionCard>

      <SectionCard
        title="Enterprise"
        description="Multi-seat teams, custom domains, CSV export, and dedicated support."
        contentClassName="space-y-3 text-sm text-muted-foreground"
      >
        <p>
          Need more than the Professional plan — multiple offices, SSO, or volume pricing? Contact us for
          Enterprise onboarding.
        </p>
        <Button variant="outline" asChild>
          <Link href="/contact?subject=enterprise">Contact sales</Link>
        </Button>
      </SectionCard>

      <p className="text-xs text-muted-foreground">
        Payments are processed by Stripe. This tool does not provide migration advice.
      </p>
    </div>
  );
}
