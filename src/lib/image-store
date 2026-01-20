// Shared in-memory image store for demo
// In production, use proper cloud storage like Vercel Blob, S3, or Cloudinary

export type ImageStoreData = {
  data: string;
  timestamp: number;
};

declare global {
  // eslint-disable-next-line no-var
  var imageStore: Map<string, ImageStoreData> | undefined;
}

// Initialize or reuse the global store
export const imageStore = global.imageStore || new Map<string, ImageStoreData>();

if (!global.imageStore) {
  global.imageStore = imageStore;
}

// Clean up old images (older than 24 hours)
const EXPIRY_TIME = 24 * 60 * 60 * 1000;

export function cleanupOldImages(): void {
  const now = Date.now();
  for (const [id, data] of imageStore.entries()) {
    if (now - data.timestamp > EXPIRY_TIME) {
      imageStore.delete(id);
    }
  }
}
