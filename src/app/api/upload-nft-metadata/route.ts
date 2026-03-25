import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

/**
 * POST /api/upload-nft-metadata
 * Uploads image and metadata to IPFS via Pinata (or falls back to Vercel Blob)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const name = (formData.get('name') as string | null)?.trim();
    const description = (formData.get('description') as string | null)?.trim() ?? 'Glitch art created on Base';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'No name provided' }, { status: 400 });
    }

    const PINATA_JWT = process.env.PINATA_JWT;
    const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

    // ========= Path A: Pinata (preferred for IPFS) =========
    if (PINATA_JWT) {
      console.log('Ì≥§ Uploading image to Pinata...');

      // 1) Upload image to Pinata
      const imageFormData = new FormData();
      imageFormData.append('file', file);

      const imageUpload = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: imageFormData,
      });

      if (!imageUpload.ok) {
        const errText = await imageUpload.text().catch(() => '');
        console.error('Pinata image upload failed:', imageUpload.status, errText);
        throw new Error(`Pinata image upload failed: ${imageUpload.status}`);
      }

      const imageResult = await imageUpload.json();
      const imageCid = imageResult.IpfsHash;
      console.log('‚úÖ Image uploaded:', imageCid);

      const imageIpfsUri = `ipfs://${imageCid}`;
      const imageGateway = `https://gateway.pinata.cloud/ipfs/${imageCid}`;

      // 2) Create and upload metadata
      const metadata = {
        name,
        description,
        image: imageIpfsUri,
        attributes: [
          { trait_type: 'Type', value: 'Glitch Art' },
          { trait_type: 'Created With', value: 'Glitch Photo Editor' },
          { trait_type: 'Network', value: 'Base' },
          { trait_type: 'Timestamp', value: new Date().toISOString() },
        ],
      };

      console.log('Ì≥§ Uploading metadata to Pinata...');

      const metadataUpload = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!metadataUpload.ok) {
        const errText = await metadataUpload.text().catch(() => '');
        console.error('Pinata metadata upload failed:', metadataUpload.status, errText);
        throw new Error(`Pinata metadata upload failed: ${metadataUpload.status}`);
      }

      const metadataResult = await metadataUpload.json();
      const metadataCid = metadataResult.IpfsHash;
      console.log('‚úÖ Metadata uploaded:', metadataCid);

      const metadataIpfsUri = `ipfs://${metadataCid}`;
      const metadataGateway = `https://gateway.pinata.cloud/ipfs/${metadataCid}`;

      return NextResponse.json({
        success: true,
        storage: 'pinata',
        imageUri: imageIpfsUri,
        imageGateway,
        metadataUri: metadataIpfsUri,
        metadataGateway,
        metadata,
      });
    }

    // ========= Path B: Vercel Blob (fallback) =========
    if (BLOB_TOKEN) {
      console.log('Ì≥§ Uploading to Vercel Blob...');

      const imageBlob = await put(`nft-images/${Date.now()}-${file.name}`, file, {
        access: 'public',
      });

      const metadata = {
        name,
        description,
        image: imageBlob.url,
        attributes: [
          { trait_type: 'Type', value: 'Glitch Art' },
          { trait_type: 'Created With', value: 'Glitch Photo Editor' },
          { trait_type: 'Network', value: 'Base' },
          { trait_type: 'Timestamp', value: new Date().toISOString() },
        ],
      };

      const metadataBlob = await put(
        `nft-metadata/${Date.now()}-metadata.json`,
        JSON.stringify(metadata),
        { access: 'public', contentType: 'application/json' }
      );

      console.log('‚úÖ Uploaded to Vercel Blob');

      return NextResponse.json({
        success: true,
        storage: 'vercel-blob',
        imageUri: imageBlob.url,
        metadataUri: metadataBlob.url,
        metadata,
      });
    }

    // No storage configured
    return NextResponse.json(
      {
        error: 'No storage configured. Set PINATA_JWT or BLOB_READ_WRITE_TOKEN in .env.local',
      },
      { status: 500 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('‚ùå upload-nft-metadata error:', msg);
    return NextResponse.json(
      { error: 'Failed to upload NFT metadata', details: msg },
      { status: 500 }
    );
  }
}
