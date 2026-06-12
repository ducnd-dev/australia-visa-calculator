import {
  createPublicClient,
  decodeEventLog,
  http,
  parseAbiItem,
  type Hash,
  type Log,
} from "viem";
import {
  getBaseRpcUrl,
  getBillingAmountUnits,
  getBillingChainId,
  getTreasuryWallet,
  getUsdcAddress,
  getViemChain,
} from "@/lib/billing/crypto-config";

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);

export type VerifiedUsdcPayment = {
  txHash: Hash;
  chainId: number;
  tokenAddress: `0x${string}`;
  payerWallet: `0x${string}`;
  amountUnits: bigint;
};

export type VerifyPaymentError =
  | "not_configured"
  | "invalid_tx_hash"
  | "tx_not_found"
  | "tx_failed"
  | "no_transfer"
  | "wrong_recipient"
  | "underpaid"
  | "wrong_chain";

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

function findUsdcTransfer(
  logs: Log[],
  tokenAddress: `0x${string}`,
  treasury: `0x${string}`
): { from: `0x${string}`; amountUnits: bigint } | null {
  const token = normalizeAddress(tokenAddress);
  const treasuryNorm = normalizeAddress(treasury);

  for (const log of logs) {
    if (!log.address || normalizeAddress(log.address) !== token) continue;
    try {
      const { args } = decodeEventLog({
        abi: [transferEvent],
        data: log.data,
        topics: log.topics,
      });
      if (normalizeAddress(args.to) !== treasuryNorm) continue;
      return { from: args.from, amountUnits: args.value };
    } catch {
      continue;
    }
  }

  return null;
}

export async function verifyUsdcPayment(
  txHash: string
): Promise<{ ok: true; payment: VerifiedUsdcPayment } | { ok: false; error: VerifyPaymentError }> {
  const rpcUrl = getBaseRpcUrl();
  const treasury = getTreasuryWallet();
  const tokenAddress = getUsdcAddress();
  const requiredAmount = getBillingAmountUnits();

  if (!rpcUrl || !treasury || !tokenAddress) {
    return { ok: false, error: "not_configured" };
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    return { ok: false, error: "invalid_tx_hash" };
  }

  const client = createPublicClient({
    chain: getViemChain(),
    transport: http(rpcUrl),
  });

  let receipt;
  try {
    receipt = await client.getTransactionReceipt({ hash: txHash as Hash });
  } catch {
    return { ok: false, error: "tx_not_found" };
  }

  if (receipt.status !== "success") {
    return { ok: false, error: "tx_failed" };
  }

  const transfer = findUsdcTransfer(receipt.logs, tokenAddress, treasury);
  if (!transfer) {
    return { ok: false, error: "no_transfer" };
  }

  if (transfer.amountUnits < requiredAmount) {
    return { ok: false, error: "underpaid" };
  }

  return {
    ok: true,
    payment: {
      txHash: txHash as Hash,
      chainId: getBillingChainId(),
      tokenAddress,
      payerWallet: transfer.from,
      amountUnits: transfer.amountUnits,
    },
  };
}

/** Exported for unit tests */
export { transferEvent, findUsdcTransfer };
