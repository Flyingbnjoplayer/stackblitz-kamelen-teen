'use client';

import { useState, useEffect, useRef } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { Button } from './ui/button';
import { Share2, Sparkles } from 'lucide-react';
import { useIsInFarcaster } from '@/hooks/useIsInFarcaster';
import { useFarcasterWallet } from '@/hooks/useFarcasterWallet';
import { NFTMintModal } from '@/components/nft-mint-modal';

export type ShareButtonsProps = {
  imageDataUrl: string;
  onShare?: () => void;
  onSuccessfulPost?: () => void;
  onMintSuccess?: () => void;
  onImageChange?: () => void;
  hasMintedNft?: boolean;
};

export function ShareButtons({ imageDataUrl, onShare, onSuccessfulPost, onMintSuccess, onImageChange, hasMintedNft }: ShareButtonsProps) {
  console.log('🎨 ShareButtons render - hasMintedNft:', hasMintedNft);
  
  const [isSharing, setIsSharing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isMintModalOpen, setIsMintModalOpen] = useState<boolean>(false);
  const justMintedRef = useRef(false);
  const isInFarcaster = useIsInFarcaster();
  const { address, isConnected } = useFarcasterWallet();
  const [isMobile, setIsMobile] = useState(false);

  console.log('🎨 ShareButtons - address:', address, 'isConnected:', isConnected, 'isInFarcaster:', isInFarcaster);

   useEffect(() => {
     // If we just minted, ignore the next image change (it's likely just noise)
    if (justMintedRef.current) {
      console.log('🔄 Image changed, but ignoring because mint just finished');
      justMintedRef.current = false; // Reset flag for next time
      return;
    }
    
    // If we have a minted state, and the image changes, tell the parent to reset.
    if (hasMintedNft && onImageChange) {
      console.log('🔄 Image URL changed in ShareButtons, notifying parent to reset mint state');
      onImageChange();
    }
  }, [imageDataUrl, hasMintedNft, onImageChange]);
  
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleMintSuccess = () => {
    console.log('🎯 handleMintSuccess called in ShareButtons');
    justMintedRef.current = true;
    if (onMintSuccess) onMintSuccess();
  };

   // Debug logging
  console.log('🔧 ShareButtons state:', {
    isMintModalOpen,
    hasMintedNft,
    isConnected,
    imageDataUrlLength: imageDataUrl?.length
  });

  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        console.log('App became visible, resetting share button state');
        setTimeout(() => {
          setIsSharing(false);
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleBasedShare = async (): Promise<void> => {
    console.log('Share button clicked');
    setMessage(null);
    setIsSharing(true);

    try {
      console.log('Uploading image...');
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: imageDataUrl }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json() as { imageUrl: string; directImageUrl: string };
      console.log('Image uploaded:', uploadData);

      await sdk.actions.ready();
      console.log('SDK is ready');

      if (!sdk?.actions?.composeCast) {
        console.error('SDK composeCast not available');
        await navigator.clipboard.writeText(uploadData.directImageUrl);
        setMessage({ type: 'error', text: 'URL copied to clipboard! Share manually.' });
        setIsSharing(false);
        return;
      }

      const result = await sdk.actions.composeCast({
        text: `Just created some glitch art on Base! ⚡`,
        embeds: [uploadData.imageUrl],
      });

      console.log('Compose result:', result);
      setIsSharing(false);

      if (result?.cast) {
        setMessage({ type: 'success', text: '✅ Shared on Based!' });
        setTimeout(() => {
          setMessage(null);
          if (onSuccessfulPost) onSuccessfulPost();
        }, 1500);
      }
    } catch (error) {
      console.error('Share error:', error);
      setIsSharing(false);
      setMessage({ type: 'error', text: 'Failed to share. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleWarpcastShare = async (): Promise<void> => {
    console.log('Warpcast share clicked');
    setMessage(null);
    setIsSharing(true);

    try {
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: imageDataUrl }),
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      const uploadData = await uploadResponse.json() as { directImageUrl: string };
      console.log('Image uploaded:', uploadData);

      const text = encodeURIComponent(`Just created some glitch art on Base! ⚡`);

      const warpcastUrl = isMobile
        ? `farcaster://compose?text=${text}&embeds[]=${encodeURIComponent(uploadData.directImageUrl)}`
        : `https://warpcast.com/~/compose?text=${text}&embeds[]=${encodeURIComponent(uploadData.directImageUrl)}`;

      console.log('Opening:', warpcastUrl);
      window.open(warpcastUrl, '_blank', 'noopener,noreferrer');

      setMessage({ type: 'success', text: '✅ Opening Warpcast...' });
      setTimeout(() => setMessage(null), 3000);
      setIsSharing(false);
    } catch (error) {
      console.error('Warpcast share error:', error);
      setIsSharing(false);
      setMessage({ type: 'error', text: 'Failed to share. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <>
      <div className="space-y-3 w-full">
        {/* Mint as NFT button - show when connected and not yet minted */}
        {isConnected && !hasMintedNft && (
          <Button
            onClick={() => {
              console.log('🔧 Opening mint modal, current isMintModalOpen:', isMintModalOpen);
              setIsMintModalOpen(true)}
            }
            disabled={isSharing || !imageDataUrl}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg text-base py-6 border-2 border-white/20"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            <span className="font-bold text-white">Mint as NFT</span>
          </Button>
        )}

        {/* Share on Based button - mobile only, only after mint */}
        {isMobile && hasMintedNft && (
          <Button
            onClick={handleBasedShare}
            disabled={isSharing || !imageDataUrl}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg text-base py-6 border-2 border-white/20"
          >
            <Share2 className="w-5 h-5 mr-2" />
            <span className="font-bold text-white">
              {isSharing ? 'Sharing...' : 'Share on Based'}
            </span>
          </Button>
        )}

        {/* Share on Warpcast button - only after mint */}
        {hasMintedNft && (
          <Button
            onClick={handleWarpcastShare}
            disabled={isSharing || !imageDataUrl}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg text-base py-6 border-2 border-white/20"
          >
            <Share2 className="w-5 h-5 mr-2" />
            <span className="font-bold text-white">
              {isSharing ? 'Sharing...' : 'Share on Warpcast'}
            </span>
          </Button>
        )}

        {message && (
          <div
            className={`text-sm text-center p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                : 'bg-red-500/20 text-red-100 border border-red-400/30'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="text-xs text-blue-200/80 text-center font-medium">
          💙 Mint, share, and trade on Base network
        </div>
      </div>

      {/* NFT Mint Modal */}
      <NFTMintModal
        key={imageDataUrl}  // Force remount when image changes
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
        imageUrl={imageDataUrl}
        onMintSuccess={handleMintSuccess}
      />
    </>
  );
}

function useRef(arg0: boolean) {
  throw new Error('Function not implemented.');
}
