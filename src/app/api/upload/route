import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📤 Upload endpoint called');
    
    // Check if Vercel Blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('⚠️  BLOB_READ_WRITE_TOKEN environment variable is not configured');
      return NextResponse.json(
        { 
          error: 'Image storage not configured. Please set up Vercel Blob storage.', 
          details: 'BLOB_READ_WRITE_TOKEN environment variable is missing' 
        },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { imageData } = body as { imageData: string };

    if (!imageData || typeof imageData !== 'string') {
      console.error('❌ Invalid image data: missing or wrong type');
      return NextResponse.json(
        { error: 'Invalid image data' },
        { status: 400 }
      );
    }

    // Validate base64 format
    if (!imageData.startsWith('data:image/')) {
      console.error('❌ Invalid image format: does not start with data:image/');
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }

    // Extract base64 data and convert to buffer
    const matches = imageData.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!matches) {
      console.error('❌ Invalid image data format: regex did not match');
      return NextResponse.json(
        { error: 'Invalid image data format' },
        { status: 400 }
      );
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    console.log(`🔄 Converting base64 to buffer (${base64Data.length} chars)`);
    const buffer = Buffer.from(base64Data, 'base64');
    console.log(`✅ Buffer created (${buffer.length} bytes)`);

    // Generate unique filename
    const filename = `glitch-art-${Date.now()}.${mimeType}`;
    console.log(`📁 Uploading as: ${filename}`);

    // Upload to Vercel Blob
    console.log('☁️  Uploading to Vercel Blob...');
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: `image/${mimeType}`,
    });

    console.log('✅ Image uploaded to Vercel Blob:', blob.url);

    // Get the host from the request
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Extract the blob ID from the URL for the preview page
    const urlParts = blob.url.split('/');
    const blobId = urlParts[urlParts.length - 1];
    
    // Return the preview page URL for Farcaster (with metadata)
    // and the direct Vercel Blob URL for other uses
    // Encode the blob URL in the preview URL so the preview page can access it
    const previewUrl = `${baseUrl}/preview/${blobId}?blobUrl=${encodeURIComponent(blob.url)}`;

    return NextResponse.json({ 
      imageUrl: previewUrl,      // Preview URL with metadata for Farcaster
      directImageUrl: blob.url,   // Direct Vercel Blob URL
      id: blobId,
      blobUrl: blob.url           // Include blob URL for reference
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    // Check for specific Vercel Blob errors
    if (errorMessage.includes('BLOB_READ_WRITE_TOKEN')) {
      console.error('⚠️  BLOB_READ_WRITE_TOKEN environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error: Missing blob storage credentials' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to upload image', details: errorMessage },
      { status: 500 }
    );
  }
}
