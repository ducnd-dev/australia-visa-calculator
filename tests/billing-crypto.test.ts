import { describe, expect, it } from "vitest";
import { computeBillingExpiresAt } from "@/lib/billing/activate-org-from-payment";
import { getBillingAmountUnits, USDC_DECIMALS } from "@/lib/billing/crypto-config";
import { findUsdcTransfer } from "@/lib/billing/verify-usdc-payment";
import type { Log } from "viem";
import { encodeAbiParameters, pad, parseAbiParameters } from "viem";

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" as const;

function makeTransferLog(params: {
  token: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
}): Log {
  const topics = [TRANSFER_TOPIC, pad(params.from), pad(params.to)] as [`0x${string}`, ...`0x${string}`[]];
  const data = encodeAbiParameters(parseAbiParameters("uint256"), [params.value]);
  return {
    address: params.token,
    blockHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    blockNumber: 1n,
    data,
    logIndex: 0,
    transactionHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    transactionIndex: 0,
    removed: false,
    topics,
  };
}

describe("computeBillingExpiresAt", () => {
  it("extends from now when no current expiry", () => {
    const result = computeBillingExpiresAt(null, 30);
    const expected = new Date();
    expected.setUTCDate(expected.getUTCDate() + 30);
    expect(Math.abs(result.getTime() - expected.getTime())).toBeLessThan(5000);
  });

  it("stacks on future expiry", () => {
    const future = new Date();
    future.setUTCDate(future.getUTCDate() + 10);
    const result = computeBillingExpiresAt(future.toISOString(), 30);
    const expected = new Date(future);
    expected.setUTCDate(expected.getUTCDate() + 30);
    expect(result.toISOString()).toBe(expected.toISOString());
  });
});

describe("getBillingAmountUnits", () => {
  it("uses 6 decimals for USDC", () => {
    process.env.BILLING_USDC_AMOUNT = "32";
    expect(USDC_DECIMALS).toBe(6);
    expect(getBillingAmountUnits()).toBe(32_000_000n);
  });
});

describe("findUsdcTransfer", () => {
  const token = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
  const treasury = "0x1111111111111111111111111111111111111111" as const;
  const payer = "0x2222222222222222222222222222222222222222" as const;

  it("finds transfer to treasury", () => {
    const log = makeTransferLog({
      token,
      from: payer,
      to: treasury,
      value: 32_000_000n,
    });
    const result = findUsdcTransfer([log], token, treasury);
    expect(result?.from).toBe(payer);
    expect(result?.amountUnits).toBe(32_000_000n);
  });

  it("ignores wrong recipient", () => {
    const other = "0x3333333333333333333333333333333333333333" as const;
    const log = makeTransferLog({
      token,
      from: payer,
      to: other,
      value: 32_000_000n,
    });
    expect(findUsdcTransfer([log], token, treasury)).toBeNull();
  });
});
