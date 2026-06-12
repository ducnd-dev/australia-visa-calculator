import { base, baseSepolia } from "viem/chains";

/** USDC on Base mainnet (6 decimals). Override via BILLING_USDC_ADDRESS for testnets. */
export const DEFAULT_USDC_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

export const USDC_DECIMALS = 6;

export function getBillingChainId(): number {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_CHAIN_ID ?? process.env.BASE_CHAIN_ID;
  if (fromEnv) return Number(fromEnv);
  return base.id;
}

export function getUsdcAddress(): `0x${string}` | null {
  const override = process.env.BILLING_USDC_ADDRESS?.trim();
  if (override?.startsWith("0x")) return override as `0x${string}`;
  const chainId = getBillingChainId();
  if (chainId === baseSepolia.id) {
    // Circle test USDC on Base Sepolia
    return "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  }
  return DEFAULT_USDC_MAINNET;
}

export function getTreasuryWallet(): `0x${string}` | null {
  const wallet = process.env.BILLING_TREASURY_WALLET?.trim();
  if (!wallet?.startsWith("0x")) return null;
  return wallet as `0x${string}`;
}

export function getBaseRpcUrl(): string | null {
  return process.env.BASE_RPC_URL?.trim() || null;
}

export function getBillingUsdcAmount(): number {
  const raw = process.env.BILLING_USDC_AMOUNT ?? "32";
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 32;
}

export function getBillingPeriodDays(): number {
  const raw = process.env.BILLING_PERIOD_DAYS ?? "30";
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 30;
}

export function getBillingAmountUnits(): bigint {
  const amount = getBillingUsdcAmount();
  const [whole, frac = ""] = amount.toString().split(".");
  const padded = (frac + "0".repeat(USDC_DECIMALS)).slice(0, USDC_DECIMALS);
  return BigInt(whole + padded);
}

export function isCryptoBillingConfigured(): boolean {
  return Boolean(getTreasuryWallet() && getBaseRpcUrl() && getUsdcAddress());
}

export function getViemChain() {
  const chainId = getBillingChainId();
  if (chainId === baseSepolia.id) return baseSepolia;
  return base;
}
