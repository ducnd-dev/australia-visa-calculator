import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendAssessmentReport } from "@/app/(app)/app/email/actions";

export function SendAssessmentForm({
  assessmentId,
  clientId,
  clientEmail,
  disabledReason,
}: {
  assessmentId: string;
  clientId: string;
  clientEmail: string | null;
  disabledReason?: string;
}) {
  if (!clientEmail) {
    return <span className="text-xs text-muted-foreground">Add client email to send</span>;
  }
  if (disabledReason) {
    return <span className="text-xs text-muted-foreground">{disabledReason}</span>;
  }

  return (
    <form action={sendAssessmentReport} className="inline">
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <input type="hidden" name="clientId" value={clientId} />
      <Button type="submit" variant="outline" size="sm" className="gap-1.5">
        <Mail className="size-3.5" aria-hidden />
        Email report
      </Button>
    </form>
  );
}
