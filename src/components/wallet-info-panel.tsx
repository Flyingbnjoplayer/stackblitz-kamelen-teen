'use client';

import { useBalance, useChainId } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp } from 'lucide-react';
import { base, baseSepolia } from 'wagmi/chains';
import { useFarcasterWallet } from '@/hooks/useFarcasterWallet';

export function WalletInfoPanel() {
  const { address, isConnected, isInFarcaster } = useFarcasterWallet();
  const chainId = useChainId();
  
  // Use the currently connected chain for balance
  const { data: balance } = useBalance({
    address,
    chainId: chainId || baseSepolia.id,
  });

  if (!isConnected || !address) {
    return null;
  }

  // Determine chain name
  const chainName = chainId === base.id ? 'Base' : chainId === baseSepolia.id ? 'Base Sepolia' : 'Unknown';

  return (
    <Card className="bg-gradient-to-br from-purple-900/80 to-blue-900/80 border-2 border-purple-400/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <Wallet className="w-5 h-5 text-purple-400" />
          Wallet Info
          {isInFarcaster && (
            <span className="text-xs bg-purple-500/30 px-2 py-0.5 rounded-full">Farcaster</span>
          )}
        </CardTitle>
        <CardDescription className="text-blue-100">
          Your connected wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
          <div>
            <p className="text-xs text-blue-200 mb-1">Address</p>
            <p className="text-sm font-mono text-white font-bold">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200 mb-1">Network</p>
            <p className="text-sm text-white font-bold">{chainName}</p>
          </div>
        </div>

        {balance && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-400/30">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-blue-100">Balance</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">
                {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}