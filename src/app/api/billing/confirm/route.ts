import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth/session";
import {
  activateOrgFromPayment,
  computeBillingExpiresAt,
} from "@/lib/billing/activate-org-from-payment";
import { getBillingPeriodDays } from "@/lib/billing/crypto-config";
import { verifyUsdcPayment } from "@/lib/billing/verify-usdc-payment";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ERROR_MESSAGES: Record<string, string> = {
  not_configured: "Crypto billing is not configured on the server.",
  invalid_tx_hash: "Invalid transaction hash.",
  tx_not_found: "Transaction not found or still pending. Wait for confirmation and try again.",
  tx_failed: "Transaction failed on-chain.",
  no_transfer: "No USDC transfer to the treasury wallet found in this transaction.",
  wrong_recipient: "Payment was not sent to the correct treasury address.",
  underpaid: "Payment amount is below the required USDC price.",
  wrong_chain: "Transaction is on the wrong network. Use Base.",
  already_used: "This transaction has already been used for billing.",
  db_error: "Could not record payment. Try again or contact support.",
};

export async function POST(request: Request) {
  const profile = await requireProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Only workspace admins can confirm billing payments." }, { status: 403 });
  }

  let body: { txHash?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const txHash = body.txHash?.trim();
  if (!txHash) {
    return NextResponse.json({ error: "txHash is required." }, { status: 400 });
  }

  const verified = await verifyUsdcPayment(txHash);
  if (!verified.ok) {
    return NextResponse.json(
      { error: ERROR_MESSAGES[verified.error] ?? "Payment verification failed." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: ERROR_MESSAGES.not_configured }, { status: 503 });
  }

  const { data: org } = await admin
    .from("organizations")
    .select("billing_expires_at")
    .eq("id", profile.organization_id)
    .single();

  const periodDays = getBillingPeriodDays();
  const expiresAt = computeBillingExpiresAt(org?.billing_expires_at, periodDays);
  const payment = verified.payment;

  const { error: insertError } = await admin.from("crypto_payments").insert({
    organization_id: profile.organization_id,
    tx_hash: payment.txHash,
    chain_id: payment.chainId,
    token_address: payment.tokenAddress,
    amount_units: payment.amountUnits.toString(),
    payer_wallet: payment.payerWallet,
    period_days: periodDays,
    created_by: profile.id,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: ERROR_MESSAGES.already_used }, { status: 409 });
    }
    return NextResponse.json({ error: ERROR_MESSAGES.db_error }, { status: 500 });
  }

  await activateOrgFromPayment({
    organizationId: profile.organization_id,
    payerWallet: payment.payerWallet,
    expiresAt,
  });

  return NextResponse.json({
    ok: true,
    plan: "agency",
    expiresAt: expiresAt.toISOString(),
    txHash: payment.txHash,
  });
}
