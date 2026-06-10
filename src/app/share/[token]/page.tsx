import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SharePasswordForm } from "@/components/share/SharePasswordForm";
import { shareUnlockCookieName } from "@/lib/share/share-password";
import { calculateAllPathways, calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { ResultsSummary } from "@/components/calculator/ResultsSummary";
import { ShareReportHeader } from "@/components/layout/ShareReportHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveDisclaimerFooter } from "@/lib/billing/agency-profile";
import { canUseBranding } from "@/lib/billing/plans";
import { orgLogoPublicUrl } from "@/lib/billing/org-logo-url";
import { isShareLinkActive } from "@/lib/billing/share-link";
import { calculatorAnswersSchema } from "@/lib/visa-rules/gsm/calculator-schema";
import { defaultTargetForVisa, suggestImprovements } from "@/lib/visa-rules/gsm/suggest-improvements";
import { buildMetadata } from "@/lib/seo";
import { LAST_UPDATED } from "@/lib/visa-rules/sources";

export const metadata = buildMetadata({
  title: "Points assessment summary",
  description: "Shared assessment results.",
  path: "/share",
  noIndex: true,
});

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();
  if (!admin) notFound();

  const { data } = await admin
    .from("assessments")
    .select(
      "answers, breakdown, total_points, visa_subclass, share_revoked_at, share_expires_at, share_password_hash, clients(display_name), organizations(name, plan, logo_path, mara_number, registered_business_name, phone, website, disclaimer_footer, show_ads)"
    )
    .eq("share_token", token)
    .single();

  if (!data) notFound();

  const shareStatus = isShareLinkActive(data);
  const passwordRequired = Boolean(data.share_password_hash);
  if (passwordRequired) {
    const jar = await cookies();
    const unlocked = jar.get(shareUnlockCookieName(token))?.value === "1";
    if (!unlocked) {
      return <SharePasswordForm token={token} />;
    }
  }

  if (!shareStatus.active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">Link unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{shareStatus.reason}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            Contact your migration agent for an updated assessment link.
          </p>
        </div>
      </div>
    );
  }

  const answers = calculatorAnswersSchema.parse(data.answers);
  const result = calculatePoints(answers);
  const allPathways = calculateAllPathways(answers);
  const { gap, suggestions } = suggestImprovements(
    answers,
    result,
    defaultTargetForVisa(result.visaSubclass)
  );

  const clientRow = data.clients as unknown as { display_name: string } | null;
  const orgRow = data.organizations as unknown as {
    name: string;
    plan: string;
    logo_path: string | null;
    mara_number: string | null;
    registered_business_name: string | null;
    phone: string | null;
    website: string | null;
    disclaimer_footer: string | null;
    show_ads: boolean;
  } | null;

  const clientName = clientRow?.display_name;
  const branded = canUseBranding(orgRow?.plan);
  const logoUrl = branded ? orgLogoPublicUrl(orgRow?.logo_path) : null;
  const disclaimerFooter = resolveDisclaimerFooter(orgRow?.disclaimer_footer, orgRow?.mara_number);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <ShareReportHeader
          orgName={orgRow?.name}
          logoUrl={logoUrl}
          clientName={clientName}
          branded={branded}
          visaSubclass={data.visa_subclass}
          lastUpdated={LAST_UPDATED}
          maraNumber={orgRow?.mara_number}
          registeredBusinessName={orgRow?.registered_business_name}
          phone={orgRow?.phone}
          website={orgRow?.website}
          disclaimerFooter={disclaimerFooter}
        />
        <h1 className="sr-only">Points assessment summary</h1>
        <ResultsSummary
          result={result}
          allPathways={allPathways}
          answers={answers}
          suggestions={suggestions}
          gap={gap}
          variant="agency"
          showAds={orgRow?.show_ads ?? true}
        />
      </div>
    </div>
  );
}
