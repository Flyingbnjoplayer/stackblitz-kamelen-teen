'use client';

import { useState, useCallback } from 'react';
import { GlitchEditor } from '@/components/glitch-editor';
import { GlitchControls, type EffectState } from '@/components/glitch-controls';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { WalletInfoPanel } from '@/components/wallet-info-panel';
import { ShareButtons } from '@/components/share-buttons';
import { NFTMintModal } from '@/components/nft-mint-modal';
import { useAccount } from 'wagmi';
import { useQuickAuth } from '@/hooks/useQuickAuth';
import { useIsInFarcaster } from '@/hooks/useIsInFarcaster';
import { Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const { address: connectedAddress, isConnected } = useAccount();
  const isInFarcaster = useIsInFarcaster();
  useQuickAuth(isInFarcaster);

  const handleEffectChange = useCallback((effectId: string, value: number) => {
    setEffectStates((prev) => ({
      ...prev,
      [effectId]: value,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setEffectStates(defaultEffects);
    setResetTrigger((prev) => prev + 1);
  }, []);

  const handleImageProcessed = useCallback((dataUrl: string) => {
    setEditedImage(dataUrl);
  }, []);

  const handleImageLoaded = useCallback((loaded: boolean) => {
    setHasImage(loaded);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Glitch Art Studio
          </h1>
          <p className="text-gray-400">Create stunning glitch effects & mint as NFTs on Base</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Editor */}
          <div className="flex-1 space-y-4">
            <GlitchEditor
              effectStates={effectStates}
              onImageProcessed={handleImageProcessed}
              onImageLoaded={handleImageLoaded}
              resetTrigger={resetTrigger}
            />

            {/* Action Buttons */}
            {hasImage && editedImage && (
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
                  className="border-white/30 hover:bg-white/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            )}

            {/* Share Buttons */}
            {editedImage && (
              <ShareButtons imageDataUrl={editedImage} />
            )}

            {/* Wallet & Mint */}
            <div className="space-y-4">
              <WalletConnectButton />
              {isConnected && connectedAddress && (
                <>
                  <WalletInfoPanel address={connectedAddress} />
                  {editedImage && (
                    <NFTMintModal
                      editedImage={editedImage}
                      walletAddress={connectedAddress}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="lg:w-96">
            <GlitchControls
              effectStates={effectStates}
              onEffectChange={handleEffectChange}
              onReset={handleReset}
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
