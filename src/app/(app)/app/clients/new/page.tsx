import Link from "next/link";
import { createClientRecord } from "@/app/(app)/app/actions";
import { OccupationCombobox } from "@/components/clients/OccupationCombobox";
import { FormFieldGroup, SimpleInputField, SimpleTextareaField } from "@/components/forms/simple-field";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { FlashMessage } from "@/components/ui/flash-message";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

export default async function NewClientPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="max-w-lg space-y-6">
      <AppPageHeader
        title="Add client"
        description="Create a client profile to run assessments and send reports."
      />
      {error && <FlashMessage variant="error">{decodeURIComponent(error)}</FlashMessage>}
      <SectionCard title="Client details">
        <form action={createClientRecord}>
            <FormFieldGroup>
              <SimpleInputField id="displayName" name="displayName" label="Display name" required />
              <SimpleInputField id="email" name="email" type="email" label="Email" />
              <SimpleInputField id="internalRef" name="internalRef" label="Internal reference" />
              <SimpleTextareaField id="notes" name="notes" label="Notes" rows={3} />
              <OccupationCombobox />
              <Field orientation="horizontal" className="items-start">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  name="marketingConsent"
                  className="mt-0.5 size-4 shrink-0 rounded border border-input accent-primary"
                />
                <div className="flex flex-col gap-0.5">
                  <FieldLabel htmlFor="marketingConsent">Email updates</FieldLabel>
                  <FieldDescription>Client consents to receive email updates from your practice.</FieldDescription>
                </div>
              </Field>
              <div className="flex gap-2">
                <Button type="submit">Save client</Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/app/clients">Cancel</Link>
                </Button>
              </div>
            </FormFieldGroup>
        </form>
      </SectionCard>
    </div>
  );
}
