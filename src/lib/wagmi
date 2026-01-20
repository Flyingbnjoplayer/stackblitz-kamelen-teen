import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, metaMask, injected } from 'wagmi/connectors';
import { QueryClient } from '@tanstack/react-query';

// Always use Base mainnet - no testnet
export const activeChain = base;
  
export const config = createConfig({
  chains: [base],
  connectors: [
    // Coinbase Wallet - supports both TBA and EOA
    coinbaseWallet({
      appName: 'Glitch Editor - Base',
      preference: 'all',
    }),
    // MetaMask
    metaMask({
      dappMetadata: {
        name: 'Glitch Editor - Base',
      },
    }),
    // Phantom Wallet
    injected({ 
      target: 'phantom',
    }),
    // Rabby Wallet
    injected({ 
      target: 'rabby',
    }),
    // Trust Wallet
    injected({ 
      target: 'trust',
    }),
  ],
  transports: {  
    [base.id]: http(),
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
