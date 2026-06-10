import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";
import { canExportPdf } from "@/lib/billing/plans";
import { calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { calculatorAnswersSchema } from "@/lib/visa-rules/gsm/calculator-schema";
import { createAdminClient } from "@/lib/supabase/admin";

/** Server-side PDF export — minimal text PDF for agency plans. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profile = await getSessionProfile();
  const supabase = await createClient();
  if (!profile || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const orgPlan = admin
    ? (await admin.from("organizations").select("plan").eq("id", profile.organization_id).single()).data
        ?.plan
    : profile.organizations?.plan;

  if (!canExportPdf(orgPlan)) {
    return NextResponse.json({ error: "PDF export requires Agency plan" }, { status: 403 });
  }

  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, answers, total_points, visa_subclass, clients(display_name)")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!assessment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const answers = calculatorAnswersSchema.parse(assessment.answers);
  const result = calculatePoints(answers);
  const client = assessment.clients as unknown as { display_name: string } | null;
  const clientName = client?.display_name ?? "Client";

  const lines = [
    `Assessment — ${clientName}`,
    `Subclass ${result.visaSubclass} · ${result.total} points`,
    "",
    "Breakdown:",
    ...result.breakdown.map((b) => `  ${b.category}: ${b.points}`),
    "",
    "Estimate only — not migration advice.",
  ];

  const body = buildSimplePdf(lines.join("\n"));
  const filename = `assessment-${id.slice(0, 8)}.pdf`;

  return new NextResponse(Buffer.from(body), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

/** Minimal PDF 1.4 with Helvetica — no external deps. */
function buildSimplePdf(text: string): Uint8Array {
  const escaped = text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const content = `BT /F1 11 Tf 50 750 Td 14 TL (${escaped}) Tj ET`;
  const contentLen = content.length;

  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj",
    `4 0 obj<< /Length ${contentLen} >>stream\n${content}\nendstream endobj`,
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + "\n";
  }
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}
