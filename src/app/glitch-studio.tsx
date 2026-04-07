'use client';

import { useState, useCallback, useEffect } from 'react';
import { GlitchEditor } from '@/components/glitch-editor';
import { GlitchControls, type EffectState } from '@/components/glitch-controls';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { WalletInfoPanel } from '@/components/wallet-info-panel';
import { ShareButtons } from '@/components/share-buttons';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { useQuickAuth } from '@/hooks/useQuickAuth';
import { useIsInFarcaster } from '@/hooks/useIsInFarcaster';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { baseSepolia } from 'viem/chains';
import { sdk } from '@farcaster/miniapp-sdk';

const defaultEffects: EffectState = {
  rgbSplit: 0,
  scanLines: 0,
  vhsDistortion: 0,
  chromaticAberration: 0,
  digitalCorruption: 0,
  colorShift: 0,
  glitchBars: 0,
  bitCrush: 0,
};

export default function GlitchStudio() {
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [effectStates, setEffectStates] = useState<EffectState>(defaultEffects);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [hasImage, setHasImage] = useState(false);
  const [hasMintedNft, sethasMintedNft] = useState(false);
  const [lockEffects, setLockEffects] = useState(false); 
  const { isConnected } = useAccount();
const { switchChain } = useSwitchChain();
const chainId = useChainId();

// Add this inside the GlitchStudio component
// Debug: Check Farcaster SDK context
useEffect(() => {
  const debugFarcaster = async () => {
    try {
      const inMiniApp = await sdk.isInMiniApp()
      console.log('🔍 isInMiniApp:', inMiniApp)
      
      if (inMiniApp) {
        const context = await sdk.context
        console.log('🔍 Full SDK context:', JSON.stringify(context, null, 2))
        console.log('🔍 context.user:', context?.user)
        
        // Try getting wallet address
        try {
          const wallet = await sdk.wallet
          console.log('🔍 sdk.wallet:', wallet)
        } catch (e) {
          console.log('🔍 sdk.wallet error:', e)
        }
        
        // Try getting signer address
        try {
          const signer = await sdk.wallet.getEthereumSigner?.()
          console.log('🔍 ethereum signer:', signer)
          if (signer?.getAddress) {
            const addr = await signer.getAddress()
            console.log('🔍 signer address:', addr)
          }
        } catch (e) {
          console.log('🔍 signer error:', e)
        }
      }
    } catch (e) {
      console.log('🔍 Debug error:', e)
    }
  }
  debugFarcaster()
}, [])
// Auto-switch to Base Sepolia when wallet connects
useEffect(() => {
  if (isConnected && chainId !== baseSepolia.id) {
    switchChain?.({ chainId: baseSepolia.id });
  }
}, [isConnected, chainId, switchChain]);
  const isInFarcaster = useIsInFarcaster();
  useQuickAuth(isInFarcaster);

  const handleEffectChange = useCallback((effectId: string, value: number) => {
    setEffectStates((prev) => ({
      ...prev,
      [effectId]: value,
    }));
  }, []);

  const handleReset = useCallback(() => {
    if (lockEffects) {
      // Keep current effect values, just reset the trigger
      setResetTrigger((prev) => prev + 1);
    } else {
      setEffectStates(defaultEffects);
      setResetTrigger((prev) => prev + 1);
    }
  }, [lockEffects]);

  const handleToggleLock = useCallback(() => {
    setLockEffects((prev) => !prev);
  }, []);

  const handleImageProcessed = useCallback((dataUrl: string) => {
    setEditedImage(dataUrl);
  }, []);

  const handleImageLoaded = useCallback((loaded: boolean) => {
    setHasImage(loaded);
    // Reset mint state when new image is loaded
    if (loaded) {
      sethasMintedNft(false);
    }
  }, []);

  const handleDownload = () => {
    if (!editedImage) return;

    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `glitch-art-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMintSuccess = useCallback(() => {
    sethasMintedNft(true);
  }, []);

  const handleSuccessfulPost = useCallback(() => {
    // Reset everything after successful share
    sethasMintedNft(false);
    setHasImage(false);
    setEditedImage(null);
    setResetTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Glitch Art Studio
          </h1>
          <p className="text-gray-400">Create stunning glitch effects & mint as NFTs on Base</p>
        </header>

       {/* Instruction Guide */}
        {!hasImage && (
          <div className="bg-black/30 rounded-lg p-4 mb-6 max-w-md mx-auto text-center">
            <p className="text-sm text-gray-300 mb-2">How it works:</p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 flex-wrap">
              <span className="bg-purple-600/30 px-2 py-1 rounded whitespace-nowrap">1. Upload Image</span>
              <span className="whitespace-nowrap">→</span>
              <span className="bg-blue-600/30 px-2 py-1 rounded whitespace-nowrap">2. Apply Effects</span>
              <span className="whitespace-nowrap">→</span>
              <span className="bg-pink-600/30 px-2 py-1 rounded whitespace-nowrap">3. Mint NFT</span>
              <span className="whitespace-nowrap">→</span>
              <span className="bg-green-600/30 px-2 py-1 rounded whitespace-nowrap">4. Share</span>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Editor */}
          <div className="flex-1 space-y-4">
            <GlitchEditor
              effectStates={effectStates}
              onImageProcessed={handleImageProcessed}
              onImageLoaded={handleImageLoaded}
              resetTrigger={resetTrigger}
            />

            {/* Action Buttons - Only show after mint */}
            {hasImage && editedImage && hasMintedNft && (
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={handleDownload}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-black text-black hover:bg-black/10 bg-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Change Image
                </Button>
              </div>
            )}

            {/* Share Buttons */}
            {editedImage && (
              <ShareButtons
                imageDataUrl={editedImage}
                onMintSuccess={handleMintSuccess}
                onSuccessfulPost={handleSuccessfulPost}
                hasMintedNft={hasMintedNft}
              />
            )}

            {/* Wallet */}
            <div className="space-y-4">
              <WalletConnectButton />
              <WalletInfoPanel />
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="lg:w-96">
            <GlitchControls
              effectStates={effectStates}
              onEffectChange={handleEffectChange}
              onReset={handleReset}
              lockEffects={lockEffects}
              onToggleLock={handleToggleLock}
            />
          </div>
        </div>

        <footer className="text-center py-8 text-gray-500 text-sm">
          <p>Built on Base • Powered by Farcaster</p>
        </footer>
      </div>
    </div>
  );
}