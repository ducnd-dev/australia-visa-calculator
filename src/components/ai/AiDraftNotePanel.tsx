"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { updateAgentNotes } from "@/app/(app)/app/assessment-actions";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/layout/SectionCard";
import { Textarea } from "@/components/ui/textarea";
import type { PointsResult } from "@/lib/visa-rules/types";
import type { ImprovementSuggestion } from "@/lib/visa-rules/gsm/suggest-improvements";

export function AiDraftNotePanel({
  assessmentId,
  initialNotes,
  onNotesChange,
  result,
  suggestions,
  gap,
  targetPoints,
}: {
  assessmentId?: string;
  initialNotes?: string;
  onNotesChange?: (notes: string) => void;
  result: PointsResult;
  suggestions: ImprovementSuggestion[];
  gap: number;
  targetPoints?: number;
}) {
  const [notes, setNotes] = useState(initialNotes ?? "");

  function updateNotes(value: string) {
    setNotes(value);
    onNotesChange?.(value);
  }
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function onDraft() {
    setLoading(true);
    setError(null);
    try {
      const body = assessmentId
        ? { mode: "agent-note" as const, assessmentId }
        : {
            mode: "agent-note" as const,
            result: {
              total: result.total,
              visaSubclass: result.visaSubclass,
              tier: result.tier,
              tierMessage: result.tierMessage,
              breakdown: result.breakdown,
            },
            suggestions: suggestions.map((s) => ({
              label: s.label,
              delta: s.delta,
              effort: s.effort,
            })),
            gap,
            targetPoints,
          };

      const res = await fetch("/api/ai/draft-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      updateNotes(data.text ?? "");
    } catch {
      setError("Could not reach AI service.");
    } finally {
      setLoading(false);
    }
  }

  function onSave() {
    if (!assessmentId) return;
    startTransition(async () => {
      await updateAgentNotes(assessmentId, notes);
    });
  }

  return (
    <SectionCard
      title="Agent notes"
      description="Internal notes — not shown on client share link. AI can draft a starting point."
      contentClassName="space-y-4"
    >
      <Textarea
        value={notes}
        onChange={(e) => updateNotes(e.target.value)}
        rows={4}
        placeholder="Add internal notes for this assessment…"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onDraft} disabled={loading} className="gap-2">
          <Sparkles className="size-4" aria-hidden />
          {loading ? "Drafting…" : "Draft note with AI"}
        </Button>
        {assessmentId ? (
          <Button type="button" onClick={onSave} disabled={pending}>
            {pending ? "Saving…" : "Save notes"}
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </SectionCard>
  );
}
