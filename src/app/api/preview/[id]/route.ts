import { NextRequest, NextResponse } from 'next/server';
import { head } from '@vercel/blob';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    // Construct the Vercel Blob URL
    const blobUrl = `https://${process.env.BLOB_READ_WRITE_TOKEN?.split('_')[1]}.public.blob.vercel-storage.com/${id}`;

    console.log('Fetching image from Vercel Blob:', blobUrl);

    // Verify the blob exists
    try {
      await head(blobUrl);
    } catch (error) {
      console.error('Blob not found:', error);
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Redirect to the Vercel Blob URL
    return NextResponse.redirect(blobUrl, 302);
  } catch (error) {
    console.error('Image serve error:', error);
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    );
  }
}
