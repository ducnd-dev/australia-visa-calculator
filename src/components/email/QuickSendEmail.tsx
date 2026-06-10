import { Mail } from "lucide-react";
import { sendQuickTemplateEmail } from "@/app/(app)/app/email/quick-send-actions";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";

const TEMPLATES = [
  { slug: "english-follow-up", label: "English improvement follow-up" },
  { slug: "check-in-reminder", label: "Six-month check-in" },
  { slug: "client-follow-up", label: "General follow-up" },
] as const;

export function QuickSendEmail({
  clientId,
  clientEmail,
  clientName,
}: {
  clientId: string;
  clientEmail: string;
  clientName: string;
}) {
  return (
    <form action={sendQuickTemplateEmail} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="clientEmail" value={clientEmail} />
      <input type="hidden" name="clientName" value={clientName} />
      <div className="min-w-[220px] flex-1">
        <label htmlFor="templateSlug" className="mb-1 block text-xs font-medium text-muted-foreground">
          Template
        </label>
        <NativeSelect id="templateSlug" name="templateSlug" defaultValue={TEMPLATES[0].slug}>
          {TEMPLATES.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <Button type="submit" variant="outline" size="sm" className="gap-1.5">
        <Mail className="size-3.5" aria-hidden />
        Send email
      </Button>
    </form>
  );
}
