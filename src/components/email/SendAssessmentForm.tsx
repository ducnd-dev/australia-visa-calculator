"use client";

import { useState } from "react";
import { Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendAssessmentReport } from "@/app/(app)/app/email/actions";

export function SendAssessmentForm({
  assessmentId,
  clientId,
  clientEmail,
  clientName,
  totalPoints,
  visaSubclass,
  gap,
  suggestions,
  disabledReason,
}: {
  assessmentId: string;
  clientId: string;
  clientEmail: string | null;
  clientName?: string;
  totalPoints?: number;
  visaSubclass?: string;
  gap?: number;
  suggestions?: { label: string; delta: number }[];
  disabledReason?: string;
}) {
  const [intro, setIntro] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!clientEmail) {
    return <span className="text-xs text-muted-foreground">Add client email to send</span>;
  }
  if (disabledReason) {
    return <span className="text-xs text-muted-foreground">{disabledReason}</span>;
  }

  async function onGenerateIntro() {
    if (!clientName || totalPoints == null || !visaSubclass) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/draft-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "email-intro",
          clientName,
          total: totalPoints,
          visaSubclass,
          gap: gap ?? 0,
          suggestions: suggestions ?? [],
        }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed");
        return;
      }
      setIntro(data.text ?? "");
    } catch {
      setError("Could not reach AI service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-w-[200px] flex-col gap-2">
      <Textarea
        value={intro}
        onChange={(e) => setIntro(e.target.value)}
        rows={2}
        placeholder="Optional personal intro (prepended to email)…"
        className="text-xs"
      />
      <div className="flex flex-wrap gap-2">
        {clientName && totalPoints != null ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1"
            disabled={loading}
            onClick={onGenerateIntro}
          >
            <Sparkles className="size-3.5" aria-hidden />
            {loading ? "…" : "Generate intro"}
          </Button>
        ) : null}
        <form action={sendAssessmentReport} className="inline">
          <input type="hidden" name="assessmentId" value={assessmentId} />
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="emailIntro" value={intro} />
          <Button type="submit" variant="outline" size="sm" className="gap-1.5">
            <Mail className="size-3.5" aria-hidden />
            Email report
          </Button>
        </form>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
