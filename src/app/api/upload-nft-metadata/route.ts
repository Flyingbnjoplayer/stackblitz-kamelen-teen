import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const name = (formData.get('name') as string | null)?.trim();
    const description = (formData.get('description') as string | null)?.trim() ?? 'Glitch art created on Base';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!name) return NextResponse.json({ error: 'No name provided' }, { status: 400 });

    const PINATA_JWT = process.env.PINATA_JWT;
    const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

    if (PINATA_JWT) {
      console.log('Uploading image to Pinata...');
      const imageFormData = new FormData();
      imageFormData.append('file', file);

      const imageUpload = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${PINATA_JWT}` },
        body: imageFormData,
      });

      if (!imageUpload.ok) throw new Error(`Pinata image upload failed: ${imageUpload.status}`);

      const imageResult = await imageUpload.json();
      const imageCid = (imageResult as any).IpfsHash;
      console.log('Image uploaded:', imageCid);

      const metadata = {
        name,
        description,
        image: `ipfs://${imageCid}`,
        attributes: [
          { trait_type: 'Type', value: 'Glitch Art' },
          { trait_type: 'Created With', value: 'Glitch Photo Editor' },
          { trait_type: 'Network', value: 'Base' },
          { trait_type: 'Timestamp', value: new Date().toISOString() },
        ],
      };

      const metadataUpload = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: { Authorization: `Bearer ${PINATA_JWT}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });

      if (!metadataUpload.ok) throw new Error(`Pinata metadata upload failed: ${metadataUpload.status}`);

      const metadataResult = await metadataUpload.json();
      const metadataCid = (metadataResult as any).IpfsHash;
      console.log('Metadata uploaded:', metadataCid);

      return NextResponse.json({
        success: true,
        storage: 'pinata',
        imageUri: `ipfs://${imageCid}`,
        imageGateway: `https://gateway.pinata.cloud/ipfs/${imageCid}`,
        metadataUri: `ipfs://${metadataCid}`,
        metadataGateway: `https://gateway.pinata.cloud/ipfs/${metadataCid}`,
        metadata,
      });
    }

    if (BLOB_TOKEN) {
      console.log('Uploading to Vercel Blob...');
      const imageBlob = await put(`nft-images/${Date.now()}-${file.name}`, file, { access: 'public' });

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

      const metadataBlob = await put(`nft-metadata/${Date.now()}-metadata.json`, JSON.stringify(metadata), { access: 'public', contentType: 'application/json' });

      return NextResponse.json({ success: true, storage: 'vercel-blob', imageUri: imageBlob.url, metadataUri: metadataBlob.url, metadata });
    }

    return NextResponse.json({ error: 'No storage configured. Set PINATA_JWT or BLOB_READ_WRITE_TOKEN.' }, { status: 500 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Upload error:', msg);
    return NextResponse.json({ error: 'Failed to upload NFT metadata', details: msg }, { status: 500 });
  }
}