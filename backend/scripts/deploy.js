const { MerkleTree } = require('merkletreejs');
const KECCAK256 = require('keccak256');
const { ethers } = require('hardhat');
const fs = require('fs').promises;

async function main() {
  [owner, signer1, signer2, signer3, ...signer] =
    await ethers.getSigners();
  walletAddresses = [owner, signer1, signer2, signer3, ...signer].map(
    (s) => s.address
  );

  // VARIABLES MERKLE PROOF
  // Variable 1 : leaves
  leaves = walletAddresses.map((x) => KECCAK256(x));

  // Variable 2 : merkle tree
  tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });

  // VARIABLES SMART CONTRACTS
  // Variable 1 : Smart contract token
  Token = await ethers.getContractFactory('Token', owner);
  // Utilisation du paramètre _initialSupply pour la création du token
  token = await Token.deploy('EuronixaToken', 'EURX');
  Airdrop = await ethers.getContractFactory('Airdrop', owner);

  airdrop = await Airdrop.deploy(
    token.address,
    tree.getHexRoot(),
    ethers.utils.parseEther('100')
  );

  await token
    .connect(owner)
    .mint(airdrop.address, ethers.utils.parseEther('1000000'));

  console.log(`Token address: ${token.address}\n`);

  console.log(`Owner address : ${owner.address}\n`);

  console.log(`Airdrop address : ${airdrop.address}\n`);

  console.log(`Signer 1 : ${signer1.address}\n`);
  console.log(`Signer 2 : ${signer2.address}\n`);
  console.log(`Signer 3 : ${signer3.address})`);

  const indexedAddresses = {};
  walletAddresses.map((x, idx) => (indexedAddresses[idx] = x));

  const serializedAddresses = JSON.stringify(indexedAddresses);

  await fs.writeFile(
    '../frontend/src/walletAddresses.json',
    serializedAddresses
  );
}

// npx hardhat run --network localhost scripts/deploy.js

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
