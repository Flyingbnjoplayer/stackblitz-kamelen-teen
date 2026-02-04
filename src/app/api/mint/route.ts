import { NextRequest, NextResponse } from 'next/server';
import { uploadToIPFS } from '../../../lib/services/ipfs';
import { mintNFT } from '../../../lib/services/ohara';

export async function POST(req: NextRequest) {
  try {
    const { imageData, walletAddress, name, description } = await req.json();

    if (!imageData || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload image to IPFS
    const imageUrl = await uploadToIPFS(imageData);

    // Mint NFT using Ohara
    const transactionHash = await mintNFT(
      imageUrl,
      walletAddress,
      name,
      description
    );

    return NextResponse.json({
      success: true,
      transactionHash,
      imageUrl,
    });
  } catch (error) {
    console.error('Mint error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to mint NFT' },
      { status: 500 }
    );
  }
}




