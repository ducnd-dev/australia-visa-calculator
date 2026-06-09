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
import { calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { calculatorAnswersSchema } from "@/lib/visa-rules/gsm/calculator-schema";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const clientRow = assessment.clients as unknown as { display_name: string } | null;

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
        orgName={profile.organizations?.name}
        clientName={clientRow?.display_name}
        branded
        visaSubclass={assessment.visa_subclass}
        lastUpdated={LAST_UPDATED}
        className="print:border-0 print:shadow-none print:p-0"
      />

      <ResultsSummary result={result} suggestions={[]} gap={0} />

      <p className="mt-8 text-xs text-muted-foreground">
        Estimate only — not migration advice. Confirm via official Department of Home Affairs sources.
      </p>
    </div>
  );
}
