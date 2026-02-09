//stackblitz-kamelen-teen/src/app/api/upload-nft-metadata/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// Forceer Node.js runtime (nodig voor process.env en blob streams)
export const runtime = 'nodejs'

/**
 * POST /api/upload-nft-metadata
 * FormData:
 *  - file: File (image/png|jpeg|webp)
 *  - name: string
 *  - description?: string
 *
 * Werking:
 * 1) Als NFT.storage token aanwezig is:
 *    - upload image → krijg imageCid
 *    - bouw metadata → upload metadata JSON → krijg metadataCid
 *    - return ipfs:// URI's (+ gateway fallback)
 * 2) Anders, als Vercel Blob token aanwezig is:
 *    - upload image + metadata naar Blob (HTTP URL's)
 * 3) Anders → duidelijke foutmelding over ontbrekende configuratie
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const name = (formData.get('name') as string | null)?.trim()
    const description = (formData.get('description') as string | null)?.trim() ?? 'Glitch art created on Base'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!name) {
      return NextResponse.json({ error: 'No name provided' }, { status: 400 })
    }

    const NFT_TOKEN = process.env.NFT_STORAGE_TOKEN
    const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

    // ========= Path A: NFT.storage (voorkeur) =========
    if (NFT_TOKEN) {
      // 1) Image → NFT.storage
      const imageUpload = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NFT_TOKEN}`,
        },
        body: file, // direct de file (multipart niet vereist; body mag bytes/Blob zijn)
      })

      if (!imageUpload.ok) {
        const errText = await imageUpload.text().catch(() => '')
        throw new Error(`NFT.storage image upload failed: ${imageUpload.status} ${errText}`)
      }
      const imageJson = await imageUpload.json()
      const imageCid = imageJson?.value?.cid as string
      if (!imageCid) throw new Error('NFT.storage response missing image CID')

      const imageIpfsUri = `ipfs://${imageCid}`
      const imageGateway = `https://ipfs.io/ipfs/${imageCid}`

      // 2) Metadata JSON → NFT.storage
      const metadata = {
        name,
        description,
        image: imageIpfsUri, // ipfs:// preferred
        attributes: [
          { trait_type: 'Type', value: 'Glitch Art' },
          { trait_type: 'Created With', value: 'Glitch Photo Editor' },
          { trait_type: 'Network', value: 'Base' },
          { trait_type: 'Timestamp', value: new Date().toISOString() },
        ],
      }

      const metadataUpload = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NFT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      })

      if (!metadataUpload.ok) {
        const errText = await metadataUpload.text().catch(() => '')
        throw new Error(`NFT.storage metadata upload failed: ${metadataUpload.status} ${errText}`)
      }
      const metadataJson = await metadataUpload.json()
      const metadataCid = metadataJson?.value?.cid as string
      if (!metadataCid) throw new Error('NFT.storage response missing metadata CID')

      const metadataIpfsUri = `ipfs://${metadataCid}`
      const metadataGateway = `https://ipfs.io/ipfs/${metadataCid}`

      return NextResponse.json({
        success: true,
        storage: 'nft.storage',
        imageUri: imageIpfsUri,
        imageGateway,
        metadataUri: metadataIpfsUri,
        metadataGateway,
        metadata,
      })
    }

    // ========= Path B: Vercel Blob (fallback) =========
    if (BLOB_TOKEN) {
      const imageBlob = await put(`nft-images/${Date.now()}-${file.name}`, file, {
        access: 'public',
      })

      const metadata = {
        name,
        description,
        image: imageBlob.url, // http(s) URL
        attributes: [
          { trait_type: 'Type', value: 'Glitch Art' },
          { trait_type: 'Created With', value: 'Glitch Photo Editor' },
          { trait_type: 'Network', value: 'Base' },
          { trait_type: 'Timestamp', value: new Date().toISOString() },
        ],
      }

      const metadataBlob = await put(
        `nft-metadata/${Date.now()}-metadata.json`,
        JSON.stringify(metadata),
        { access: 'public', contentType: 'application/json' },
      )

      return NextResponse.json({
        success: true,
        storage: 'vercel-blob',
        imageUri: imageBlob.url,
        metadataUri: metadataBlob.url,
        metadata,
      })
    }

    // Geen van beide tokens aanwezig
    return NextResponse.json(
      {
        error:
          'No storage is configured. Set NFT_STORAGE_TOKEN for NFT.storage (preferred) or BLOB_READ_WRITE_TOKEN for Vercel Blob.',
      },
      { status: 500 },
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ upload-nft-metadata error:', msg)
    return NextResponse.json({ error: 'Failed to upload NFT metadata', details: msg }, { status: 500 })
  }
}