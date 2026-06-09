import { notFound } from "next/navigation";
import { ResultsSummary } from "@/components/calculator/ResultsSummary";
import { ShareReportHeader } from "@/components/layout/ShareReportHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { canUseBranding } from "@/lib/billing/plans";
import { orgLogoPublicUrl } from "@/lib/billing/org-logo-url";
import { calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { calculatorAnswersSchema } from "@/lib/visa-rules/gsm/calculator-schema";
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
      "answers, breakdown, total_points, visa_subclass, clients(display_name), organizations(name, plan, logo_path)"
    )
    .eq("share_token", token)
    .single();

  if (!data) notFound();

  const answers = calculatorAnswersSchema.parse(data.answers);
  const result = calculatePoints(answers);
  const clientRow = data.clients as unknown as { display_name: string } | null;
  const orgRow = data.organizations as unknown as {
    name: string;
    plan: string;
    logo_path: string | null;
  } | null;

  const clientName = clientRow?.display_name;
  const branded = canUseBranding(orgRow?.plan);
  const logoUrl = branded ? orgLogoPublicUrl(orgRow?.logo_path) : null;

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
        />
        <h1 className="sr-only">Points assessment summary</h1>
        <ResultsSummary result={result} suggestions={[]} gap={0} />
        <p className="mt-8 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-center text-xs text-muted-foreground">
          Estimate only — not migration advice. Verify on official Home Affairs sources before lodging.
        </p>
      </div>
    </div>
  );
}
