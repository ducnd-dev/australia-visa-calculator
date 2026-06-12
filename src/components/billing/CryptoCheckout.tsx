"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { erc20Abi, parseUnits } from "viem";
import { useAccount, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { FlashMessage } from "@/components/ui/flash-message";
import {
  getBillingChainId,
  getBillingUsdcAmount,
  getBillingPeriodDays,
  getTreasuryWallet,
  getUsdcAddress,
} from "@/lib/billing/crypto-config-client";

type Props = {
  priceLabel: string;
  billingExpiresAt: string | null;
};

export function CryptoCheckout({ priceLabel, billingExpiresAt }: Props) {
  const router = useRouter();
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const requiredChainId = getBillingChainId();
  const treasury = getTreasuryWallet();
  const usdcAddress = getUsdcAddress();
  const amount = getBillingUsdcAmount();
  const periodDays = getBillingPeriodDays();
  const wrongChain = isConnected && chainId !== requiredChainId;

  const { isLoading: waitingReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: requiredChainId,
  });

  const confirmOnServer = useCallback(
    async (hash: string) => {
      setConfirming(true);
      setError(null);
      try {
        const res = await fetch("/api/billing/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txHash: hash }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Could not confirm payment.");
          return;
        }
        router.push("/app/billing?paid=1");
        router.refresh();
      } catch {
        setError("Network error while confirming payment.");
      } finally {
        setConfirming(false);
      }
    },
    [router]
  );

  async function handlePay() {
    setError(null);
    if (!treasury || !usdcAddress) {
      setError("Billing is not configured. Contact support.");
      return;
    }
    if (!address) {
      setError("Connect a wallet first.");
      return;
    }
    if (chainId !== requiredChainId) {
      try {
        await switchChainAsync({ chainId: requiredChainId });
      } catch {
        setError("Switch to the Base network in your wallet.");
        return;
      }
    }

    const amountUnits = parseUnits(amount.toString(), 6);
    try {
      const hash = await writeContractAsync({
        address: usdcAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [treasury, amountUnits],
        chainId: requiredChainId,
      });
      setTxHash(hash);
      await confirmOnServer(hash);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Transaction rejected.";
      setError(message);
    }
  }

  const expiresDate = billingExpiresAt ? new Date(billingExpiresAt) : null;
  const daysLeft =
    expiresDate && expiresDate > new Date()
      ? Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

  return (
    <div className="space-y-4">
      {daysLeft !== null && daysLeft <= 7 && (
        <FlashMessage variant="warning">
          Professional access expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}. Pay again to extend.
        </FlashMessage>
      )}

      {billingExpiresAt && expiresDate && expiresDate > new Date() && (
        <p className="text-sm text-muted-foreground">
          Active until{" "}
          <time dateTime={billingExpiresAt}>{expiresDate.toLocaleDateString()}</time>
          {daysLeft !== null ? ` (${daysLeft} days left)` : ""}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <ConnectButton chainStatus="icon" showBalance={false} />
        <Button
          type="button"
          onClick={handlePay}
          disabled={!isConnected || wrongChain || waitingReceipt || confirming || !treasury}
          className="gap-2"
        >
          {waitingReceipt || confirming
            ? "Confirming…"
            : `Pay ${priceLabel} — ${periodDays} days on Base`}
        </Button>
      </div>

      {wrongChain && (
        <FlashMessage variant="warning">Switch your wallet to Base to pay with USDC.</FlashMessage>
      )}
      {error && <FlashMessage variant="error">{error}</FlashMessage>}

      <p className="text-xs text-muted-foreground">
        Send USDC on Base to activate or extend Professional. Each payment adds {periodDays} days. No
        auto-renewal — pay again before expiry.
      </p>
    </div>
  );
}
