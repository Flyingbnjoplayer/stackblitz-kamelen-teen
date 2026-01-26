```typescript
export async function uploadToIPFS(imageData: string): Promise<string> {
  // For now, using a public IPFS gateway
  // You might want to use a service like Pinata, NFT.Storage, or Web3.Storage
  
  try {
    // Convert base64 to blob
    const base64Data = imageData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    // Use a free IPFS pinning service
    // Example with NFT.Storage (you'll need an API key)
    const formData = new FormData();
    formData.append('file', blob);

    const response = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NFT_STORAGE_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS');
    }

    const data = await response.json();
    return data.value.cid; // Returns the IPFS CID
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
}
```
