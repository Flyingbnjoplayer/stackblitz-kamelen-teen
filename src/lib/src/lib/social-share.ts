//stackblitz-kamelen-teen/src/lib/social-share.ts

/**
 * Uploads an image to Vercel Blob (or your existing upload route) and
 * shares the resulting URL to Warpcast / Based.
 *
 * NOTE:
 * - These placeholder implementations simply open the share URL.
 * - You can replace these later with actual Farcaster cast API calls.
 */

export async function shareToWarpcast(imageBase64: string, text: string) {
  const shareUrl = await uploadShareImage(imageBase64);
  const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(
    text
  )}&embeds[]=${encodeURIComponent(shareUrl)}`;
  window.open(url, "_blank");
}

export async function shareToBase(imageBase64: string, text: string) {
  const shareUrl = await uploadShareImage(imageBase64);
  const url = `https://basedcast.xyz/compose?text=${encodeURIComponent(
    text
  )}&embed=${encodeURIComponent(shareUrl)}`;
  window.open(url, "_blank");
}

/**
 * Converts the in‑browser base64 PNG into a Blob and uploads it.
 * You can replace this function with your Vercel Blob upload or IPFS upload.
 */
async function uploadShareImage(imageBase64: string): Promise<string> {
  const blob = await fetch(imageBase64).then((r) => r.blob());
  const form = new FormData();
  form.append("file", blob, "shared-image.png");

  // Use your existing upload endpoint (recommended)
  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Failed to upload share image");

  const json = await res.json();
  if (!json.url) throw new Error("Upload did not return a URL");

  return json.url as string;
}