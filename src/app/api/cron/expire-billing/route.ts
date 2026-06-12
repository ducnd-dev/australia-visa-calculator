import { NextResponse } from "next/server";
import { downgradeExpiredOrgs } from "@/lib/billing/activate-org-from-payment";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const downgraded = await downgradeExpiredOrgs();
  return NextResponse.json({ ok: true, downgraded });
}
