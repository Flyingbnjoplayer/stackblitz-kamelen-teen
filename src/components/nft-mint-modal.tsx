//stackblitz-kamelen-teen/src/components/nft-mint-modal.tsx
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';

export type NFTMintModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onMintSuccess?: () => void;
};

export function NFTMintModal({
  isOpen,
  onClose,
  imageUrl,
  onMintSuccess,
}: NFTMintModalProps) {
  const { address, isConnected } = useAccount();
  const [nftName, setNftName] = useState<string>('');
  const [nftDescription, setNftDescription] = useState<string>('');
  const [isMinting, setIsMinting] = useState<boolean>(false);

  const handleMint = async (): Promise<void> => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!nftName.trim()) {
      toast.error('Please enter a name for your NFT');
      return;
    }

    setIsMinting(true);

    try {
      toast.loading('Uploading your glitch art...', { id: 'mint-toast' });

      // 1) Image ophalen
      const resp = await fetch(imageUrl);
      const blob = await resp.blob();

      // 2) Metadata upload via jouw bestaande endpoint
      const formData = new FormData();
      formData.append('file', blob, 'glitch-art.png');
      formData.append('name', nftName);
      formData.append('description', nftDescription || 'Glitch art created on Base');

      const uploadResponse = await fetch('/api/upload-nft-metadata', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: 'Upload failed' }));
        const errorMsg = (errorData as { error?: string }).error || 'Failed to upload NFT metadata';
        throw new Error(errorMsg);
      }

      const { metadataUri } = await uploadResponse.json();

      toast.message('Metadata uploaded. Signing mint...', { id: 'mint-toast' });

      // 3) (Tijdelijk) server endpoint aanroepen – placeholder tot contract klaar is
      const mintResponse = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadataUri,
          walletAddress: address,
          name: nftName,
          description: nftDescription,
        }),
      });

      if (!mintResponse.ok) {
        const errorData = await mintResponse.json().catch(() => ({}));
        const msg = (errorData as { error?: string }).error || 'Mint API failed';
        throw new Error(msg);
      }

      const mintJson = await mintResponse.json();

      // 🔜 Zodra je contract + ABI hebt, vervangen we dit stuk door wagmi useWriteContract:
      // const { writeContractAsync } = useWriteContract();
      // await writeContractAsync({
      //   address: CONTRACT_ADDRESS,
      //   abi: GLITCH_NFT_ABI,
      //   functionName: 'mint', // of 'safeMint', afhankelijk van jouw contract
      //   args: [address, metadataUri],
      // });

      toast.success('✅ Mint request accepted. Configure on-chain write to complete.', {
        id: 'mint-toast',
        duration: 5000,
      });

      if (onMintSuccess) onMintSuccess();

      setNftName('');
      setNftDescription('');
      onClose();

      // Extra feedback in console voor debugging
      console.debug('Mint API response:', mintJson);
    } catch (error) {
      console.error('Minting error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      let displayMsg = errorMsg;
      if (
        errorMsg.includes('Image storage not configured') ||
        errorMsg.includes('BLOB_READ_WRITE_TOKEN')
      ) {
        displayMsg =
          '⚠️ Image storage not configured. Please set up Vercel Blob in your project settings to mint NFTs.';
      }

      toast.error(`Failed to mint NFT: ${displayMsg}`, { id: 'mint-toast', duration: 6000 });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-blue-900 to-purple-900 border-2 border-purple-400/50 max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-white text-2xl">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Mint Your Glitch Art
          </DialogTitle>
          <DialogDescription className="text-blue-100">
            Create an NFT of your glitch creation on Base Network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
          {/* Preview */}
          <div className="rounded-lg overflow-hidden border-2 border-purple-400/30 bg-black/20">
            <img src={imageUrl} alt="Glitch art preview" className="w-full h-auto" />
          </div>

          {/* NFT Name */}
          <div className="space-y-2">
            <Label htmlFor="nft-name" className="text-white font-bold">
              NFT Name *
            </Label>
            <Input
              id="nft-name"
              placeholder="e.g., Glitch Dreams #1"
              value={nftName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNftName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              disabled={isMinting}
            />
          </div>

          {/* NFT Description */}
          <div className="space-y-2">
            <Label htmlFor="nft-description" className="text-white font-bold">
              Description (Optional)
            </Label>
            <Input
              id="nft-description"
              placeholder="Describe your artwork..."
              value={nftDescription}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNftDescription(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              disabled={isMinting}
            />
          </div>

          {/* Wallet Status */}
          {!isConnected && (
            <div className="p-3 bg-yellow-500/20 border border-yellow-400/50 rounded-lg">
              <p className="text-sm text-yellow-100">⚠️ Please connect your wallet to mint NFTs</p>
            </div>
          )}

          {isConnected && address && (
            <div className="p-3 bg-green-500/20 border border-green-400/50 rounded-lg">
              <p className="text-sm text-green-100">
                ✅ Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 flex-shrink-0 pt-4 border-t border-white/10 sticky bottom-0 bg-gradient-to-br from-blue-900 to-purple-900">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isMinting}
            className="border-white/50 bg-white/10 hover:bg-white/20 text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleMint}
            disabled={isMinting || !isConnected || !nftName.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
          >
            {isMinting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Minting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Mint NFT
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
``