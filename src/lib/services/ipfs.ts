//stackblitz-kamelen-teen/src/lib/services/ipfs.ts
/**
 * Kleine helper om een image-Blob naar NFT.storage te sturen.
 * Return: { cid, ipfsUri, gateway }
 *
 * Let op: Deze helper is optioneel, want je flow gebruikt nu de API-route
 * /api/upload-nft-metadata. Gebruik deze alleen als je elders los wilt uploaden.
 */
export async function uploadToIPFSWithNFTStorage(file: Blob) {
  const token = process.env.NFT_STORAGE_TOKEN
  if (!token) throw new Error('NFT_STORAGE_TOKEN is not configured')

  const res = await fetch('https://api.nft.storage/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: file,
  })

  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`NFT.storage upload failed: ${res.status} ${t}`)
  }

  const json = await res.json()
  const cid = json?.value?.cid as string
  if (!cid) throw new Error('NFT.storage response missing CID')

  return {
    cid,
    ipfsUri: `ipfs://${cid}`,
    gateway: `https://ipfs.io/ipfs/${cid}`,
  }
}