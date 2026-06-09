import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";
import { canUseBranding } from "@/lib/billing/plans";
import { orgLogoPublicUrl } from "@/lib/billing/org-logo-url";
import { FormFieldGroup, SimpleInputField } from "@/components/forms/simple-field";
import { FlashMessage } from "@/components/ui/flash-message";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { uploadOrgLogo } from "../billing/actions";
import { saveAiSettings } from "./ai-actions";
import { saveEmailSettings } from "./email-actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; emailSaved?: string; aiSaved?: string; error?: string }>;
}) {
  const profile = await getSessionProfile();
  const params = await searchParams;
  const admin = createAdminClient();

  let logoPath: string | null = null;
  let plan = profile?.organizations?.plan ?? "trial";
  let aiEnabled = true;
  let preferredModel = "gpt-4o-mini";
  let fromName = profile?.organizations?.name ?? "";
  let replyTo = "";
  if (admin && profile) {
    const { data } = await admin
      .from("organizations")
      .select("plan, logo_path, ai_enabled, preferred_model")
      .eq("id", profile.organization_id)
      .single();
    logoPath = data?.logo_path ?? null;
    plan = data?.plan ?? plan;
    aiEnabled = data?.ai_enabled ?? true;
    preferredModel = data?.preferred_model ?? "gpt-4o-mini";

    const supabase = await createClient();
    if (supabase) {
      const { data: emailRow } = await supabase
        .from("organization_email_settings")
        .select("from_name, reply_to")
        .eq("organization_id", profile.organization_id)
        .maybeSingle();
      if (emailRow) {
        fromName = emailRow.from_name;
        replyTo = emailRow.reply_to ?? "";
      }
    }
  }

  const brandingAllowed = canUseBranding(plan);
  const logoUrl = orgLogoPublicUrl(logoPath);
  const isAdmin = profile?.role === "admin";

  return (
    <div className="max-w-xl space-y-8">
      <AppPageHeader
        title="Settings"
        description="Branding, email sender, and AI preferences for your workspace."
      />

      {params.error && <FlashMessage variant="error">{decodeURIComponent(params.error)}</FlashMessage>}
      {params.saved === "1" && <FlashMessage variant="success">Logo saved.</FlashMessage>}
      {params.emailSaved === "1" && <FlashMessage variant="success">Email settings saved.</FlashMessage>}
      {params.aiSaved === "1" && <FlashMessage variant="success">AI settings saved.</FlashMessage>}

      <SectionCard
        title="AI explanations"
        description="Plain-English breakdowns for clients. Points are never recalculated by AI."
      >
        {isAdmin ? (
          <form action={saveAiSettings}>
            <FormFieldGroup>
              <Field orientation="horizontal" className="items-start">
                <input
                  type="checkbox"
                  id="aiEnabled"
                  name="aiEnabled"
                  defaultChecked={aiEnabled}
                  className="mt-0.5 size-4 shrink-0 rounded border border-input accent-primary"
                />
                <div className="flex flex-col gap-0.5">
                  <FieldLabel htmlFor="aiEnabled">Enable AI explain</FieldLabel>
                  <FieldDescription>Available on assessment detail pages.</FieldDescription>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="preferredModel">Model</FieldLabel>
                <select
                  id="preferredModel"
                  name="preferredModel"
                  defaultValue={preferredModel}
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (recommended)</option>
                  <option value="gpt-4o">gpt-4o (higher quality)</option>
                  <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                  <option value="gpt-4.1">gpt-4.1</option>
                </select>
              </Field>
              <Button type="submit" variant="outline" size="sm">
                Save AI settings
              </Button>
            </FormFieldGroup>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Only admins can edit AI settings.</p>
        )}
      </SectionCard>

      <SectionCard title="Email sender" description="How assessment reports and campaigns appear to clients.">
        {isAdmin ? (
          <form action={saveEmailSettings}>
            <FormFieldGroup>
              <SimpleInputField id="fromName" name="fromName" label="From name" defaultValue={fromName} required />
              <SimpleInputField id="replyTo" name="replyTo" type="email" label="Reply-to email" defaultValue={replyTo} />
              <Button type="submit" variant="outline" size="sm">
                Save email settings
              </Button>
            </FormFieldGroup>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Only admins can edit email settings.</p>
        )}
      </SectionCard>

      <SectionCard title="Agency logo" description="Shown on branded share links and PDF exports.">
        {brandingAllowed ? (
          <>
            {logoUrl && (
              <div className="mb-4 flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                <Image
                  src={logoUrl}
                  alt="Agency logo"
                  width={120}
                  height={48}
                  className="h-12 w-auto object-contain"
                  unoptimized
                />
                <span className="text-sm text-muted-foreground">Current logo</span>
              </div>
            )}
            {isAdmin ? (
              <form action={uploadOrgLogo}>
                <FormFieldGroup>
                  <Field>
                    <FieldLabel htmlFor="logo">Logo file</FieldLabel>
                    <Input
                      id="logo"
                      type="file"
                      name="logo"
                      accept="image/png,image/jpeg,image/webp"
                      className="cursor-pointer file:mr-3"
                    />
                    <FieldDescription>PNG, JPEG, or WebP. Max 2MB.</FieldDescription>
                  </Field>
                  <Button type="submit">Upload logo</Button>
                </FormFieldGroup>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">Only admins can upload a logo.</p>
            )}
          </>
        ) : (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Logo branding is available on the Agency plan.</p>
            <Button asChild>
              <Link href="/app/billing">Upgrade to Agency</Link>
            </Button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
