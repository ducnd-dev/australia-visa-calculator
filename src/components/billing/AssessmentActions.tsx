import Link from "next/link";
import { ExternalLink, FileText, Lock } from "lucide-react";
import { canExportPdf } from "@/lib/billing/plans";
import { SendAssessmentForm } from "@/components/email/SendAssessmentForm";
import { Button } from "@/components/ui/button";

export function AssessmentActions({
  assessmentId,
  clientId,
  shareToken,
  plan,
  clientEmail,
  clientUnsubscribed,
}: {
  assessmentId: string;
  clientId: string;
  shareToken: string;
  plan: string | null | undefined;
  clientEmail: string | null;
  clientUnsubscribed: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" className="gap-1.5" asChild>
        <Link href={`/share/${shareToken}`} target="_blank">
          <ExternalLink className="size-3.5" aria-hidden />
          Share link
        </Link>
      </Button>
      {canExportPdf(plan) ? (
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <Link href={`/app/assessments/${assessmentId}/print`} target="_blank">
            <FileText className="size-3.5" aria-hidden />
            PDF
          </Link>
        </Button>
      ) : (
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" asChild>
          <Link href="/app/billing">
            <Lock className="size-3.5" aria-hidden />
            PDF (upgrade)
          </Link>
        </Button>
      )}
      <SendAssessmentForm
        assessmentId={assessmentId}
        clientId={clientId}
        clientEmail={clientEmail}
        disabledReason={clientUnsubscribed ? "Client unsubscribed" : undefined}
      />
    </div>
  );
}
