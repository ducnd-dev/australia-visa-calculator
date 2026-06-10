import Link from "next/link";
import { ExternalLink, FileText, Lock, RefreshCw, ShieldOff } from "lucide-react";
import { regenerateShareLink, revokeShareLink } from "@/app/(app)/app/share-actions";
import { canExportPdf } from "@/lib/billing/plans";
import { isShareLinkActive } from "@/lib/billing/share-link";
import { SendAssessmentForm } from "@/components/email/SendAssessmentForm";
import { Button } from "@/components/ui/button";

export function AssessmentActions({
  assessmentId,
  clientId,
  shareToken,
  plan,
  clientEmail,
  clientUnsubscribed,
  shareRevokedAt,
  shareExpiresAt,
}: {
  assessmentId: string;
  clientId: string;
  shareToken: string;
  plan: string | null | undefined;
  clientEmail: string | null;
  clientUnsubscribed: boolean;
  shareRevokedAt?: string | null;
  shareExpiresAt?: string | null;
}) {
  const shareActive = isShareLinkActive({
    share_revoked_at: shareRevokedAt,
    share_expires_at: shareExpiresAt,
  }).active;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {shareActive ? (
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <Link href={`/share/${shareToken}`} target="_blank">
            <ExternalLink className="size-3.5" aria-hidden />
            Share link
          </Link>
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground">Share link inactive</span>
      )}
      <form action={regenerateShareLink}>
        <input type="hidden" name="assessmentId" value={assessmentId} />
        <input type="hidden" name="clientId" value={clientId} />
        <Button type="submit" variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="size-3.5" aria-hidden />
          New link
        </Button>
      </form>
      {shareActive && (
        <form action={revokeShareLink}>
          <input type="hidden" name="assessmentId" value={assessmentId} />
          <input type="hidden" name="clientId" value={clientId} />
          <Button type="submit" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <ShieldOff className="size-3.5" aria-hidden />
            Revoke
          </Button>
        </form>
      )}
      {canExportPdf(plan) ? (
        <>
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <Link href={`/app/assessments/${assessmentId}/print`} target="_blank">
              <FileText className="size-3.5" aria-hidden />
              Print
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <a href={`/api/assessments/${assessmentId}/pdf`} download>
              <FileText className="size-3.5" aria-hidden />
              Download PDF
            </a>
          </Button>
        </>
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
