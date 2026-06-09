import Link from "next/link";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { FormFieldGroup, SimpleField, SimpleInputField, SimpleTextareaField } from "@/components/forms/simple-field";
import { Button } from "@/components/ui/button";
import { FlashMessage } from "@/components/ui/flash-message";
import { NativeSelect } from "@/components/ui/native-select";
import { createClient } from "@/lib/supabase/server";
import { createAgencyCampaign } from "../../actions";

const DEFAULT_BODY = `<p>Hi {{clientName}},</p>
<p>{{agencyName}} wanted to share a quick update on your migration points planning.</p>
<p>Reply to this email if you would like to book a follow-up.</p>
<p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
<p style="font-size:12px;color:#64748b">{{disclaimer}}</p>`;

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: template } = supabase
    ? await supabase
        .from("email_templates")
        .select("subject, body_html")
        .eq("slug", "client-follow-up")
        .eq("scope", "organization")
        .is("organization_id", null)
        .maybeSingle()
    : { data: null };

  return (
    <div className="max-w-2xl space-y-6">
      <AppPageHeader
        title="New campaign"
        description="Marketing emails require client consent. Use segments carefully for service notices."
      />

      {params.error && <FlashMessage variant="error">{decodeURIComponent(params.error)}</FlashMessage>}

      <SectionCard title="Campaign details">
        <form action={createAgencyCampaign}>
          <FormFieldGroup>
            <SimpleInputField id="name" name="name" label="Campaign name" required />
            <SimpleInputField
              id="subject"
              name="subject"
              label="Subject"
              required
              defaultValue={template?.subject ?? "Update from your migration agent"}
            />
            <SimpleField label="Audience" htmlFor="segmentType">
              <NativeSelect id="segmentType" name="segmentType" defaultValue="consented_clients">
                <option value="consented_clients">Clients with marketing consent</option>
                <option value="low_points">Consented clients with latest score below 65</option>
                <option value="all_clients_with_email">All clients with email (no unsubscribes)</option>
              </NativeSelect>
            </SimpleField>
            <SimpleInputField
              id="threshold"
              name="threshold"
              type="number"
              label="Low points threshold"
              defaultValue={65}
              className="w-24"
              description="Used for the low_points segment."
            />
            <SimpleTextareaField
              id="bodyHtml"
              name="bodyHtml"
              label="Body (HTML)"
              rows={10}
              required
              className="font-mono text-sm"
              defaultValue={template?.body_html ?? DEFAULT_BODY}
              description="Variables: {{clientName}}, {{agencyName}}, {{unsubscribeUrl}}, {{disclaimer}}"
            />
            <div className="flex gap-2 pt-2">
              <Button type="submit">Save draft</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/app/marketing">Cancel</Link>
              </Button>
            </div>
          </FormFieldGroup>
        </form>
      </SectionCard>
    </div>
  );
}
