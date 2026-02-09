//stackblitz-kamelen-teen/src/lib/wagmi.ts
import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask, injected } from 'wagmi/connectors';
import { QueryClient } from '@tanstack/react-query';

/**
 * Chains
 * - Default = Base Sepolia (84532)
 * - Switch naar mainnet door NEXT_PUBLIC_DEFAULT_CHAIN_ID=8453 te zetten
 */
const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID ?? '84532');
export const activeChain = DEFAULT_CHAIN_ID === base.id ? base : baseSepolia;

/**
 * Transports (Alchemy RPC) – direct jouw endpoints
 * (Wil je env-variabelen gebruiken? Vervang de harde URLs door process.env.* keys)
 */
const ALCHEMY_BASE_MAINNET_HTTP =
  'https://base-mainnet.g.alchemy.com/v2/ATZiOMYN-mCVgIL7CXSPh';
const ALCHEMY_BASE_SEPOLIA_HTTP =
  'https://base-sepolia.g.alchemy.com/v2/ATZiOMYN-mCVgIL7CXSPh';

export const config = createConfig({
  // Eerst testnet, dan mainnet – zo kiezen hooks automatisch de juiste als je switcht
  chains: [baseSepolia, base],
  connectors: [
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
    [baseSepolia.id]: http(ALCHEMY_BASE_SEPOLIA_HTTP),
    [base.id]: http(ALCHEMY_BASE_MAINNET_HTTP),
  },
  // Je had ssr:false – ik laat dit zo om niets te breken
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