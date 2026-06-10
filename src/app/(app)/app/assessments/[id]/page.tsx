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
import { calculateAllPathways, calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { PointsBreakdownChart } from "@/components/calculator/PointsBreakdownChart";
import { PdfPreviewPanel } from "@/components/billing/PdfPreviewPanel";
import { AiDraftNotePanel } from "@/components/ai/AiDraftNotePanel";
import { SectionCard } from "@/components/layout/SectionCard";
import { calculatorAnswersSchema } from "@/lib/visa-rules/gsm/calculator-schema";
import { defaultTargetForVisa, suggestImprovements } from "@/lib/visa-rules/gsm/suggest-improvements";

export default async function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getSessionProfile();
  const supabase = await createClient();
  if (!supabase || !profile) notFound();

  const { data: assessment } = await supabase
    .from("assessments")
    .select(
      "id, client_id, answers, share_token, share_revoked_at, share_expires_at, share_password_hash, visa_subclass, agent_notes, created_at, created_by, profiles:created_by(full_name), clients(display_name, email, unsubscribed_at, anzsco_code, anzsco_title)"
    )
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!assessment) notFound();

  const answers = calculatorAnswersSchema.parse(assessment.answers);
  const result = calculatePoints(answers);
  const allPathways = calculateAllPathways(answers);
  const { gap, suggestions, targetPoints } = suggestImprovements(
    answers,
    result,
    defaultTargetForVisa(result.visaSubclass)
  );

  const clientRow = assessment.clients as unknown as {
    display_name: string;
    email: string | null;
    unsubscribed_at: string | null;
    anzsco_code: string | null;
    anzsco_title: string | null;
  } | null;
  const creator = assessment.profiles as unknown as { full_name: string | null } | null;
  const occupation =
    clientRow?.anzsco_code != null
      ? `ANZSCO ${clientRow.anzsco_code}${clientRow.anzsco_title ? ` — ${clientRow.anzsco_title}` : ""}`
      : null;

  return (
    <div className="max-w-3xl space-y-8">
      <AppPageHeader
        title="Assessment"
        description={[
          clientRow?.display_name ?? "Client",
          `Subclass ${result.visaSubclass}`,
          occupation,
          creator?.full_name,
        ]
          .filter(Boolean)
          .join(" · ")}
      >
        <AssessmentActions
          assessmentId={id}
          clientId={assessment.client_id}
          shareToken={assessment.share_token}
          plan={profile.organizations?.plan}
          clientEmail={clientRow?.email ?? null}
          clientName={clientRow?.display_name}
          totalPoints={result.total}
          visaSubclass={result.visaSubclass}
          gap={gap}
          suggestions={suggestions.map((s) => ({ label: s.label, delta: s.delta }))}
          clientUnsubscribed={!!clientRow?.unsubscribed_at}
          shareRevokedAt={assessment.share_revoked_at}
          shareExpiresAt={assessment.share_expires_at}
          hasSharePassword={Boolean(assessment.share_password_hash)}
        />
      </AppPageHeader>

      <div className="space-y-8">
        <SectionCard title="Points breakdown" description="Visual breakdown by Schedule 6D category.">
          <PointsBreakdownChart breakdown={result.breakdown} />
        </SectionCard>

        <PdfPreviewPanel
          assessmentId={id}
          plan={profile.organizations?.plan}
        />

        <AiDraftNotePanel
          assessmentId={id}
          initialNotes={assessment.agent_notes ?? ""}
          result={result}
          suggestions={suggestions}
          gap={gap}
          targetPoints={targetPoints}
        />

        <ResultsSummary
          result={result}
          allPathways={allPathways}
          answers={answers}
          suggestions={suggestions}
          gap={gap}
          variant="agency"
        />
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
