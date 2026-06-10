import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { ClientAvatar } from "@/components/layout/ClientAvatar";
import { SectionCard } from "@/components/layout/SectionCard";
import { AssessmentActions } from "@/components/billing/AssessmentActions";
import { AssessmentComparePicker } from "@/components/clients/AssessmentComparePicker";
import { ClientStatusBadge } from "@/components/clients/ClientStatusBadge";
import { ClientTimeline, buildClientTimeline } from "@/components/clients/ClientTimeline";
import { StateNominationPanel } from "@/components/clients/StateNominationPanel";
import { QuickSendEmail } from "@/components/email/QuickSendEmail";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseClientStatus } from "@/lib/crm/client-status";
import { FlashMessage } from "@/components/ui/flash-message";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    emailSent?: string;
    emailError?: string;
    saved?: string;
    shareRevoked?: string;
    shareRegenerated?: string;
  }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const profile = await getSessionProfile();
  const supabase = await createClient();
  if (!supabase || !profile) notFound();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single();
  if (!client) notFound();

  const { data: assessments } = await supabase
    .from("assessments")
    .select(
      "id, total_points, visa_subclass, created_at, share_token, share_revoked_at, share_expires_at, share_password_hash, created_by, profiles:created_by(full_name)"
    )
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const { data: emailLog } = await supabase
    .from("email_sends")
    .select("id, subject, status, created_at, template_key")
    .eq("client_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8">
      <AppPageHeader
        title={client.display_name}
        description={client.email ?? client.internal_ref ?? undefined}
      >
        {client.is_example ? <Badge variant="secondary">Example</Badge> : null}
        {!client.is_example ? <ClientStatusBadge status={parseClientStatus(client.status)} /> : null}
        <Button variant="outline" asChild>
          <Link href={`/app/clients/${id}/edit`}>Edit</Link>
        </Button>
        <Button asChild>
          <Link href={`/app/assessments/new?clientId=${id}`}>New assessment</Link>
        </Button>
      </AppPageHeader>

      {query.saved === "1" && <FlashMessage variant="success">Client profile updated.</FlashMessage>}
      {query.emailSent === "1" && (
        <FlashMessage variant="success">Assessment report emailed to {client.email}.</FlashMessage>
      )}
      {query.emailError && <FlashMessage variant="error">{decodeURIComponent(query.emailError)}</FlashMessage>}
      {query.shareRevoked === "1" && (
        <FlashMessage variant="success">Share link revoked. Generate a new link to share again.</FlashMessage>
      )}
      {query.shareRegenerated === "1" && (
        <FlashMessage variant="success">New share link created.</FlashMessage>
      )}

      <div className="flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <ClientAvatar name={client.display_name} size="lg" />
        <div className="min-w-0 space-y-1 text-sm">
          {client.email && (
            <p>
              <span className="text-muted-foreground">Email · </span>
              <span className="text-foreground">{client.email}</span>
            </p>
          )}
          {client.internal_ref && (
            <p>
              <span className="text-muted-foreground">Reference · </span>
              <span className="text-foreground">{client.internal_ref}</span>
            </p>
          )}
          {client.anzsco_code && (
            <p>
              <span className="text-muted-foreground">Occupation · </span>
              <span className="text-foreground">
                ANZSCO {client.anzsco_code}
                {client.anzsco_title ? ` — ${client.anzsco_title}` : ""}
              </span>
            </p>
          )}
          {client.notes && (
            <p className="pt-2 leading-relaxed text-muted-foreground">{client.notes}</p>
          )}
        </div>
      </div>

      <StateNominationPanel
        anzscoCode={client.anzsco_code}
        anzscoTitle={client.anzsco_title}
        visaSubclass={
          assessments?.[0]?.visa_subclass === "190" || assessments?.[0]?.visa_subclass === "491"
            ? assessments[0].visa_subclass
            : null
        }
      />

      <SectionCard title="Activity timeline" description="Assessments, emails, and share events in chronological order.">
        <ClientTimeline
          events={buildClientTimeline({
            assessments: (assessments ?? []).map((a) => ({
              id: a.id,
              total_points: a.total_points,
              visa_subclass: a.visa_subclass,
              created_at: a.created_at,
              share_token: a.share_token,
              share_revoked_at: a.share_revoked_at,
              share_expires_at: a.share_expires_at,
            })),
            emails: (emailLog ?? []).map((e) => ({
              id: e.id,
              subject: e.subject,
              status: e.status,
              created_at: e.created_at,
            })),
          })}
        />
      </SectionCard>

      {client.email && !client.unsubscribed_at ? (
        <SectionCard title="Quick send" description="Send a follow-up using your practice email templates.">
          <QuickSendEmail clientId={id} clientEmail={client.email} clientName={client.display_name} />
        </SectionCard>
      ) : null}

      <SectionCard
        title="Assessment history"
        description="Saved Schedule 6D assessments for this client."
      >
        {(assessments ?? []).length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No assessments yet"
            description="Run a Schedule 6D assessment to save points and pathway scores to this client file."
          >
            <Button asChild>
              <Link href={`/app/assessments/new?clientId=${id}`}>Run assessment</Link>
            </Button>
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border/80">
            {(assessments ?? []).map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 first:rounded-t-xl last:rounded-b-xl"
              >
                <div>
                  <Link
                    href={`/app/assessments/${a.id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {a.total_points} points · Subclass {a.visa_subclass}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                    {(() => {
                      const creator = a.profiles as unknown as { full_name: string | null } | null;
                      return creator?.full_name ? ` · ${creator.full_name}` : "";
                    })()}
                  </p>
                </div>
                <AssessmentActions
                  assessmentId={a.id}
                  clientId={id}
                  shareToken={a.share_token}
                  plan={profile.organizations?.plan}
                  clientEmail={client.email}
                  clientName={client.display_name}
                  totalPoints={a.total_points}
                  visaSubclass={a.visa_subclass}
                  clientUnsubscribed={!!client.unsubscribed_at}
                  shareRevokedAt={a.share_revoked_at}
                  shareExpiresAt={a.share_expires_at}
                  hasSharePassword={Boolean(a.share_password_hash)}
                />
              </li>
            ))}
          </ul>
        )}
        {(assessments ?? []).length >= 2 && (
          <AssessmentComparePicker
            clientId={id}
            assessments={(assessments ?? []).map((a) => ({
              id: a.id,
              label: `${a.total_points} pts · ${new Date(a.created_at).toLocaleDateString()}`,
            }))}
          />
        )}
      </SectionCard>

      <SectionCard title="Email log" description="Transactional emails sent to this client.">
        {(emailLog ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No emails sent yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {(emailLog ?? []).map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2"
              >
                <span className="font-medium text-foreground">{e.subject}</span>
                <span className="text-xs text-muted-foreground">
                  {e.status} · {new Date(e.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <Button variant="outline" asChild>
        <Link href="/app/clients">← All clients</Link>
      </Button>
    </div>
  );
}
