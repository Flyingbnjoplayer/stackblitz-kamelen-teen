import { Address, createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

// Deployed contract address on Base Sepolia
export const NFT_CONTRACT_ADDRESS: Address = '0xF7C220DfdD7c9957566807a69ED33f65E5fD9917';

// Contract ABI (only the functions we need)
export const GLITCH_NFT_ABI = [
  {
    inputs: [
      { name: 'initialOwner', type: 'address' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'uri', type: 'string' }
    ],
    name: 'safeMint',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'tokensOfOwner',
    outputs: [{ name: 'tokenIds', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: false, name: 'tokenURI', type: 'string' }
    ],
    name: 'GlitchArtMinted',
    type: 'event'
  }
] as const;

// Mint result type
export interface MintResult {
  success: boolean;
  tokenId?: bigint;
  transactionHash?: string;
  error?: string;
}

/**
 * Mint a glitch art NFT
 */
export async function mintNFT(
  walletAddress: Address,
  metadataUri: string,
  walletClient: any
): Promise<MintResult> {
  try {
    if (!walletClient) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (!metadataUri) {
      return { success: false, error: 'Metadata URI is required' };
    }

    console.log('Ìæ® Minting NFT...');
    console.log('Ì≥ù Contract:', NFT_CONTRACT_ADDRESS);
    console.log('Ì±§ Recipient:', walletAddress);
    console.log('Ì¥ó Metadata:', metadataUri);

    const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://sepolia.base.org';

    // Simulate the contract call first
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport

# Update the nft-minting.ts file with the fix
cat > src/lib/nft-minting.ts << 'ENDOFFILE'
import { Address, createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

// Deployed contract address on Base Sepolia
export const NFT_CONTRACT_ADDRESS: Address = '0xF7C220DfdD7c9957566807a69ED33f65E5fD9917';

// Contract ABI (only the functions we need)
export const GLITCH_NFT_ABI = [
  {
    inputs: [
      { name: 'initialOwner', type: 'address' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'uri', type: 'string' }
    ],
    name: 'safeMint',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'tokensOfOwner',
    outputs: [{ name: 'tokenIds', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: false, name: 'tokenURI', type: 'string' }
    ],
    name: 'GlitchArtMinted',
    type: 'event'
  }
] as const;

// Mint result type
export interface MintResult {
  success: boolean;
  tokenId?: bigint;
  transactionHash?: string;
  error?: string;
}

/**
 * Mint a glitch art NFT
 */
export async function mintNFT(
  walletAddress: Address,
  metadataUri: string,
  walletClient: any
): Promise<MintResult> {
  try {
    if (!walletClient) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (!metadataUri) {
      return { success: false, error: 'Metadata URI is required' };
    }

    console.log('Ìæ® Minting NFT...');
    console.log('Ì≥ù Contract:', NFT_CONTRACT_ADDRESS);
    console.log('Ì±§ Recipient:', walletAddress);
    console.log('Ì¥ó Metadata:', metadataUri);

    const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://sepolia.base.org';

    // Simulate the contract call first
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl)
    });

    const { request } = await publicClient.simulateContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: GLITCH_NFT_ABI,
      functionName: 'safeMint',
      args: [walletAddress, metadataUri],
      account: walletAddress
    });

    // Execute the transaction
    const hash = await walletClient.writeContract(request);

    console.log('‚è≥ Transaction submitted:', hash);

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Parse the GlitchArtMinted event to get tokenId
    const mintEvent = receipt.logs.find((log) => {
      return log.address.toLowerCase() === NFT_CONTRACT_ADDRESS.toLowerCase();
    });

    let tokenId: bigint | undefined;
    if (mintEvent && mintEvent.topics[2]) {
      tokenId = BigInt(mintEvent.topics[2]);
    }

    console.log('‚úÖ NFT minted successfully!');
    console.log('Ì∂î Token ID:', tokenId?.toString());
    console.log('Ì≥Ñ Tx:', `https://sepolia.basescan.org/tx/${hash}`);

    return {
      success: true,
      tokenId,
      transactionHash: hash
    };

  } catch (error: unknown) {
    console.error('‚ùå Minting failed:', error);
    
    let errorMessage = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    if (typeof errorMessage === 'string') {
      if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas. Please add more ETH to your wallet.';
      } else if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (errorMessage.includes('execution reverted')) {
        errorMessage = 'Transaction failed. Please try again.';
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get all NFTs owned by an address
 */
export async function getNFTsByOwner(ownerAddress: Address): Promise<bigint[]> {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://sepolia.base.org';
    
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl)
    });

    const tokenIds = await publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: GLITCH_NFT_ABI,
      functionName: 'tokensOfOwner',
      args: [ownerAddress]
    });

    return tokenIds as bigint[];
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}

/**
 * Get the total supply of minted NFTs
 */
export async function getTotalSupply(): Promise<bigint> {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://sepolia.base.org';
    
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl)
    });

    const supply = await publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: GLITCH_NFT_ABI,
      functionName: 'totalSupply'
    });

    return supply as bigint;
  } catch (error) {
    console.error('Error fetching total supply:', error);
    return BigInt(0);
  }
}
