import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  if (!profile || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id, display_name, email, internal_ref, anzsco_code, anzsco_title, updated_at, archived_at")
    .eq("organization_id", profile.organization_id)
    .is("archived_at", null)
    .order("display_name", { ascending: true });

  const clientIds = (clients ?? []).map((c) => c.id);
  const latestByClient = new Map<string, { total_points: number; visa_subclass: string; created_at: string }>();

  if (clientIds.length > 0) {
    const { data: assessments } = await supabase
      .from("assessments")
      .select("client_id, total_points, visa_subclass, created_at")
      .in("client_id", clientIds)
      .order("created_at", { ascending: false });

    for (const a of assessments ?? []) {
      if (!latestByClient.has(a.client_id)) {
        latestByClient.set(a.client_id, {
          total_points: a.total_points,
          visa_subclass: a.visa_subclass,
          created_at: a.created_at,
        });
      }
    }
  }

  const header = [
    "display_name",
    "email",
    "internal_ref",
    "anzsco_code",
    "anzsco_title",
    "latest_points",
    "latest_subclass",
    "latest_assessment_at",
    "updated_at",
  ];

  const rows = (clients ?? []).map((c) => {
    const latest = latestByClient.get(c.id);
    return [
      c.display_name,
      c.email ?? "",
      c.internal_ref ?? "",
      c.anzsco_code ?? "",
      c.anzsco_title ?? "",
      latest ? String(latest.total_points) : "",
      latest?.visa_subclass ?? "",
      latest?.created_at ?? "",
      c.updated_at,
    ]
      .map(csvEscape)
      .join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");
  const filename = `clients-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
