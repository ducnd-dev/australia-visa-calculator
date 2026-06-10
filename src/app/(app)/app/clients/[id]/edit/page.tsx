import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  archiveClient,
  deleteClient,
  restoreClient,
  updateClientRecord,
} from "@/app/(app)/app/actions";
import { ConfirmDeleteButton } from "@/components/clients/ConfirmDeleteButton";
import { OccupationCombobox } from "@/components/clients/OccupationCombobox";
import { FormFieldGroup, SimpleInputField, SimpleTextareaField } from "@/components/forms/simple-field";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { FlashMessage } from "@/components/ui/flash-message";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";

export default async function EditClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const profile = await getSessionProfile();
  const supabase = await createClient();
  if (!supabase || !profile) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single();
  if (!client) notFound();

  const update = updateClientRecord.bind(null, id);
  const archive = archiveClient.bind(null, id);
  const restore = restoreClient.bind(null, id);
  const remove = deleteClient.bind(null, id);
  const isAdmin = profile.role === "admin";
  const isArchived = !!client.archived_at;

  return (
    <div className="max-w-lg space-y-6">
      <AppPageHeader title="Edit client" description={client.display_name} />
      {error && <FlashMessage variant="error">{decodeURIComponent(error)}</FlashMessage>}
      <SectionCard title="Profile details" description="Update contact info and marketing consent.">
        <form action={update}>
            <FormFieldGroup>
              <SimpleInputField
                id="displayName"
                name="displayName"
                label="Display name"
                defaultValue={client.display_name}
                required
              />
              <SimpleInputField
                id="email"
                name="email"
                type="email"
                label="Email"
                defaultValue={client.email ?? ""}
              />
              <SimpleInputField
                id="internalRef"
                name="internalRef"
                label="Internal reference"
                defaultValue={client.internal_ref ?? ""}
              />
              <SimpleTextareaField
                id="notes"
                name="notes"
                label="Notes"
                rows={3}
                defaultValue={client.notes ?? ""}
              />
              <OccupationCombobox
                defaultCode={client.anzsco_code ?? ""}
                defaultTitle={client.anzsco_title ?? ""}
              />
              <Field orientation="horizontal" className="items-start">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  name="marketingConsent"
                  defaultChecked={!!client.marketing_consent_at}
                  className="mt-0.5 size-4 shrink-0 rounded border border-input accent-primary"
                />
                <div className="flex flex-col gap-0.5">
                  <FieldLabel htmlFor="marketingConsent">Email updates</FieldLabel>
                  <FieldDescription>Client consents to receive email updates from your agency.</FieldDescription>
                </div>
              </Field>
              <div className="flex gap-2">
                <Button type="submit">Save changes</Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/app/clients/${id}`}>Cancel</Link>
                </Button>
              </div>
            </FormFieldGroup>
        </form>
      </SectionCard>

      <SectionCard title="Archive or delete" description="Archived clients are hidden from active lists and marketing.">
        <div className="flex flex-wrap gap-2">
          {!isArchived ? (
            <form action={archive}>
              <Button type="submit" variant="outline" size="sm">
                Archive client
              </Button>
            </form>
          ) : (
            <form action={restore}>
              <Button type="submit" variant="outline" size="sm">
                Restore client
              </Button>
            </form>
          )}
          {isAdmin && <ConfirmDeleteButton action={remove} />}
        </div>
      </SectionCard>
    </div>
  );
}
