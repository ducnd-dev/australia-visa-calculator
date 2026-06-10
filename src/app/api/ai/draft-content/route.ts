import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDraftContent } from "@/lib/ai/draft-content";
import { toExplainContext } from "@/lib/ai/explain-assessment";
import { calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { calculatorAnswersSchema } from "@/lib/visa-rules/gsm/calculator-schema";
import { defaultTargetForVisa, suggestImprovements } from "@/lib/visa-rules/gsm/suggest-improvements";
import { RULES_VERSION } from "@/lib/visa-rules/sources";

export const runtime = "nodejs";

const bodySchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("agent-note"),
    assessmentId: z.string().uuid().optional(),
    result: z
      .object({
        total: z.number(),
        visaSubclass: z.enum(["189", "190", "491"]),
        tier: z.string(),
        tierMessage: z.string(),
        breakdown: z.array(
          z.object({
            category: z.string(),
            points: z.number(),
            note: z.string().optional(),
            citation: z.string().optional(),
          })
        ),
      })
      .optional(),
    suggestions: z
      .array(z.object({ label: z.string(), delta: z.number(), effort: z.string() }))
      .optional(),
    gap: z.number().optional(),
    targetPoints: z.number().optional(),
  }),
  z.object({
    mode: z.literal("email-intro"),
    clientName: z.string(),
    total: z.number(),
    visaSubclass: z.string(),
    gap: z.number(),
    suggestions: z.array(z.object({ label: z.string(), delta: z.number() })),
  }),
]);

export async function POST(request: Request) {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json({ error: "Sign in to use AI drafting." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (parsed.data.mode === "email-intro") {
    const result = await generateDraftContent({
      organizationId: profile.organization_id,
      profileId: profile.id,
      mode: "email-intro",
      emailIntro: parsed.data,
      rulesVersion: RULES_VERSION,
    });
    if (!result.ok) {
      const status = result.code === "rate_limited" ? 429 : result.code === "not_configured" ? 503 : 500;
      return NextResponse.json({ error: result.error, code: result.code }, { status });
    }
    return NextResponse.json({ text: result.text, model: result.model });
  }

  let context;
  if (parsed.data.assessmentId) {
    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });
    const { data } = await admin
      .from("assessments")
      .select("answers, organization_id")
      .eq("id", parsed.data.assessmentId)
      .eq("organization_id", profile.organization_id)
      .single();
    if (!data) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

    const answers = calculatorAnswersSchema.parse(data.answers);
    const result = calculatePoints(answers);
    const { gap, suggestions, targetPoints } = suggestImprovements(
      answers,
      result,
      defaultTargetForVisa(result.visaSubclass)
    );
    context = toExplainContext({
      result,
      suggestions: suggestions.map((s) => ({ label: s.label, delta: s.delta, effort: s.effort })),
      gap,
      targetPoints,
      rulesVersion: RULES_VERSION,
    });
  } else if (parsed.data.result) {
    context = toExplainContext({
      result: parsed.data.result,
      suggestions: parsed.data.suggestions ?? [],
      gap: parsed.data.gap ?? 0,
      targetPoints: parsed.data.targetPoints,
      rulesVersion: RULES_VERSION,
    });
  } else {
    return NextResponse.json({ error: "Missing assessment context" }, { status: 400 });
  }

  const result = await generateDraftContent({
    organizationId: profile.organization_id,
    profileId: profile.id,
    mode: "agent-note",
    explainContext: context,
    rulesVersion: RULES_VERSION,
  });

  if (!result.ok) {
    const status = result.code === "rate_limited" ? 429 : result.code === "not_configured" ? 503 : 500;
    return NextResponse.json({ error: result.error, code: result.code }, { status });
  }

  return NextResponse.json({
    text: result.text,
    model: result.model,
    disclaimer: "AI-generated draft — review before saving or sending.",
  });
}
