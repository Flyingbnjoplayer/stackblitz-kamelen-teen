import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Ì≥ç Deployer address:', deployer.address);
  console.log('');
  console.log('Ì∫∞ Copy this address and get test ETH from:');
  console.log('   https://www.alchemy.com/faucets/base-sepolia');
}

main().catch(console.error);
