import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ResendWebhookEvent = {
  type: string;
  data?: {
    email_id?: string;
    to?: string[];
  };
};

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (secret) {
    const signature = request.headers.get("svix-signature") ?? request.headers.get("resend-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
    // Production: verify with svix; MVP accepts configured secret header match
    const simple = request.headers.get("x-resend-webhook-secret");
    if (simple !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  let event: ResendWebhookEvent;
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const resendId = event.data?.email_id;
  if (!resendId) return NextResponse.json({ received: true });

  const { data: send } = await admin
    .from("email_sends")
    .select("id")
    .eq("resend_id", resendId)
    .maybeSingle();

  if (!send) return NextResponse.json({ received: true });

  const eventType =
    event.type === "email.opened"
      ? "opened"
      : event.type === "email.clicked"
        ? "clicked"
        : event.type === "email.delivered"
          ? "delivered"
          : event.type;

  await admin.from("email_events").insert({
    send_id: send.id,
    event_type: eventType,
    payload: event as unknown as Record<string, unknown>,
  });

  return NextResponse.json({ received: true });
}
