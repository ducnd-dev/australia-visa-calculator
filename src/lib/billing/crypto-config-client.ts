/** Client-safe billing config (NEXT_PUBLIC_* only). */

export const USDC_DECIMALS = 6;

export function getBillingChainId(): number {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_CHAIN_ID;
  if (fromEnv) return Number(fromEnv);
  return 8453;
}

export function getUsdcAddress(): `0x${string}` | null {
  const override = process.env.NEXT_PUBLIC_BILLING_USDC_ADDRESS?.trim();
  if (override?.startsWith("0x")) return override as `0x${string}`;
  const chainId = getBillingChainId();
  if (chainId === 84532) {
    return "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  }
  return "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
}

export function getTreasuryWallet(): `0x${string}` | null {
  const wallet = process.env.NEXT_PUBLIC_BILLING_TREASURY_WALLET?.trim();
  if (!wallet?.startsWith("0x")) return null;
  return wallet as `0x${string}`;
}

export function getBillingUsdcAmount(): number {
  const raw = process.env.NEXT_PUBLIC_BILLING_USDC_AMOUNT ?? "32";
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 32;
}

export function getBillingPeriodDays(): number {
  const raw = process.env.NEXT_PUBLIC_BILLING_PERIOD_DAYS ?? "30";
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 30;
}
