"use client";
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useState } from 'react';
import { http } from 'wagmi';

export const wagmiConfig = getDefaultConfig({
  appName: 'Onchain POAPs — Archive',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd',
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: true,
});

export function Web3Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={qc}>
        <RainbowKitProvider modalSize="wide" initialChain={baseSepolia} showRecentTransactions={true}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
