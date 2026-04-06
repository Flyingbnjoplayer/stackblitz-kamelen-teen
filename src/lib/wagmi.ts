import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask, injected } from 'wagmi/connectors';
import { farcasterConnector } from '@farcaster/miniapp-wagmi-connector';
import { QueryClient } from '@tanstack/react-query';

const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID ?? '84532');
export const activeChain = DEFAULT_CHAIN_ID === base.id ? base : baseSepolia;

const ALCHEMY_SEPOLIA_URL = process.env.ALCHEMY_BASE_SEPOLIA_HTTP || 'https://sepolia.base.org';
const ALCHEMY_MAINNET_URL = process.env.ALCHEMY_BASE_MAINNET_HTTP || 'https://mainnet.base.org';

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    farcasterConnector(), // <-- Add this FIRST - prioritizes Farcaster wallet
    coinbaseWallet({
      appName: 'Glitch Editor - Base',
      preference: 'all',
    }),
    metaMask({
      dappMetadata: { name: 'Glitch Editor - Base' },
    }),
    injected({ target: 'phantom' }),
    injected({ target: 'rabby' }),
    injected({ target: 'trust' }),
  ],
  transports: {
    [baseSepolia.id]: http(ALCHEMY_SEPOLIA_URL),
    [base.id]: http(ALCHEMY_MAINNET_URL),
  },
  ssr: false,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5_000,
    },
  },
});