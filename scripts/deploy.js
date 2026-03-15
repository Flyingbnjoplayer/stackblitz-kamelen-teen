import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('íº€ Deploying GlitchNFT contract...');
  console.log('í³ Deployer address:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('í²° Balance:', ethers.formatEther(balance), 'ETH');

  if (balance === 0n) {
    console.error('âŒ Insufficient balance. Please fund your wallet on Base Sepolia.');
    console.log('íº° Get test ETH: https://www.alchemy.com/faucets/base-sepolia');
    process.exit(1);
  }

  const GlitchNFT = await ethers.getContractFactory('GlitchNFT');
  const contract = await GlitchNFT.deploy(deployer.address);

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('âœ… GlitchNFT deployed to:', address);
  console.log('');
  console.log('í³‹ Add this to your .env.local:');
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${address}`);
  console.log('');
  console.log('í´ View on Basescan:');
  console.log(`https://sepolia.basescan.org/address/${address}`);

  return address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
