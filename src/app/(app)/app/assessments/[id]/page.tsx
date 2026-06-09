import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AiExplainPanel } from "@/components/ai/AiExplainPanel";
import { ResultsSummary } from "@/components/calculator/ResultsSummary";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { Button } from "@/components/ui/button";
import { AssessmentActions } from "@/components/billing/AssessmentActions";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";
import { calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { calculatorAnswersSchema } from "@/lib/visa-rules/gsm/calculator-schema";
import { defaultTargetForVisa, suggestImprovements } from "@/lib/visa-rules/gsm/suggest-improvements";

export default async function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getSessionProfile();
  const supabase = await createClient();
  if (!supabase || !profile) notFound();

  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, client_id, answers, share_token, visa_subclass, clients(display_name, email, unsubscribed_at)")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!assessment) notFound();

  const answers = calculatorAnswersSchema.parse(assessment.answers);
  const result = calculatePoints(answers);
  const { gap, suggestions, targetPoints } = suggestImprovements(
    answers,
    result,
    defaultTargetForVisa(result.visaSubclass)
  );

  const clientRow = assessment.clients as unknown as {
    display_name: string;
    email: string | null;
    unsubscribed_at: string | null;
  } | null;

  return (
    <div className="max-w-3xl space-y-8">
      <AppPageHeader
        title="Assessment"
        description={`${clientRow?.display_name ?? "Client"} · Subclass ${result.visaSubclass}`}
      >
        <AssessmentActions
          assessmentId={id}
          clientId={assessment.client_id}
          shareToken={assessment.share_token}
          plan={profile.organizations?.plan}
          clientEmail={clientRow?.email ?? null}
          clientUnsubscribed={!!clientRow?.unsubscribed_at}
        />
      </AppPageHeader>

      <div className="space-y-8">
        <ResultsSummary result={result} suggestions={suggestions} gap={gap} />
        <AiExplainPanel
          result={result}
          suggestions={suggestions}
          gap={gap}
          targetPoints={targetPoints}
          assessmentId={id}
        />
      </div>

      <Button variant="outline" className="gap-2" asChild>
        <Link href="/app/clients">
          <ArrowLeft className="size-4" aria-hidden />
          Back to clients
        </Link>
      </Button>
    </div>
  );
}
