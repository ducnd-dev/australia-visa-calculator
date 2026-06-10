import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ResultsSummary } from "@/components/calculator/ResultsSummary";
import { ShareReportHeader } from "@/components/layout/ShareReportHeader";
import { PrintTrigger } from "@/components/billing/PrintTrigger";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";
import { canExportPdf } from "@/lib/billing/plans";
import { calculateAllPathways, calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { calculatorAnswersSchema } from "@/lib/visa-rules/gsm/calculator-schema";
import { defaultTargetForVisa, suggestImprovements } from "@/lib/visa-rules/gsm/suggest-improvements";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveDisclaimerFooter } from "@/lib/billing/agency-profile";
import { orgLogoPublicUrl } from "@/lib/billing/org-logo-url";
import { LAST_UPDATED } from "@/lib/visa-rules/sources";

export default async function AssessmentPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const admin = createAdminClient();
  const orgPlan = admin
    ? (
        await admin
          .from("organizations")
          .select("plan")
          .eq("id", profile.organization_id)
          .single()
      ).data?.plan
    : profile.organizations?.plan;

  if (!canExportPdf(orgPlan)) {
    redirect("/app/billing");
  }

  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: assessment } = await supabase
    .from("assessments")
    .select("answers, breakdown, total_points, visa_subclass, clients(display_name)")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!assessment) notFound();

  const answers = calculatorAnswersSchema.parse(assessment.answers);
  const result = calculatePoints(answers);
  const allPathways = calculateAllPathways(answers);
  const { gap, suggestions } = suggestImprovements(
    answers,
    result,
    defaultTargetForVisa(result.visaSubclass)
  );
  const clientRow = assessment.clients as unknown as { display_name: string } | null;

  const { data: org } = admin
    ? await admin
        .from("organizations")
        .select(
          "name, logo_path, mara_number, registered_business_name, phone, website, disclaimer_footer"
        )
        .eq("id", profile.organization_id)
        .single()
    : { data: null };

  const logoUrl = orgLogoPublicUrl(org?.logo_path);
  const disclaimerFooter = resolveDisclaimerFooter(org?.disclaimer_footer, org?.mara_number);

  return (
    <div className="print-assessment mx-auto max-w-3xl px-4 py-6">
      <div className="no-print mb-6 flex items-center justify-between gap-4">
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href="/app/clients">
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Link>
        </Button>
        <PrintTrigger />
      </div>

      <ShareReportHeader
        orgName={org?.name ?? profile.organizations?.name}
        logoUrl={logoUrl}
        clientName={clientRow?.display_name}
        branded
        visaSubclass={assessment.visa_subclass}
        lastUpdated={LAST_UPDATED}
        maraNumber={org?.mara_number}
        registeredBusinessName={org?.registered_business_name}
        phone={org?.phone}
        website={org?.website}
        disclaimerFooter={disclaimerFooter}
        className="print:border-0 print:shadow-none print:p-0"
      />

      <ResultsSummary
        result={result}
        allPathways={allPathways}
        answers={answers}
        suggestions={suggestions}
        gap={gap}
        variant="agency"
      />

    </div>
  );
}
