import { Metadata } from 'next';
import Image from 'next/image';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ blobUrl?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const { blobUrl: blobUrlParam } = await searchParams;
  
  // Use the blob URL from query params if available, otherwise construct it
  // The blob URL should be passed from the upload endpoint
  const blobUrl = blobUrlParam || `https://${process.env.BLOB_READ_WRITE_TOKEN?.split('_')[1]}.public.blob.vercel-storage.com/${id}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://push-entirely-836.app.ohara.ai';

  return {
    title: 'Glitch Art - Created with Glitch Editor',
    description: '🎨 Check out this glitch art created on Base! ⚡',
    openGraph: {
      title: 'Glitch Art - Created with Glitch Editor',
      description: '🎨 Check out this glitch art created on Base! ⚡',
      images: [
        {
          url: blobUrl,
          width: 1200,
          height: 630,
          alt: 'Glitch Art',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Glitch Art - Created with Glitch Editor',
      description: '🎨 Check out this glitch art created on Base! ⚡',
      images: [blobUrl],
    },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': blobUrl,
      'fc:frame:image:aspect_ratio': '1:1',
      'fc:frame:button:1': 'Create Your Own Glitch Art',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': baseUrl,
    },
  };
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { blobUrl: blobUrlParam } = await searchParams;
  
  // Use the blob URL from query params if available, otherwise construct it
  const blobUrl = blobUrlParam || `https://${process.env.BLOB_READ_WRITE_TOKEN?.split('_')[1]}.public.blob.vercel-storage.com/${id}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://push-entirely-836.app.ohara.ai';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-black/40 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20">
        <h1 className="text-4xl font-bold text-white text-center mb-6">
          🎨 Glitch Art
        </h1>
        
        <div className="relative w-full aspect-square max-w-2xl mx-auto mb-6 rounded-xl overflow-hidden border-2 border-white/30">
          <Image
            src={blobUrl}
            alt="Glitch Art"
            fill
            className="object-contain"
            unoptimized
          />
        </div>

        <p className="text-center text-white/80 text-lg mb-6">
          Created with Glitch Editor on Base ⚡
        </p>

        <div className="flex justify-center">
          <a
            href={baseUrl}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Create Your Own Glitch Art
          </a>
        </div>
      </div>
    </div>
  );
}
