'use client'
import { useState, useEffect } from 'react';

// Force dynamic rendering to avoid SSR issues with window access
export const dynamic = 'force-dynamic';
import { GlitchEditor } from '@/components/glitch-editor';
import { GlitchControls } from '@/components/glitch-controls';
import { ShareButtons } from '@/components/share-buttons';
import { sdk } from '@farcaster/miniapp-sdk';
import { useAccount } from 'wagmi';
import type { EffectState } from '../components/glitch-controls';
import { useAddMiniApp } from '../hooks/useAddMiniApp';
import { useQuickAuth } from '../hooks/useQuickAuth';
import { useIsInFarcaster } from '../hooks/useIsInFarcaster';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui';
import { Button } from '../components/ui';
import { RefreshCw, Download } from 'lucide-react';
import { WalletConnectButton } from '../components/wallet-connect-button';
import { WalletInfoPanel } from '../components/wallet-info-panel';
import { toast } from 'sonner';

export default function Page() {
  const [effectStates, setEffectStates] = useState<EffectState>({
    rgbSplit: 0,
    scanLines: 0,
    vhsDistortion: 0,
    chromaticAberration: 0,
    digitalCorruption: 0,
    colorShift: 0,
    glitchBars: 0,
    bitCrush: 0,
  });
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [hasImage, setHasImage] = useState(false);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const { address } = useAccount();
  const { addMiniApp } = useAddMiniApp();
  const isInFarcaster = useIsInFarcaster();
  useQuickAuth(isInFarcaster);

  useEffect(() => {
    const tryAddMiniApp = async (): Promise<void> => {
      try {
        await addMiniApp();
      } catch (error) {
        console.error('Failed to add mini app:', error);
      }
    };

    tryAddMiniApp();
  }, [addMiniApp]);

  // Call ready() after the interface is rendered to hide the splash screen
  // Use requestAnimationFrame to ensure it's called after the first paint
  useEffect(() => {
    const callReady = async (): Promise<void> => {
      try {
        // Wait for the next animation frame to ensure UI is painted
        requestAnimationFrame(() => {
          requestAnimationFrame(async () => {
            await sdk.actions.ready();
            console.log('✅ Farcaster SDK ready() called successfully after paint');
          });
        });
      } catch (error) {
        console.error('❌ Failed to call ready():', error);
      }
    };

    callReady();
  }, []);

  // Check for image URL in query parameters (from browser transfer)
  useEffect(() => {
    const checkForImageParam = async (): Promise<void> => {
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      const params = new URLSearchParams(window.location.search);
      const imageUrl = params.get('imageUrl');
      
      if (imageUrl) {
        console.log('📸 Found image URL in parameters, loading image...');
        toast.loading('Loading your glitch art...', { id: 'load-image' });
        
        try {
          // Fetch the image and convert to data URL
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error('Failed to fetch image');
          
          const blob = await response.blob();
          const reader = new FileReader();
          
          reader.onload = (e: ProgressEvent<FileReader>) => {
            const dataUrl = e.target?.result as string;
            if (dataUrl) {
              setProcessedImageUrl(dataUrl);
              setHasImage(true);
              toast.success('✅ Your glitch art is ready!', { id: 'load-image' });
              
              // Clean up URL parameter
              window.history.replaceState({}, '', window.location.pathname);
            }
          };
          
          reader.onerror = () => {
            throw new Error('Failed to read image');
          };
          
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Failed to load image from URL:', error);
          toast.error('Failed to load image. Please try again.', { id: 'load-image' });
        }
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      checkForImageParam();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleEffectChange = (effectId: string, value: number): void => {
    setEffectStates((prev: EffectState) => ({
      ...prev,
      [effectId]: value,
    }));
  };

  const handleReset = (): void => {
    setEffectStates({
      rgbSplit: 0,
      scanLines: 0,
      vhsDistortion: 0,
      chromaticAberration: 0,
      digitalCorruption: 0,
      colorShift: 0,
      glitchBars: 0,
      bitCrush: 0,
    });
  };

  const handleChangePicture = (): void => {
    setHasImage(false);
    setProcessedImageUrl('');
    setEffectStates({
      rgbSplit: 0,
      scanLines: 0,
      vhsDistortion: 0,
      chromaticAberration: 0,
      digitalCorruption: 0,
      colorShift: 0,
      glitchBars: 0,
      bitCrush: 0,
    });
    setResetTrigger(prev => prev + 1);
  };

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!processedImageUrl) {
      toast.error('No image available. Please create some glitch art first!');
      return;
    }

    console.log('📥 Download button clicked');
    console.log('🔍 Is in Farcaster webview:', isInFarcaster);

    // If in embedded webview (Based app), upload image and open with URL parameter
    if (isInFarcaster) {
      console.log('🌐 Uploading image and opening in external browser...');
      toast.loading('Preparing to open in browser...', { id: 'browser-toast' });
      
      try {
        // Upload the image first
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: processedImageUrl }),
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to prepare image for browser');
        }

        const { directImageUrl } = await uploadResponse.json() as { directImageUrl: string };
        
        // Open app with image URL as parameter
        const baseUrl = window.location.origin + window.location.pathname;
        const appUrl = `${baseUrl}?imageUrl=${encodeURIComponent(directImageUrl)}`;
        
        const opened = window.open(appUrl, '_blank', 'noopener,noreferrer');
        if (opened) {
          toast.success('✅ Opening app in browser with your image!', { id: 'browser-toast', duration: 4000 });
        } else {
          toast.error('Pop-up blocked. Please allow pop-ups to continue.', { id: 'browser-toast', duration: 4000 });
        }
      } catch (error) {
        console.error('Failed to prepare browser transfer:', error);
        toast.error('Unable to open in browser. Please try again.', { id: 'browser-toast', duration: 4000 });
      }
      return;
    }

    console.log('=== DOWNLOAD STARTED ===');
    console.log('Image data URL length:', processedImageUrl.length);
    
    toast.loading('Preparing download...', { id: 'download-toast' });

    try {
      const fileName = `glitch-art-${Date.now()}.png`;
      
      // Convert data URL to blob using fetch (cleaner and more reliable)
      const response = await fetch(processedImageUrl);
      const blob = await response.blob();
      console.log('Blob created:', blob.size, 'bytes');
      
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      
      // For mobile: Try native share first
      if (isMobile && navigator.share) {
        try {
          const file = new File([blob], fileName, { type: 'image/png' });
          const shareData = { 
            files: [file], 
            title: 'Glitch Art',
            text: 'My glitch art creation'
          };
          
          if (navigator.canShare && navigator.canShare(shareData)) {
            console.log('Using native share...');
            toast.dismiss('download-toast');
            await navigator.share(shareData);
            toast.success('✅ Image shared! You can save it from the share menu.', { duration: 3000 });
            return;
          }
        } catch (shareError) {
          const errorName = shareError instanceof Error ? shareError.name : '';
          if (errorName === 'AbortError') {
            toast.dismiss('download-toast');
            return;
          }
          console.log('Native share not available or failed, trying download...');
        }
      }
      
      // Fallback: Direct download (works on desktop and some mobile browsers)
      console.log('Using direct download...');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
      toast.success('✅ Download started! Check your downloads folder.', { id: 'download-toast', duration: 3000 });
    } catch (error) {
      console.error('=== DOWNLOAD ERROR ===', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Download failed: ${errorMsg}. Try long-pressing the image instead.`, { id: 'download-toast', duration: 5000 });
    }
  };

  return (
    <>
      <WalletConnectButton />
      <main className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-800 to-blue-900 p-4 md:p-8 pt-16">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
            ⚡ Glitch NFT Studio
          </h1>
          <p className="text-blue-100 text-lg font-medium">
            Create, mint, and share retro glitch art NFTs on Base
          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {hasImage && <WalletInfoPanel />}
            
            {hasImage && isInFarcaster && (
              <div className="mb-4 p-4 bg-yellow-500/30 border-2 border-yellow-400/50 rounded-lg shadow-lg">
                <p className="text-sm text-yellow-50 text-center font-bold leading-relaxed">
                  ℹ️ Downloads aren't available in embedded apps due to browser security restrictions.<br />
                  <span className="text-yellow-100">Click "Open in Browser" below to download your glitch art!</span>
                </p>
              </div>
            )}
            {hasImage && (
              <div className="flex justify-between">
                <Button
                  type="button"
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="border-white bg-white/20 hover:bg-white/30 active:scale-95 active:bg-purple-700 text-white font-bold shadow-lg transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="font-bold text-white">{isInFarcaster ? 'Open in Browser' : 'Download'}</span>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white bg-white/20 hover:bg-white/30 text-white font-bold shadow-lg"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      <span className="font-bold text-white">Change Picture</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-blue-900/95 border-white/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-blue-100">
                        This will reset all effects and remove the current image. You will need to upload or capture a new image.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-2 border-white/50 hover:bg-white/20 bg-transparent text-white font-bold shadow-lg">
                        <span className="font-bold text-white">Cancel</span>
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleChangePicture}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                      >
                        <span className="font-bold text-white">Yes, Change Picture</span>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            
            <GlitchEditor
              effectStates={effectStates}
              onImageProcessed={setProcessedImageUrl}
              onImageLoaded={setHasImage}
              resetTrigger={resetTrigger}
            />
            
            {processedImageUrl && hasImage && (
              <ShareButtons
                imageDataUrl={processedImageUrl}
                onShare={() => console.log('Shared on Based!')}
                onSuccessfulPost={handleChangePicture}
              />
            )}
          </div>

          {hasImage && (
            <div className="space-y-6">
              <GlitchControls
                effectStates={effectStates}
                onEffectChange={handleEffectChange}
                onReset={handleReset}
              />
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="font-bold text-white">RGB Split</div>
              <div className="text-xs text-blue-100">Color separation</div>
            </div>
            <div className="p-3 rounded bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="font-bold text-white">Scan Lines</div>
              <div className="text-xs text-blue-100">CRT monitor</div>
            </div>
            <div className="p-3 rounded bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="font-bold text-white">VHS</div>
              <div className="text-xs text-blue-100">Analog tape</div>
            </div>
            <div className="p-3 rounded bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="font-bold text-white">Chromatic</div>
              <div className="text-xs text-blue-100">Color fringing</div>
            </div>
            <div className="p-3 rounded bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="font-bold text-white">Corruption</div>
              <div className="text-xs text-blue-100">Data moshing</div>
            </div>
            <div className="p-3 rounded bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="font-bold text-white">Color Shift</div>
              <div className="text-xs text-blue-100">Hue rotation</div>
            </div>
            <div className="p-3 rounded bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="font-bold text-white">Glitch Bars</div>
              <div className="text-xs text-blue-100">Displacement</div>
            </div>
            <div className="p-3 rounded bg-white/10 border border-white/20 backdrop-blur-sm">
              <div className="font-bold text-white">Bit Crush</div>
              <div className="text-xs text-blue-100">Reduced depth</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 pb-8">
          <p className="text-blue-100/80 text-sm font-medium">
            💙 Built for the Based app • Powered by Base network
          </p>
        </div>
      </div>
    </main>
    </>
  );
}
