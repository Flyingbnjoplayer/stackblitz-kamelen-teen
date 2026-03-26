import { Address, createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

// Deployed contract address on Base Sepolia
export const NFT_CONTRACT_ADDRESS: Address = '0xF7C220DfdD7c9957566807a69ED33f65E5fD9917';

// Contract ABI (only the functions we need)
export const GLITCH_NFT_ABI = [
  {
    inputs: [{ name: 'initialOwner', type: 'address' }],
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
  }
] as const;

export interface MintResult {
  success: boolean;
  tokenId?: bigint;
  transactionHash?: string;
  error?: string;
}

export async function getNFTsByOwner(ownerAddress: Address): Promise<bigint[]> {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://sepolia.base.org';
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl)
    });

    return (await publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: GLITCH_NFT_ABI,
      functionName: 'tokensOfOwner',
      args: [ownerAddress]
    })) as bigint[];
  } catch {
    return [];
  }
}

export async function getTotalSupply(): Promise<bigint> {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://sepolia.base.org';
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl)
    });

    return (await publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: GLITCH_NFT_ABI,
      functionName: 'totalSupply'
    })) as bigint;
  } catch {
    return BigInt(0);
  }
}