"use server";

import { redirect } from "next/navigation";
import { isR2Configured, uploadToR2 } from "@/lib/storage/r2";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getSiteUrl } from "@/lib/stripe/client";
import { requireProfile } from "@/lib/auth/session";

async function getOrgBillingFields(organizationId: string) {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("organizations")
    .select("id, name, plan, stripe_customer_id, stripe_subscription_status")
    .eq("id", organizationId)
    .single();
  return data;
}

async function ensureStripeCustomer(
  organizationId: string,
  email: string,
  orgName: string
): Promise<string | null> {
  const stripe = getStripe();
  const admin = createAdminClient();
  if (!stripe || !admin) return null;

  const org = await getOrgBillingFields(organizationId);
  if (org?.stripe_customer_id) return org.stripe_customer_id;

  const customer = await stripe.customers.create({
    email,
    name: orgName,
    metadata: { organization_id: organizationId },
  });

  await admin
    .from("organizations")
    .update({ stripe_customer_id: customer.id, billing_email: email })
    .eq("id", organizationId);

  return customer.id;
}

function billingErrorRedirect(message: string): never {
  redirect(`/app/billing?error=${encodeURIComponent(message)}`);
}

export async function startCheckout(): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") billingErrorRedirect("Only workspace admins can manage billing.");

  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID_AGENCY_MONTHLY;
  if (!stripe || !priceId) {
    billingErrorRedirect("Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID_AGENCY_MONTHLY.");
  }

  const supabase = await createClient();
  if (!supabase) billingErrorRedirect("Supabase not configured");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) billingErrorRedirect("Signed-in user email required");

  const orgName = profile.organizations?.name ?? "Agency";
  const customerId = await ensureStripeCustomer(profile.organization_id, user.email, orgName);
  if (!customerId) billingErrorRedirect("Could not create Stripe customer");

  const siteUrl = getSiteUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { organization_id: profile.organization_id },
    subscription_data: {
      metadata: { organization_id: profile.organization_id },
    },
    success_url: `${siteUrl}/app/billing?subscribed=1`,
    cancel_url: `${siteUrl}/app/billing?canceled=1`,
  });

  if (!session.url) billingErrorRedirect("Checkout session failed");
  redirect(session.url);
}

export async function openBillingPortal(): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") billingErrorRedirect("Only workspace admins can manage billing.");

  const stripe = getStripe();
  if (!stripe) billingErrorRedirect("Stripe is not configured");

  const org = await getOrgBillingFields(profile.organization_id);
  if (!org?.stripe_customer_id) {
    billingErrorRedirect("No billing account yet. Subscribe to Agency first.");
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${getSiteUrl()}/app/billing`,
  });

  redirect(portal.url);
}

function settingsErrorRedirect(message: string): never {
  redirect(`/app/settings?error=${encodeURIComponent(message)}`);
}

export async function uploadOrgLogo(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") settingsErrorRedirect("Only admins can upload a logo.");

  const org = await getOrgBillingFields(profile.organization_id);
  if (org?.plan !== "agency" && org?.plan !== "enterprise") {
    settingsErrorRedirect("Upgrade to Agency plan to upload a logo.");
  }

  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) settingsErrorRedirect("No file selected");
  if (file.size > 2 * 1024 * 1024) settingsErrorRedirect("Logo must be under 2MB");

  const allowed = ["image/png", "image/jpeg", "image/webp"];
  if (!allowed.includes(file.type)) settingsErrorRedirect("Use PNG, JPEG, or WebP");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${profile.organization_id}/logo.${ext}`;

  if (!isR2Configured()) {
    settingsErrorRedirect(
      "File storage is not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and NEXT_PUBLIC_R2_PUBLIC_URL."
    );
  }

  const admin = createAdminClient();
  if (!admin) settingsErrorRedirect("Not configured");

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    await uploadToR2({
      key: path,
      body: buffer,
      contentType: file.type,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    settingsErrorRedirect(message);
  }

  const { error: updateError } = await admin
    .from("organizations")
    .update({ logo_path: path })
    .eq("id", profile.organization_id);

  if (updateError) settingsErrorRedirect(updateError.message);

  redirect("/app/settings?saved=1");
}
