import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { explainAssessment, toExplainContext } from "@/lib/ai/explain-assessment";
import { calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { calculatorAnswersSchema } from "@/lib/visa-rules/gsm/calculator-schema";
import { defaultTargetForVisa, suggestImprovements } from "@/lib/visa-rules/gsm/suggest-improvements";
import { RULES_VERSION } from "@/lib/visa-rules/sources";

export const runtime = "nodejs";

const bodySchema = z.union([
  z.object({ assessmentId: z.string().uuid() }),
  z.object({
    result: z.object({
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
    }),
    suggestions: z.array(
      z.object({ label: z.string(), delta: z.number(), effort: z.string() })
    ),
    gap: z.number(),
    targetPoints: z.number().optional(),
  }),
]);

export async function POST(request: Request) {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json({ error: "Sign in to use AI explain." }, { status: 401 });
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

  let context;
  if ("assessmentId" in parsed.data) {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }
    const { data } = await admin
      .from("assessments")
      .select("answers, organization_id, suggestions_json")
      .eq("id", parsed.data.assessmentId)
      .eq("organization_id", profile.organization_id)
      .single();

    if (!data) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

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
  } else {
    context = toExplainContext({
      result: parsed.data.result,
      suggestions: parsed.data.suggestions,
      gap: parsed.data.gap,
      targetPoints: parsed.data.targetPoints,
      rulesVersion: RULES_VERSION,
    });
  }

  const result = await explainAssessment({
    organizationId: profile.organization_id,
    profileId: profile.id,
    context,
  });

  if (!result.ok) {
    const status = result.code === "rate_limited" ? 429 : result.code === "not_configured" ? 503 : 500;
    return NextResponse.json({ error: result.error, code: result.code }, { status });
  }

  return NextResponse.json({
    explanation: result.text,
    model: result.model,
    disclaimer: "AI-generated summary only. Points are from the deterministic calculator — not legal advice.",
  });
}
