'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
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
import { Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { NFT_CONTRACT_ADDRESS, GLITCH_NFT_ABI } from '@/lib/nft-minting';
import { baseSepolia } from 'viem/chains';


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
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [metadataUri, setMetadataUri] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const { writeContract, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Reset state when modal opens
useEffect(() => {
  if (isOpen) {
    setNftName('');
    setNftDescription('');
    setMetadataUri(null);
    setTxHash(null);
  }
}, [isOpen]);

// Handle successful confirmation
useEffect(() => {
  if (isConfirmed && txHash) {
    toast.success('NFT minted successfully!', { id: 'mint-toast' });
    if (onMintSuccess) onMintSuccess();
    setTimeout(() => {
      onClose();
    }, 1500);
  }
}, [isConfirmed, txHash, onMintSuccess, onClose]);

  const handleUpload = async (): Promise<string | null> => {
    if (!nftName.trim()) {
      toast.error('Please enter a name for your NFT');
      return null;
    }

    setIsUploading(true);
    toast.loading('Uploading to IPFS...', { id: 'mint-toast' });

    try {
      const resp = await fetch(imageUrl);
      const blob = await resp.blob();

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
        throw new Error((errorData as { error?: string }).error || 'Upload failed');
      }

      const data = await uploadResponse.json() as { metadataUri?: string; metadataGateway?: string };
      toast.success('Uploaded to IPFS!', { id: 'mint-toast' });
      
      return data.metadataUri || null;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Upload failed';
      toast.error(`Upload failed: ${msg}`, { id: 'mint-toast' });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleMint = async (): Promise<void> => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Upload first if not done
    let uri = metadataUri;
    if (!uri) {
      uri = await handleUpload();
      if (!uri) return;
      setMetadataUri(uri);
    }

    toast.loading('Confirm transaction in wallet...', { id: 'mint-toast' });

    try {
      writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: GLITCH_NFT_ABI,
        functionName: 'safeMint',
        args: [address, uri],
        chainId: baseSepolia.id,
      }, {
        onSuccess: (hash) => {
          setTxHash(hash);
          toast.loading('Minting NFT...', { id: 'mint-toast' });
        },
        onError: (error) => {
          const msg = error.message || 'Transaction failed';
          if (msg.includes('User rejected')) {
            toast.error('Transaction rejected', { id: 'mint-toast' });
          } else {
            toast.error(`Mint failed: ${msg}`, { id: 'mint-toast' });
          }
        },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Mint failed: ${msg}`, { id: 'mint-toast' });
    }
  };

  const isLoading = isUploading || isWriting || isConfirming;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-blue-900 to-purple-900 border-2 border-purple-400/50 max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-white text-2xl">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Mint Your Glitch Art
          </DialogTitle>
          <DialogDescription className="text-blue-100">
            Create an NFT of your glitch creation on Base Sepolia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
          {/* Preview */}
          <div className="rounded-lg overflow-hidden border-2 border-purple-400/30 bg-black/20">
            <Image 
              src={imageUrl} 
              alt="Glitch art preview" 
              className="w-full h-auto" 
              width={500} 
              height={500} 
              unoptimized 
            />
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
              onChange={(e) => setNftName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              disabled={isLoading}
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
              onChange={(e) => setNftDescription(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              disabled={isLoading}
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

          {/* Transaction Status */}
          {txHash && (
            <div className="p-3 bg-blue-500/20 border border-blue-400/50 rounded-lg">
              <p className="text-sm text-blue-100 mb-2">
                {isConfirming ? '⏳ Confirming transaction...' : '✅ Transaction submitted!'}
              </p>
              <a
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-300 hover:text-blue-200 underline flex items-center gap-1"
              >
                View on BaseScan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 flex-shrink-0 pt-4 border-t border-white/10 bg-gradient-to-br from-blue-900 to-purple-900">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-white/50 bg-white/10 hover:bg-white/20 text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleMint}
            disabled={isLoading || !isConnected || !nftName.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : isWriting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirm in Wallet...
              </>
            ) : isConfirming ? (
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