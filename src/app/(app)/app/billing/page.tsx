import Link from "next/link";
import { Sparkles, Wallet } from "lucide-react";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { CryptoCheckout } from "@/components/billing/CryptoCheckout";
import { Web3Provider } from "@/components/billing/Web3Provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlashMessage } from "@/components/ui/flash-message";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/auth/session";
import { agencyPriceDisplay } from "@/lib/billing/display-price";
import { planLabel, isAgencyPlan } from "@/lib/billing/plans";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; error?: string }>;
}) {
  const profile = await getSessionProfile();
  const params = await searchParams;
  const admin = createAdminClient();

  let billingExpiresAt: string | null = null;
  let billingWallet: string | null = null;
  let paymentHistory: {
    tx_hash: string;
    amount_units: string;
    payer_wallet: string;
    confirmed_at: string;
  }[] = [];

  if (admin && profile) {
    const { data: org } = await admin
      .from("organizations")
      .select("plan, billing_expires_at, billing_wallet")
      .eq("id", profile.organization_id)
      .single();
    billingExpiresAt = org?.billing_expires_at ?? null;
    billingWallet = org?.billing_wallet ?? null;

    const { data: payments } = await admin
      .from("crypto_payments")
      .select("tx_hash, amount_units, payer_wallet, confirmed_at")
      .eq("organization_id", profile.organization_id)
      .order("confirmed_at", { ascending: false })
      .limit(5);
    paymentHistory = payments ?? [];
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
            ? "Pay with USDC on Base to unlock PDF export, branding, and higher limits."
            : "View your workspace plan. Contact your admin to upgrade or extend billing."
        }
      />

      {!isAdmin && (
        <FlashMessage variant="warning">
          You are signed in as an agent. Only workspace admins can pay or extend billing.
        </FlashMessage>
      )}

      {params.paid === "1" && (
        <FlashMessage variant="success">
          Payment confirmed. Professional features are now active.
        </FlashMessage>
      )}
      {params.error && <FlashMessage variant="error">{decodeURIComponent(params.error)}</FlashMessage>}

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

        {billingWallet && (
          <p className="text-xs">
            Last payment wallet: <code className="text-foreground">{billingWallet}</code>
          </p>
        )}

        {isAdmin ? (
          <div className="space-y-4 pt-2">
            <Web3Provider>
              <CryptoCheckout priceLabel={agencyPrice} billingExpiresAt={billingExpiresAt} />
            </Web3Provider>
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

      {paymentHistory.length > 0 && (
        <SectionCard
          title="Recent payments"
          description="On-chain USDC payments for this workspace."
          contentClassName="space-y-3 text-sm"
        >
          <ul className="space-y-2">
            {paymentHistory.map((p) => (
              <li key={p.tx_hash} className="rounded-md border border-border/60 px-3 py-2 text-muted-foreground">
                <div className="font-mono text-xs text-foreground break-all">{p.tx_hash}</div>
                <div className="mt-1 text-xs">
                  {(Number(p.amount_units) / 1_000_000).toFixed(2)} USDC ·{" "}
                  <time dateTime={p.confirmed_at}>{new Date(p.confirmed_at).toLocaleString()}</time>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

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

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Wallet className="size-3.5" aria-hidden />
        Payments settle on Base in USDC. This tool does not provide migration advice.
      </p>
    </div>
  );
}
