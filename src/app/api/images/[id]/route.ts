import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    // Construct the Vercel Blob URL
    const blobUrl = `https://${process.env.BLOB_READ_WRITE_TOKEN?.split('_')[1]}.public.blob.vercel-storage.com/${id}`;

    console.log('Fetching image from Vercel Blob:', blobUrl);

    // Redirect to the Vercel Blob URL
    // Note: In @vercel/blob v2.0.0, the head() function was removed
    // The blob URL is publicly accessible, so we can redirect directly
    return NextResponse.redirect(blobUrl, 302);
  } catch (error) {
    console.error('Image serve error:', error);
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    );
  }
}
