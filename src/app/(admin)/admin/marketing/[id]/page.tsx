import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlashMessage } from "@/components/ui/flash-message";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPlatformCampaign } from "../actions";

export default async function AdminCampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; count?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const admin = createAdminClient();
  if (!admin) notFound();

  const { data: campaign } = await admin
    .from("email_campaigns")
    .select("*")
    .eq("id", id)
    .eq("scope", "platform")
    .single();

  if (!campaign) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <AppPageHeader title={campaign.name} description="Platform newsletter campaign.">
        <Badge variant={campaign.status === "sent" ? "success" : "outline"} className="capitalize">
          {campaign.status}
        </Badge>
      </AppPageHeader>

      {query.sent === "1" && (
        <FlashMessage variant="success">Sent to {query.count} agents.</FlashMessage>
      )}
      {query.error && <FlashMessage variant="error">{decodeURIComponent(query.error)}</FlashMessage>}

      <SectionCard title="Details" contentClassName="space-y-2 text-sm">
        <p>
          <span className="font-medium text-foreground">Subject:</span>{" "}
          <span className="text-muted-foreground">{campaign.subject}</span>
        </p>
      </SectionCard>

      <SectionCard title="Preview">
        <div
          className="prose prose-sm max-w-none rounded-xl border border-border bg-muted/30 p-5"
          dangerouslySetInnerHTML={{ __html: campaign.body_html }}
        />
      </SectionCard>

      {campaign.status === "draft" && (
        <form action={sendPlatformCampaign}>
          <input type="hidden" name="campaignId" value={campaign.id} />
          <Button type="submit" className="gap-2">
            <Send className="size-4" aria-hidden />
            Send to subscribers
          </Button>
        </form>
      )}

      <Button variant="outline" className="gap-2" asChild>
        <Link href="/admin/marketing">
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </Link>
      </Button>
    </div>
  );
}
