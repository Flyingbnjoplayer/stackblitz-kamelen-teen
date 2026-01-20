'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useAccount } from 'wagmi';
import { Button } from './ui/button';
import { Share2, Sparkles } from 'lucide-react';
import { useIsInFarcaster } from '@/hooks/useIsInFarcaster';
import { NFTMintModal } from '@/components/nft-mint-modal';

export type ShareButtonsProps = {
  imageDataUrl: string;
  onShare?: () => void;
  onSuccessfulPost?: () => void;
};

export function ShareButtons({ imageDataUrl, onShare, onSuccessfulPost }: ShareButtonsProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isMintModalOpen, setIsMintModalOpen] = useState<boolean>(false);
  const isInFarcaster = useIsInFarcaster();
  const { address } = useAccount();

  useEffect(() => {

    // Reset sharing state when app becomes visible again
    // This handles the case where user cancels the post and returns to the app
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        console.log('App became visible, resetting share button state');
        // Use a timeout to ensure any pending operations complete first
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
    console.log('Image data URL length:', imageDataUrl.length);
    console.log('Is in Farcaster:', isInFarcaster);
    
    setMessage(null);
    setIsSharing(true);

    try {
      // First, upload the image to get a public URL
      console.log('Uploading image...');
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: imageDataUrl }),
      });

      console.log('Upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Upload failed:', uploadResponse.status, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `Upload failed with status ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json() as { imageUrl: string; directImageUrl: string; id: string; blobUrl: string };
      console.log('Image uploaded successfully:', uploadData);

      // Compose cast in Farcaster/Based app
      console.log('Attempting to compose cast in Farcaster/Based...');
      console.log('Direct image URL:', uploadData.directImageUrl);
      
      // Make sure SDK is ready
      await sdk.actions.ready();
      console.log('SDK is ready');
      
      // CRITICAL: Use ONLY the direct blob URL as the single embed
      // NO mentions, NO extra text that could be parsed as links
      // This ensures the image displays full-size in the post
      const result = await sdk.actions.composeCast({
        text: `Just created some glitch art on Base! ⚡`,
        embeds: [uploadData.directImageUrl],
      });
      
      console.log('Compose cast result:', result);

      // Always reset the sharing state when we return from the composer
      setIsSharing(false);

      if (result?.cast) {
        // User successfully posted - reset the app
        console.log('Cast posted successfully, resetting app');
        setMessage({ type: 'success', text: '✅ Shared on Based!' });
        setTimeout(() => {
          setMessage(null);
          // Reset the app state after successful post
          if (onSuccessfulPost) {
            onSuccessfulPost();
          }
        }, 1500);
      } else {
        // User cancelled - keep the image and just reset button state
        console.log('Cast was cancelled by user, keeping image');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Share failed.';
      console.error('❌ Share error:', errorMessage, error);
      
      setIsSharing(false);
      
      // Provide more specific error messages
      let userMessage = 'Failed to share on Based. Please try again.';
      if (errorMessage.includes('blob storage') || errorMessage.includes('BLOB_READ_WRITE_TOKEN') || errorMessage.includes('Image storage not configured')) {
        userMessage = '⚠️ Image storage not configured. Please set up Vercel Blob in your project settings.';
      } else if (errorMessage.includes('upload')) {
        userMessage = 'Failed to upload image. Please check your connection and try again.';
      }
      
      setMessage({ 
        type: 'error', 
        text: userMessage
      });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleWarpcastShare = async (): Promise<void> => {
    console.log('Warpcast share button clicked');
    setMessage(null);
    setIsSharing(true);

    try {
      // Upload the image first
      console.log('Uploading image...');
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: imageDataUrl }),
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Upload failed:', uploadResponse.status, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `Upload failed with status ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json() as { imageUrl: string; directImageUrl: string; id: string; blobUrl: string };
      console.log('Image uploaded successfully:', uploadData);

      // Open Warpcast composer in browser
      console.log('Opening Warpcast web composer');
      const text = encodeURIComponent(`Just created some glitch art on Base! ⚡`);
      const warpcastUrl = `https://warpcast.com/~/compose?text=${text}&embeds[]=${encodeURIComponent(uploadData.directImageUrl)}`;
      
      console.log('Opening Warpcast URL:', warpcastUrl);
      const opened = window.open(warpcastUrl, '_blank', 'noopener,noreferrer');
      
      if (opened) {
        setMessage({ 
          type: 'success', 
          text: '✅ Opening Warpcast composer...' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Please allow pop-ups to share on Warpcast' 
        });
      }
      setTimeout(() => setMessage(null), 3000);
      setIsSharing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Share failed.';
      console.error('❌ Warpcast share error:', errorMessage, error);
      
      setIsSharing(false);
      
      // Provide more specific error messages
      let userMessage = 'Failed to upload image. Please try again.';
      if (errorMessage.includes('blob storage') || errorMessage.includes('BLOB_READ_WRITE_TOKEN') || errorMessage.includes('Image storage not configured')) {
        userMessage = '⚠️ Image storage not configured. Please set up Vercel Blob in your project settings.';
      } else if (errorMessage.includes('upload')) {
        userMessage = 'Failed to upload image. Please check your connection and try again.';
      }
      
      setMessage({ 
        type: 'error', 
        text: userMessage
      });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Show all action buttons simultaneously
  return (
    <>
      <div className="space-y-3 w-full">
        {/* Mint as NFT button */}
        <Button
          onClick={() => setIsMintModalOpen(true)}
          disabled={isSharing || !imageDataUrl}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg text-base py-6 border-2 border-white/20"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          <span className="font-bold text-white">Mint as NFT</span>
        </Button>

        {/* Share on Based button */}
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

        {/* Share on Warpcast button */}
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
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
        imageUrl={imageDataUrl}
        onMintSuccess={() => {
          console.log('NFT minted successfully!');
        }}
      />
    </>
  );
}
