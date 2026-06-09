import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  downgradeOrg,
  setOrgPastDue,
  updateOrgFromSubscription,
} from "@/lib/billing/update-org-from-subscription";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";

async function markEventProcessed(eventId: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;
  const { error } = await admin.from("stripe_webhook_events").insert({ id: eventId });
  if (error?.code === "23505") return false;
  return !error;
}

function organizationIdFromMetadata(
  metadata: Stripe.Metadata | null | undefined
): string | null {
  return metadata?.organization_id ?? null;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const isNew = await markEventProcessed(event.id);
  if (!isNew) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = organizationIdFromMetadata(session.metadata);
      if (!orgId || !session.subscription) break;
      const subscription = await stripe.subscriptions.retrieve(
        typeof session.subscription === "string" ? session.subscription : session.subscription.id
      );
      await updateOrgFromSubscription(orgId, subscription);
      if (session.customer_email) {
        const admin = createAdminClient();
        await admin?.from("organizations").update({ billing_email: session.customer_email }).eq("id", orgId);
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = organizationIdFromMetadata(subscription.metadata);
      if (!orgId) break;
      if (subscription.status === "past_due" || subscription.status === "unpaid") {
        await setOrgPastDue(orgId, subscription.id);
      } else if (subscription.status === "canceled" || subscription.status === "incomplete_expired") {
        await downgradeOrg(orgId);
      } else {
        await updateOrgFromSubscription(orgId, subscription);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = organizationIdFromMetadata(subscription.metadata);
      if (orgId) await downgradeOrg(orgId);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subRef = invoice.parent?.subscription_details?.subscription;
      const subId = typeof subRef === "string" ? subRef : subRef?.id;
      if (!subId) break;
      const subscription = await stripe.subscriptions.retrieve(subId);
      const orgId = organizationIdFromMetadata(subscription.metadata);
      if (orgId) await setOrgPastDue(orgId, subscription.id);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
