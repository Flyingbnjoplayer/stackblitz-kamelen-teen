# NFT Minting Setup Guide

## Overview

Your Glitch NFT Studio app is now equipped with NFT minting functionality using OnchainKit and Base network. However, to enable actual on-chain minting, you need to deploy an ERC-721 NFT contract.

## Current Status

✅ **What's Working:**
- Metadata upload to Vercel Blob
- Image storage and NFT metadata preparation
- OnchainKit integration for transaction building
- Wallet connectivity (Coinbase, MetaMask, etc.)

⚠️ **What's Needed:**
- Deploy an ERC-721 contract on Base network
- Update the contract address in the code

## Quick Start

### Option 1: Using Zora (Recommended - Easiest)

1. Visit [https://zora.co/create](https://zora.co/create)
2. Connect your wallet
3. Click "Create a new contract"
4. Choose "ERC-721" (standard NFT collection)
5. Fill in your collection details:
   - Name: "Glitch Art Collection" (or your preferred name)
   - Symbol: "GLITCH" (or your preferred symbol)
   - Description: Your collection description
6. Deploy on **Base** network (not Ethereum mainnet)
7. Wait for deployment confirmation
8. Copy your contract address (looks like: `0x1234...5678`)
9. Update `src/lib/nft-minting.ts`:
   ```typescript
   export const NFT_CONTRACT_ADDRESS: Address = '0xYOUR_CONTRACT_ADDRESS_HERE';
   ```

### Option 2: Using thirdweb

1. Visit [https://thirdweb.com/dashboard](https://thirdweb.com/dashboard)
2. Click "Deploy new contract"
3. Choose "NFT Collection" (ERC-721)
4. Configure your collection settings
5. Deploy on **Base** network
6. Copy the contract address
7. Update `src/lib/nft-minting.ts` with the address

### Option 3: Custom Smart Contract Deployment

If you want full control over your NFT contract, you can deploy a custom ERC-721 contract using Hardhat or Foundry.

#### Example Contract (OpenZeppelin)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GlitchNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    constructor() ERC721("Glitch Art", "GLITCH") Ownable(msg.sender) {}
    
    function mint(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }
}
```

#### Deployment Steps

1. Install Hardhat: `npm install --save-dev hardhat`
2. Create the contract in `contracts/GlitchNFT.sol`
3. Configure `hardhat.config.js` for Base network:
   ```javascript
   module.exports = {
     networks: {
       base: {
         url: "https://mainnet.base.org",
         accounts: [process.env.PRIVATE_KEY],
       },
     },
   };
   ```
4. Deploy: `npx hardhat run scripts/deploy.js --network base`
5. Copy the deployed contract address
6. Update `src/lib/nft-minting.ts`

## Configuration

After deploying your contract, update the configuration:

```typescript
// src/lib/nft-minting.ts
export const NFT_CONTRACT_ADDRESS: Address = '0xYOUR_DEPLOYED_CONTRACT_ADDRESS';
```

## Environment Variables

Make sure you have these environment variables set up:

```env
# Vercel Blob Storage (for image/metadata uploads)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# OnchainKit (for Base network integration)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_coinbase_api_key
NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID=your_project_id
```

### Getting Vercel Blob Token

1. Go to your Vercel project settings
2. Navigate to "Storage"
3. Create a new Blob store
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Add it to your environment variables

### Getting OnchainKit Keys

1. Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com/products/onchainkit)
2. Create a new project
3. Copy your API Key and Project ID
4. Add them to your environment variables

## Testing

After configuration:

1. Connect your wallet to the app
2. Apply glitch effects to an image
3. Click "Mint as NFT"
4. Fill in the NFT name and description
5. Confirm the transaction in your wallet

## Troubleshooting

### "NFT contract not configured" warning

**Solution:** Update `NFT_CONTRACT_ADDRESS` in `src/lib/nft-minting.ts`

### "Image storage not configured" error

**Solution:** Set up Vercel Blob storage and add `BLOB_READ_WRITE_TOKEN` to your environment variables

### Transaction failing

**Possible causes:**
- Insufficient gas fees (make sure you have ETH on Base)
- Contract not properly deployed
- Incorrect contract address
- Network mismatch (ensure you're on Base network)

## API Reference

### `mintNFT(params)`

Mints an NFT on Base using the deployed contract.

```typescript
import { mintNFT } from '@/lib/nft-minting';

const result = await mintNFT({
  walletAddress: '0x...',
  metadataUri: 'https://...',
  name: 'My Glitch Art',
  description: 'Created with Glitch NFT Studio',
  quantity: 1,
});
```

### `uploadAndMintNFT()`

Convenience function that uploads metadata and mints in one call.

```typescript
import { uploadAndMintNFT } from '@/lib/nft-minting';

const result = await uploadAndMintNFT(
  imageBlob,
  'NFT Name',
  'NFT Description',
  walletAddress
);
```

## Resources

- [Zora Documentation](https://docs.zora.co/)
- [thirdweb Documentation](https://portal.thirdweb.com/)
- [OnchainKit Documentation](https://onchainkit.xyz/)
- [Base Network Documentation](https://docs.base.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## Support

For issues or questions:
- Check the console logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure your wallet has sufficient ETH on Base for gas fees
- Confirm your NFT contract is deployed and verified on Base

## Next Steps

1. Deploy your NFT contract using one of the methods above
2. Update the contract address in the code
3. Test minting with a sample image
4. Share your glitch art on Farcaster!
