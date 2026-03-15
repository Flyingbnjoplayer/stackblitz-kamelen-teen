const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('íº€ Deploying GlitchNFT contract...');
  console.log('í³ Deployer address:', deployer.address);

  const balance = await deployer.getBalance();
  console.log('í²° Balance:', ethers.utils.formatEther(balance), 'ETH');

  if (balance.isZero()) {
    console.error('âŒ Insufficient balance. Please fund your wallet on Base Sepolia.');
    console.log('íº° Get test ETH: https://www.alchemy.com/faucets/base-sepolia');
    process.exit(1);
  }

  const GlitchNFT = await ethers.getContractFactory('GlitchNFT');
  console.log('â³ Deploying contract...');
  
  const contract = await GlitchNFT.deploy(deployer.address);
  await contract.deployed();

  console.log('âœ… GlitchNFT deployed to:', contract.address);
  console.log('');
  console.log('í³‹ Add this to your .env.local:');
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${contract.address}`);
  console.log('');
  console.log('í´ View on Basescan:');
  console.log(`https://sepolia.basescan.org/address/${contract.address}`);

  return contract.address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
