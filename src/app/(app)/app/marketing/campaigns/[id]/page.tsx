import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlashMessage } from "@/components/ui/flash-message";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";
import { sendAgencyCampaign } from "../../actions";

function statusVariant(status: string) {
  if (status === "sent") return "success" as const;
  if (status === "draft") return "outline" as const;
  return "secondary" as const;
}

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; count?: string; failed?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const profile = await getSessionProfile();
  const supabase = await createClient();
  if (!supabase || !profile) notFound();

  const { data: campaign } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!campaign) notFound();

  const canSend = campaign.status === "draft" && profile.role === "admin";

  return (
    <div className="max-w-2xl space-y-6">
      <AppPageHeader title={campaign.name} description="Review and send your email campaign.">
        <Badge variant={statusVariant(campaign.status)} className="capitalize">
          {campaign.status}
        </Badge>
      </AppPageHeader>

      {query.sent === "1" && (
        <FlashMessage variant="success">
          Sent to {query.count} recipients
          {query.failed && Number(query.failed) > 0 ? ` (${query.failed} failed)` : ""}.
        </FlashMessage>
      )}
      {query.error && <FlashMessage variant="error">{decodeURIComponent(query.error)}</FlashMessage>}

      <SectionCard title="Campaign details" contentClassName="space-y-3 text-sm">
        <p>
          <span className="font-medium text-foreground">Subject:</span>{" "}
          <span className="text-muted-foreground">{campaign.subject}</span>
        </p>
        <p>
          <span className="font-medium text-foreground">Audience:</span>{" "}
          <span className="text-muted-foreground">{JSON.stringify(campaign.segment_filter)}</span>
        </p>
        {campaign.sent_at && (
          <p>
            <span className="font-medium text-foreground">Sent:</span>{" "}
            <span className="text-muted-foreground">
              {campaign.recipient_count} recipients · {new Date(campaign.sent_at).toLocaleDateString()}
            </span>
          </p>
        )}
      </SectionCard>

      <SectionCard title="Email preview">
        <div
          className="prose prose-sm max-w-none rounded-xl border border-border bg-muted/30 p-5"
          dangerouslySetInnerHTML={{ __html: campaign.body_html }}
        />
      </SectionCard>

      {canSend && (
        <form action={sendAgencyCampaign}>
          <input type="hidden" name="campaignId" value={campaign.id} />
          <Button type="submit" className="gap-2">
            <Send className="size-4" aria-hidden />
            Send now
          </Button>
        </form>
      )}

      <Button variant="outline" className="gap-2" asChild>
        <Link href="/app/marketing">
          <ArrowLeft className="size-4" aria-hidden />
          Marketing
        </Link>
      </Button>
    </div>
  );
}
