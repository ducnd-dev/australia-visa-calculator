import Link from "next/link";
import { FormFieldGroup, SimpleInputField, SimpleTextareaField } from "@/components/forms/simple-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlashMessage } from "@/components/ui/flash-message";
import { createPlatformCampaign } from "../actions";

export default async function AdminNewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Platform newsletter</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sends to agents with platform marketing opt-in.</p>
      {params.error && (
        <FlashMessage variant="error">{decodeURIComponent(params.error)}</FlashMessage>
      )}
      <Card className="mt-6">
        <CardHeader><CardTitle>Campaign</CardTitle></CardHeader>
        <CardContent>
          <form action={createPlatformCampaign}>
            <FormFieldGroup>
              <SimpleInputField id="name" name="name" label="Name" required />
              <SimpleInputField id="subject" name="subject" label="Subject" required />
              <SimpleTextareaField
                id="bodyHtml"
                name="bodyHtml"
                label="Body (HTML)"
                rows={10}
                required
                className="font-mono"
                defaultValue={`<p>Hi {{agentName}},</p><p>{{body}}</p><p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>`}
              />
              <div className="flex gap-2">
                <Button type="submit">Save draft</Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/marketing">Cancel</Link>
                </Button>
              </div>
            </FormFieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
