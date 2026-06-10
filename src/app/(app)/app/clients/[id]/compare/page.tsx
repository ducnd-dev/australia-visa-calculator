import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";
import { calculatorAnswersSchema } from "@/lib/visa-rules/gsm/calculator-schema";
import { compareAssessments } from "@/lib/visa-rules/gsm/compare-assessments";
import { cn } from "@/lib/utils";

export default async function CompareAssessmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { id: clientId } = await params;
  const { a: idA, b: idB } = await searchParams;
  if (!idA || !idB) notFound();

  const profile = await getSessionProfile();
  const supabase = await createClient();
  if (!supabase || !profile) notFound();

  const { data: client } = await supabase
    .from("clients")
    .select("display_name")
    .eq("id", clientId)
    .eq("organization_id", profile.organization_id)
    .single();
  if (!client) notFound();

  const { data: rows } = await supabase
    .from("assessments")
    .select("id, answers, total_points, created_at")
    .eq("client_id", clientId)
    .in("id", [idA, idB]);

  const before = rows?.find((r) => r.id === idA);
  const after = rows?.find((r) => r.id === idB);
  if (!before || !after) notFound();

  const comparison = compareAssessments({
    beforeId: idA,
    afterId: idB,
    beforeAnswers: calculatorAnswersSchema.parse(before.answers),
    afterAnswers: calculatorAnswersSchema.parse(after.answers),
    beforeDate: before.created_at,
    afterDate: after.created_at,
  });

  return (
    <div className="max-w-3xl space-y-8">
      <AppPageHeader
        title="Compare assessments"
        description={`${client.display_name} · ${new Date(comparison.beforeDate).toLocaleDateString()} vs ${new Date(comparison.afterDate).toLocaleDateString()}`}
      />

      <SectionCard title="Points total">
        <div className="flex flex-wrap items-center gap-4 text-lg">
          <span className="font-semibold tabular-nums">{comparison.beforeTotal}</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-semibold tabular-nums text-primary">{comparison.afterTotal}</span>
          <Badge variant={comparison.totalDelta >= 0 ? "success" : "destructive"}>
            {comparison.totalDelta >= 0 ? "+" : ""}
            {comparison.totalDelta} pts
          </Badge>
        </div>
      </SectionCard>

      {comparison.answerChanges.length > 0 && (
        <SectionCard title="What changed">
          <ul className="space-y-3 text-sm">
            {comparison.answerChanges.map((c) => (
              <li key={c.field} className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
                <p className="font-medium text-foreground">{c.label}</p>
                <p className="text-muted-foreground">
                  {c.before} → {c.after}
                  {c.pointsDelta != null && (
                    <span
                      className={cn(
                        "ml-2 font-medium",
                        c.pointsDelta > 0 ? "text-emerald-600" : "text-destructive"
                      )}
                    >
                      ({c.pointsDelta > 0 ? "+" : ""}
                      {c.pointsDelta} pts)
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {comparison.breakdownChanges.length > 0 && (
        <SectionCard title="Breakdown delta">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 font-medium">Category</th>
                <th className="py-2 text-right font-medium">Before</th>
                <th className="py-2 text-right font-medium">After</th>
                <th className="py-2 text-right font-medium">Δ</th>
              </tr>
            </thead>
            <tbody>
              {comparison.breakdownChanges.map((row) => (
                <tr key={row.category} className="border-b border-border/60">
                  <td className="py-2">{row.category}</td>
                  <td className="py-2 text-right tabular-nums">{row.before}</td>
                  <td className="py-2 text-right tabular-nums">{row.after}</td>
                  <td
                    className={cn(
                      "py-2 text-right font-medium tabular-nums",
                      row.delta > 0 ? "text-emerald-600" : row.delta < 0 ? "text-destructive" : ""
                    )}
                  >
                    {row.delta > 0 ? "+" : ""}
                    {row.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}

      <Button variant="outline" className="gap-2" asChild>
        <Link href={`/app/clients/${clientId}`}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to client
        </Link>
      </Button>
    </div>
  );
}
