"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { base, baseSepolia } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { useState, type ReactNode } from "react";

const chainId = Number(process.env.NEXT_PUBLIC_BASE_CHAIN_ID ?? "8453");
const chains = chainId === baseSepolia.id ? ([baseSepolia] as const) : ([base] as const);

const config = getDefaultConfig({
  appName: "Australia Visa Calculator",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "00000000000000000000000000000000",
  chains,
  ssr: true,
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
