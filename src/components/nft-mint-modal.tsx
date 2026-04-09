'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useChainId } from 'wagmi';
import { useFarcasterWallet } from '@/hooks/useFarcasterWallet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const { address, isConnected } = useFarcasterWallet();
  const [nftName, setNftName] = useState<string>('');
  const [nftDescription, setNftDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [metadataUri, setMetadataUri] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const hasCalledSuccess = useRef(false);
  const lastImageUrl = useRef<string>('');
  const { switchChain } = useSwitchChain();
  const { writeContract, isPending: isWriting } = useWriteContract();

  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // 🔄 Clear transaction state when image URL changes
  useEffect(() => {
    console.log('🔄 Image URL changed, clearing transaction state');
    console.log('  Old:', lastImageUrl.current?.slice(0, 50));
    console.log('  New:', imageUrl?.slice(0, 50));
    
    // Update the ref
    lastImageUrl.current = imageUrl || '';
    
    // Reset transaction state
    setTxHash(undefined);
    hasCalledSuccess.current = false;
  }, [imageUrl]);

  // Restore pending transaction on mount (survives app restart when returning from wallet)
  useEffect(() => {
    const pendingTx = localStorage.getItem('pendingMintTx');
    if (pendingTx) {
      setTxHash(pendingTx as `0x${string}`);
      localStorage.removeItem('pendingMintTx');
    }
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setNftName('');
      setNftDescription('');
      setMetadataUri(null);
      hasCalledSuccess.current = false;
    }
  }, [isOpen]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasCalledSuccess.current = false;
    }
  }, [isOpen]);

  // Handle successful confirmation - with guard to prevent double calls
  useEffect(() => {
    console.log('📋 Mint confirmation check:', { isConfirmed, txHash: txHash?.slice(0, 10), hasCalledSuccess: hasCalledSuccess.current });
    
    if (isConfirmed && txHash && !hasCalledSuccess.current) {
      console.log('✅ Mint confirmed, calling onMintSuccess');
      hasCalledSuccess.current = true;  // Set guard immediately
      setTxHash(undefined);  // Clear txHash to prevent re-firing
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
        throw new Error('Failed to upload metadata');
      }

      const data = await uploadResponse.json() as { metadataUri: string };
      setMetadataUri(data.metadataUri);
      return data.metadataUri;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload NFT metadata', { id: 'mint-toast' });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleMint = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    const uri = await handleUpload();
    if (!uri) return;

    try {
      toast.loading('Minting NFT...', { id: 'mint-toast' });

      if (chainId !== baseSepolia.id) {
        await switchChainAsync?.({ chainId: baseSepolia.id });
      }

      await writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: GLITCH_NFT_ABI,
        functionName: 'safeMint',
        args: [address as `0x${string}`, uri],
      }, {
        onSuccess: (hash) => {
          console.log('Transaction submitted:', hash);
          setTxHash(hash);
          localStorage.setItem('pendingMintTx', hash);
          toast.loading('Confirming transaction...', { id: 'mint-toast' });
        },
        onError: (error) => {
          console.error('Transaction error:', error);
          toast.error('Failed to submit transaction', { id: 'mint-toast' });
        }
      });
    } catch (error) {
      console.error('Mint error:', error);
      toast.error('Failed to mint NFT', { id: 'mint-toast' });
    }
  };

  const isMinting = isUploading || isWriting || isConfirming;

  // Debug logging
  console.log('🔧 NFTMintModal render:', {
    isOpen,
    hasImageUrl: !!imageUrl,
    imageUrlLength: imageUrl?.length,
    address,
    isConnected,
    isMinting,
    isUploading,
    isWriting,
    isConfirming,
    shouldShowButton: !isMinting || isConnected
  });


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-gray-900 border-purple-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Mint Your Glitch Art
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create an NFT of your glitch artwork on Base network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {imageUrl && (
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-white/10">
              <Image
                src={imageUrl}
                alt="Glitch Art Preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nft-name" className="text-white">NFT Name *</Label>
            <Input
              id="nft-name"
              value={nftName}
              onChange={(e) => setNftName(e.target.value)}
              placeholder="My Glitch Art #1"
              className="bg-gray-800 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nft-description" className="text-white">Description</Label>
            <Input
              id="nft-description"
              value={nftDescription}
              onChange={(e) => setNftDescription(e.target.value)}
              placeholder="Created with Glitch Art Studio"
              className="bg-gray-800 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>
        </div>



        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
            disabled={isMinting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMint}
            disabled={isMinting || !isConnected}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isMinting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isUploading ? 'Uploading...' : isWriting ? 'Signing...' : 'Confirming...'}
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