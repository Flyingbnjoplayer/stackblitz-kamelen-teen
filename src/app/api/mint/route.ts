//stackblitz-kamelen-teen/src/app/api/mint/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/mint
 * Body: { metadataUri: string, walletAddress: string, name?: string, description?: string }
 *
 * ⚠️ Server kan NIET signen met de wallet van de gebruiker.
 * Echte mint doe je client-side via wagmi/viem (user signature).
 * Deze endpoint is optioneel voor boekhouding, webhook, analytics, etc.
 *
 * TODO (zodra je contract + ABI klaar is):
 *  - OF: verplaats de write naar de client met wagmi useWriteContract
 *  - OF: implementeer een "relayer" met server-signing (alleen als je dat wilt)
 */
export async function POST(req: NextRequest) {
  try {
    const { metadataUri, walletAddress, name, description } = await req.json();

    if (!metadataUri || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: metadataUri, walletAddress' },
        { status: 400 }
      );
    }

    // Placeholder response – hier kun je later analytics aan koppelen
    return NextResponse.json({
      success: true,
      message:
        'Mint request received. Configure client-side wagmi write with your ERC-721 contract to complete the mint.',
      metadataUri,
      walletAddress,
      name,
      description,
    });
  } catch (error) {
    console.error('Mint error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to mint NFT' },
      { status: 500 }
    );
  }
}