import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { StaticPage } from "@/components/layout/StaticPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";
import {
  AGENCY_PLAN_FEATURES,
  PUBLIC_PLAN_FEATURES,
  TRIAL_PLAN_FEATURES,
} from "@/lib/static-content/plans";
import { cn } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Pricing for Migration Agents",
  description:
    "Free public calculator for applicants. Agency trial for client files; paid Agency plan for PDF, branding, and higher email and AI limits.",
  path: "/pricing",
  keywords: ["migration agent software pricing", "visa points calculator agency"],
});

function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3 text-sm">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  return (
    <StaticPage
      wide
      title="Pricing"
      description="Free for applicants. Agency trial to evaluate the workspace; paid plan when you need branding and PDF."
    >
      <div className="not-prose grid gap-6 lg:grid-cols-3">
        <Card className="border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardDescription>Applicants</CardDescription>
            <CardTitle className="text-2xl">Public</CardTitle>
            <p className="text-3xl font-bold tracking-tight text-foreground">Free</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <FeatureList items={PUBLIC_PLAN_FEATURES} />
            <Button variant="outline" className="w-full" asChild>
              <Link href="/calculator">Open calculator</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardDescription>Migration agents</CardDescription>
            <CardTitle className="text-2xl">Trial</CardTitle>
            <p className="text-3xl font-bold tracking-tight text-foreground">$0</p>
            <p className="text-sm text-muted-foreground">Full workspace to evaluate</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <FeatureList items={TRIAL_PLAN_FEATURES} />
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Start trial</Link>
            </Button>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "relative overflow-hidden border-primary/30 bg-gradient-to-b from-primary/10 via-card to-card shadow-lg",
            "ring-1 ring-primary/20"
          )}
        >
          <div className="absolute right-0 top-0 size-32 rounded-full bg-primary/20 blur-3xl" aria-hidden />
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
            <Sparkles className="size-3" aria-hidden />
            For practices
          </div>
          <CardHeader className="relative pt-10">
            <CardDescription>Migration agents</CardDescription>
            <CardTitle className="text-2xl">Agency</CardTitle>
            <p className="text-3xl font-bold tracking-tight text-foreground">Paid</p>
            <p className="text-sm text-muted-foreground">Billed monthly via Stripe</p>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <FeatureList items={AGENCY_PLAN_FEATURES} />
            <Button className="w-full shadow-md shadow-primary/20" asChild>
              <Link href="/login">Start trial → upgrade in app</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <h2>What is not included</h2>
      <p>
        No plan includes migration advice, lodgement services, or guaranteed invitation outcomes.
        The calculator estimates Schedule 6D points only. Enterprise arrangements (higher volume,
        custom domains) are not self-serve — contact us if you operate a large practice.
      </p>

      <h2>Billing</h2>
      <p>
        Agency subscriptions are processed by Stripe. Workspace admins can upgrade from{" "}
        <strong>Billing</strong> after sign-in and manage payment methods in the Stripe customer
        portal. Prices are shown at checkout in your local currency where supported. Cancel anytime;
        access to paid features ends at the end of the billing period unless otherwise required by
        law.
      </p>

      <p>
        Questions? See <Link href="/faq">FAQ</Link> or <Link href="/contact">contact</Link>.
      </p>
    </StaticPage>
  );
}
