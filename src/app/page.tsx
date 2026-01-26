'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Sliders, Zap } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { applyGlitchEffect } from '../lib/glitch-effects';
import { useAccount } from 'wagmi';
import { shareToWarpcast, shareToBase } from '../lib/social-share';
import { useQuickAuth } from '../hooks/useQuickAuth';
import { useIsInFarcaster } from '../hooks/useIsInFarcaster';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui';
import { Button as UIButton } from '../components/ui';
import { RefreshCw, Download } from 'lucide-react';
import { WalletConnectButton } from '../components/wallet-connect-button';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [glitchIntensity, setGlitchIntensity] = useState(50);
  const [effectType, setEffectType] = useState<'scanlines' | 'chromatic' | 'pixelate' | 'rgb-shift'>('scanlines');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { address: connectedAddress, isConnected } = useAccount();
  const { login } = useQuickAuth();
  const isInFarcaster = useIsInFarcaster();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyEffect = useCallback(async () => {
    if (!selectedImage || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      const processedImage = await applyGlitchEffect(
        selectedImage,
        effectType,
        glitchIntensity,
        canvasRef.current
      );
      setEditedImage(processedImage);
    } catch (error) {
      console.error('Error applying effect:', error);
      alert('Failed to apply effect. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedImage, effectType, glitchIntensity]);

  useEffect(() => {
    if (selectedImage) {
      applyEffect();
    }
  }, [glitchIntensity, effectType, selectedImage, applyEffect]);

  const handleDownload = () => {
    if (!editedImage) return;
    
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `glitch-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMint = async () => {
    if (!isConnected || !connectedAddress || !editedImage) {
      alert('Please connect your wallet and edit an image first');
      return;
    }

    setIsMinting(true);
    try {
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: editedImage,
          walletAddress: connectedAddress,
          name: `Glitch Art ${Date.now()}`,
          description: `Glitch effect: ${effectType}, intensity: ${glitchIntensity}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mint NFT');
      }

      alert(`NFT Minted! Transaction: ${data.transactionHash}`);
    } catch (error) {
      console.error('Minting error:', error);
      alert(error instanceof Error ? error.message : 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };

  const handleShare = async (platform: 'warpcast' | 'base') => {
    if (!editedImage) {
      alert('Please create a glitch image first');
      return;
    }

    try {
      if (platform === 'warpcast') {
        await shareToWarpcast(editedImage, `Check out my glitch art! #GlitchArt`);
      } else {
        await shareToBase(editedImage, `Check out my glitch art! #GlitchArt`);
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-5xl font-bold mb-2 glitch-text">Glitch Art Studio</h1>
          <p className="text-gray-400">Create stunning glitch effects & mint as NFTs</p>
        </header>

        <div className="flex justify-end mb-4">
          <WalletConnectButton />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="bg-gray-900 border-purple-500">
            <CardContent className="p-6">
              <div
                className="border-2 border-dashed border-purple-500 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Selected" className="max-w-full h-auto mx-auto rounded" />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <Upload className="w-16 h-16 text-purple-500" />
                    <p className="text-gray-400">Click to upload an image</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="bg-gray-900 border-blue-500">
            <CardContent className="p-6">
              <div className="border-2 border-blue-500 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
                {editedImage ? (
                  <img src={editedImage} alt="Glitched" className="max-w-full h-auto rounded" />
                ) : (
                  <div className="text-center text-gray-500">
                    <Zap className="w-16 h-16 mx-auto mb-4" />
                    <p>Your glitched image will appear here</p>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </CardContent>
          </Card>
        </div>

        {/* Controls Section */}
        {selectedImage && (
          <Card className="mt-6 bg-gray-900 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sliders className="w-5 h-5" />
                <h2 className="text-xl font-bold">Effect Controls</h2>
              </div>

              <Tabs value={effectType} onValueChange={(value) => setEffectType(value as any)}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="scanlines">Scanlines</TabsTrigger>
                  <TabsTrigger value="chromatic">Chromatic</TabsTrigger>
                  <TabsTrigger value="pixelate">Pixelate</TabsTrigger>
                  <TabsTrigger value="rgb-shift">RGB Shift</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Intensity: {glitchIntensity}</label>
                  <Slider
                    value={[glitchIntensity]}
                    onValueChange={(value) => setGlitchIntensity(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-4 flex-wrap">
                  <UIButton onClick={applyEffect} disabled={isProcessing} className="flex-1">
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Apply Effect'
                    )}
                  </UIButton>
                  <UIButton onClick={handleDownload} disabled={!editedImage} variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </UIButton>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <UIButton
                    onClick={() => handleShare('warpcast')}
                    disabled={!editedImage}
                    variant="secondary"
                    className="w-full"
                  >
                    Share to Warpcast
                  </UIButton>
                  <UIButton
                    onClick={() => handleShare('base')}
                    disabled={!editedImage}
                    variant="secondary"
                    className="w-full"
                  >
                    Share to Base
                  </UIButton>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <UIButton disabled={!editedImage || !isConnected} className="w-full" variant="default">
                      {isMinting ? 'Minting...' : 'Mint as NFT'}
                    </UIButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Mint NFT</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mint your glitch art as an NFT on Base network. Make sure you have enough ETH for gas fees.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleMint}>
                        Confirm Mint
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}