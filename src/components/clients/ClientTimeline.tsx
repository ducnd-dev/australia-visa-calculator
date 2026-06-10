import Link from "next/link";
import { ClipboardList, Link2, Mail, MailX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TimelineEvent = {
  id: string;
  at: string;
  kind: "assessment" | "email" | "share_created" | "share_revoked" | "share_expires";
  title: string;
  detail?: string;
  href?: string;
  status?: string;
};

function iconFor(kind: TimelineEvent["kind"]) {
  switch (kind) {
    case "assessment":
      return ClipboardList;
    case "email":
      return Mail;
    case "share_revoked":
      return MailX;
    default:
      return Link2;
  }
}

export function ClientTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ol className="relative space-y-0 border-l border-border/80 pl-6">
      {events.map((event, i) => {
        const Icon = iconFor(event.kind);
        return (
          <li key={event.id} className={cn("relative pb-6", i === events.length - 1 && "pb-0")}>
            <span className="absolute -left-[1.65rem] flex size-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
              <Icon className="size-3.5" aria-hidden />
            </span>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                {event.href ? (
                  <Link href={event.href} className="font-medium text-foreground hover:text-primary hover:underline">
                    {event.title}
                  </Link>
                ) : (
                  <p className="font-medium text-foreground">{event.title}</p>
                )}
                {event.detail ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">{event.detail}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
                <time dateTime={event.at}>{new Date(event.at).toLocaleString()}</time>
                {event.status ? <Badge variant="outline">{event.status}</Badge> : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function buildClientTimeline(input: {
  assessments: {
    id: string;
    total_points: number;
    visa_subclass: string;
    created_at: string;
    share_token: string | null;
    share_revoked_at: string | null;
    share_expires_at: string | null;
  }[];
  emails: {
    id: string;
    subject: string;
    status: string;
    created_at: string;
  }[];
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const a of input.assessments) {
    events.push({
      id: `assessment-${a.id}`,
      at: a.created_at,
      kind: "assessment",
      title: `Assessment saved — ${a.total_points} pts (Subclass ${a.visa_subclass})`,
      href: `/app/assessments/${a.id}`,
    });
    if (a.share_token && !a.share_revoked_at) {
      events.push({
        id: `share-${a.id}`,
        at: a.created_at,
        kind: "share_created",
        title: "Share link active",
        detail: a.share_expires_at
          ? `Expires ${new Date(a.share_expires_at).toLocaleDateString()}`
          : "No expiry set",
        href: `/app/assessments/${a.id}`,
      });
    }
    if (a.share_revoked_at) {
      events.push({
        id: `revoke-${a.id}`,
        at: a.share_revoked_at,
        kind: "share_revoked",
        title: "Share link revoked",
        href: `/app/assessments/${a.id}`,
      });
    }
  }

  for (const e of input.emails) {
    events.push({
      id: `email-${e.id}`,
      at: e.created_at,
      kind: "email",
      title: e.subject,
      status: e.status,
    });
  }

  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}
