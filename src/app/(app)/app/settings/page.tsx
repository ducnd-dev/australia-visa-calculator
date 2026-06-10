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
import { FormFieldGroup, SimpleInputField, SimpleTextareaField } from "@/components/forms/simple-field";
import { FlashMessage } from "@/components/ui/flash-message";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { DEFAULT_AGENT_DISCLAIMER } from "@/lib/billing/agency-profile";
import { uploadOrgLogo } from "../billing/actions";
import { saveAiSettings } from "./ai-actions";
import { ResendDomainVerifier } from "@/components/settings/ResendDomainVerifier";
import { saveEmailSettings } from "./email-actions";
import { saveAgencyProfile } from "./profile-actions";
import { inviteMember, removeMember, revokeInvite } from "./team-actions";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    emailSaved?: string;
    aiSaved?: string;
    profileSaved?: string;
    teamInvited?: string;
    inviteRevoked?: string;
    memberRemoved?: string;
    error?: string;
  }>;
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
  let fromDomain = "";
  let fromDomainVerified = false;
  let maraNumber = "";
  let registeredBusinessName = "";
  let phone = "";
  let website = "";
  let disclaimerFooter = "";
  let shareLinkExpiryDays = "";
  let members: { id: string; full_name: string | null; role: string }[] = [];
  let pendingInvites: {
    id: string;
    email: string;
    role: string;
    expires_at: string;
  }[] = [];

  if (admin && profile) {
    const { data } = await admin
      .from("organizations")
      .select(
        "plan, logo_path, ai_enabled, preferred_model, mara_number, registered_business_name, phone, website, disclaimer_footer, share_link_expiry_days"
      )
      .eq("id", profile.organization_id)
      .single();
    logoPath = data?.logo_path ?? null;
    plan = data?.plan ?? plan;
    aiEnabled = data?.ai_enabled ?? true;
    preferredModel = data?.preferred_model ?? "gpt-4o-mini";
    maraNumber = data?.mara_number ?? "";
    registeredBusinessName = data?.registered_business_name ?? "";
    phone = data?.phone ?? "";
    website = data?.website ?? "";
    disclaimerFooter = data?.disclaimer_footer ?? "";
    shareLinkExpiryDays =
      data?.share_link_expiry_days != null ? String(data.share_link_expiry_days) : "";

    const supabase = await createClient();
    if (supabase) {
      const { data: emailRow } = await supabase
        .from("organization_email_settings")
        .select("from_name, reply_to, from_domain, from_domain_verified")
        .eq("organization_id", profile.organization_id)
        .maybeSingle();
      if (emailRow) {
        fromName = emailRow.from_name;
        replyTo = emailRow.reply_to ?? "";
        fromDomain = emailRow.from_domain ?? "";
        fromDomainVerified = emailRow.from_domain_verified ?? false;
      }
    }

    const { data: memberRows } = await admin
      .from("profiles")
      .select("id, full_name, role")
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: true });
    members = memberRows ?? [];

    if (profile.role === "admin") {
      const { data: invites } = await admin
        .from("organization_invites")
        .select("id, email, role, expires_at")
        .eq("organization_id", profile.organization_id)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });
      pendingInvites = invites ?? [];
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

      {params.error && (
        <FlashMessage variant="error">
          {decodeURIComponent(params.error)}
          {decodeURIComponent(params.error).toLowerCase().includes("r2") && (
            <span className="mt-2 block text-xs">
              Configure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and
              NEXT_PUBLIC_R2_PUBLIC_URL in your environment.
            </span>
          )}
        </FlashMessage>
      )}
      {params.saved === "1" && <FlashMessage variant="success">Logo saved.</FlashMessage>}
      {params.emailSaved === "1" && <FlashMessage variant="success">Email settings saved.</FlashMessage>}
      {params.aiSaved === "1" && <FlashMessage variant="success">AI settings saved.</FlashMessage>}
      {params.profileSaved === "1" && (
        <FlashMessage variant="success">Agency profile saved.</FlashMessage>
      )}
      {params.teamInvited === "1" && (
        <FlashMessage variant="success">Invitation sent.</FlashMessage>
      )}
      {params.inviteRevoked === "1" && (
        <FlashMessage variant="success">Invitation revoked.</FlashMessage>
      )}
      {params.memberRemoved === "1" && (
        <FlashMessage variant="success">Team member removed.</FlashMessage>
      )}

      <SectionCard title="Team" description="Workspace members and pending invitations.">
        <ul className="mb-6 space-y-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium text-foreground">{m.full_name ?? "Unnamed"}</span>
                {m.id === profile?.id ? (
                  <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {m.role}
                </Badge>
                {isAdmin && m.id !== profile?.id && (
                  <form action={removeMember}>
                    <input type="hidden" name="memberId" value={m.id} />
                    <Button type="submit" variant="ghost" size="sm" className="h-7 text-xs">
                      Remove
                    </Button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>

        {pendingInvites.length > 0 && (
          <div className="mb-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pending invites
            </p>
            <ul className="space-y-2">
              {pendingInvites.map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">
                    {inv.email} · <span className="capitalize">{inv.role}</span>
                  </span>
                  {isAdmin && (
                    <form action={revokeInvite}>
                      <input type="hidden" name="inviteId" value={inv.id} />
                      <Button type="submit" variant="ghost" size="sm" className="h-7 text-xs">
                        Revoke
                      </Button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isAdmin ? (
          <form action={inviteMember}>
            <FormFieldGroup>
              <SimpleInputField id="inviteEmail" name="email" type="email" label="Invite email" required />
              <Field>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <NativeSelect id="role" name="role" defaultValue="agent">
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </NativeSelect>
              </Field>
              <Button type="submit" variant="outline" size="sm">
                Send invitation
              </Button>
            </FormFieldGroup>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Only admins can invite team members.</p>
        )}
      </SectionCard>

      <SectionCard
        title="Agency profile"
        description="Shown on client share links, emails, and PDF exports."
      >
        {isAdmin ? (
          <form action={saveAgencyProfile}>
            <FormFieldGroup>
              <SimpleInputField
                id="maraNumber"
                name="maraNumber"
                label="MARN (Migration Agent Registration Number)"
                defaultValue={maraNumber}
                description="6–8 digits. Displayed on client-facing reports."
              />
              <SimpleInputField
                id="registeredBusinessName"
                name="registeredBusinessName"
                label="Registered business name"
                defaultValue={registeredBusinessName}
                description="Optional. Overrides agency name on reports."
              />
              <SimpleInputField id="phone" name="phone" label="Phone" defaultValue={phone} />
              <SimpleInputField id="website" name="website" label="Website" defaultValue={website} />
              <SimpleTextareaField
                id="disclaimerFooter"
                name="disclaimerFooter"
                label="Custom disclaimer footer"
                rows={4}
                defaultValue={disclaimerFooter}
                description={`Leave blank to use default with MARN. Default: ${DEFAULT_AGENT_DISCLAIMER.slice(0, 80)}…`}
              />
              <SimpleInputField
                id="shareLinkExpiryDays"
                name="shareLinkExpiryDays"
                type="number"
                label="Share link expiry (days)"
                defaultValue={shareLinkExpiryDays}
                className="w-28"
                description="Optional. New assessments expire after this many days. Leave empty for no expiry."
              />
              <Button type="submit" variant="outline" size="sm">
                Save agency profile
              </Button>
            </FormFieldGroup>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Only admins can edit agency profile.</p>
        )}
      </SectionCard>

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
              <SimpleInputField
                id="fromDomain"
                name="fromDomain"
                label="Custom sending domain (optional)"
                defaultValue={fromDomain}
                placeholder="agency.com.au"
              />
              <input type="hidden" name="fromDomainVerified" value={fromDomainVerified ? "on" : ""} />
              <Button type="submit" variant="outline" size="sm">
                Save email settings
              </Button>
            </FormFieldGroup>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Only admins can edit email settings.</p>
        )}
        {isAdmin && fromDomain ? (
          <div className="mt-4">
            <ResendDomainVerifier domain={fromDomain} currentlyVerified={fromDomainVerified} />
          </div>
        ) : isAdmin ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Save a custom domain above to check Resend DNS verification.
          </p>
        ) : null}
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
                    <FieldDescription>
                      PNG, JPEG, or WebP. Max 2MB. Requires Cloudflare R2 environment variables.
                    </FieldDescription>
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
