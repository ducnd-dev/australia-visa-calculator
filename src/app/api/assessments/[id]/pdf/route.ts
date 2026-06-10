import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";
import { canExportPdf } from "@/lib/billing/plans";
import { calculateAllPathways, calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { calculatorAnswersSchema } from "@/lib/visa-rules/gsm/calculator-schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveDisclaimerFooter } from "@/lib/billing/agency-profile";
import { orgLogoPublicUrl } from "@/lib/billing/org-logo-url";
import { LAST_UPDATED } from "@/lib/visa-rules/sources";
import { renderAssessmentPdfBuffer } from "@/lib/pdf/assessment-report";

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
    return NextResponse.json({ error: "PDF export requires Professional plan" }, { status: 403 });
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
  const allPathways = calculateAllPathways(answers);
  const client = assessment.clients as unknown as { display_name: string } | null;

  const { data: org } = admin
    ? await admin
        .from("organizations")
        .select(
          "name, logo_path, mara_number, registered_business_name, phone, website, disclaimer_footer"
        )
        .eq("id", profile.organization_id)
        .single()
    : { data: null };

  const logoUrl = orgLogoPublicUrl(org?.logo_path);
  const disclaimerFooter = resolveDisclaimerFooter(org?.disclaimer_footer, org?.mara_number);

  let body: Buffer;
  try {
    body = await renderAssessmentPdfBuffer({
      clientName: client?.display_name ?? "Client",
      orgName: org?.name ?? profile.organizations?.name ?? "Practice",
      logoUrl,
      maraNumber: org?.mara_number ?? null,
      registeredBusinessName: org?.registered_business_name ?? null,
      phone: org?.phone ?? null,
      website: org?.website ?? null,
      disclaimerFooter,
      lastUpdated: LAST_UPDATED,
      result,
      allPathways,
    });
  } catch {
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }

  const filename = `assessment-${id.slice(0, 8)}.pdf`;

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
