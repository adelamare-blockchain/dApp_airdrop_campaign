const { MerkleTree } = require('merkletreejs');
const KECCAK256 = require('keccak256');
const { expect } = require('chai');

describe('Airdrop Smart contract tests', () => {
  beforeEach(async () => {
    // Obtenir les signers des contrats déployés
    [owner, signer1, signer2, signer3, ...signer] =
      await ethers.getSigners();

    // Obtenir les addresses du merkle tree pour créer l'arbre de merkle
    walletAddresses = [
      owner,
      signer1,
      signer2,
      signer3,
      ...signer,
    ].map((s) => s.address);

    leaves = walletAddresses.map((x) => KECCAK256(x));

    tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });

    // Déployer le contrat Token
    Token = await ethers.getContractFactory('Token', owner);
    token = await Token.deploy('TokenName', 'TKN');

    // Déployer le contrat Airdrop
    Airdrop = await ethers.getContractFactory('Airdrop', owner);
    airdrop = await Airdrop.deploy(
      token.address,
      tree.getHexRoot(),
      500
    );

    await token.connect(owner).mint(airdrop.address, '1000000');
  });

  it('should deploy the smart contract', async () => {
    it('should deploy the smart contract', async () => {
      // Vérifier que le propriétaire du contrat est correctement défini
      expect(await airdrop.owner()).to.equal(owner.address);

      // Vérifier que l'adresse du token est correctement définie
      expect(await airdrop.tokenAddress()).to.equal(token.address);

      // Vérifier que la racine du merkle tree est correctement définie
      expect(await airdrop.merkleRoot()).to.equal(tree.getHexRoot());

      // Vérifier que le montant du airdrop est correctement défini
      expect(await airdrop.airdropAmount()).to.equal(500);

      // Vérifier que le solde du contrat Token a été correctement initialisé
      expect(await token.balanceOf(airdrop.address)).to.equal(
        1000000
      );
    });
  });

  describe('Function claim', () => {
    it('should create a successful and an unsuccessful claim', async () => {
      // Check 1 : solde de signer1 initialisé à 0
      expect(await token.balanceOf(signer1.address)).to.be.equal(0);

      // Génération d'une preuve de merkle valide
      const proof = tree.getHexProof(KECCAK256(signer1.address));

      // Réclamer l'airdrop pour la première fois
      await airdrop.connect(signer1).claim(proof);
      expect(await token.balanceOf(signer1.address)).to.be.equal(500);

      // Réclamer l'airdrop une deuxième fois (échec attendu)
      await expect(
        airdrop.connect(signer1).claim(proof)
      ).to.be.revertedWith('Airdrop already claimed.');

      // Vérifier que le solde du compte n'a pas changé
      expect(await token.balanceOf(signer1.address)).to.be.equal(500);
    });

    it('should create an unsuccessful claim', async () => {
      // Check 1 : solde de signer2 initialisé à 0
      expect(await token.balanceOf(signer2.address)).to.be.equal(0);

      // Génération d'une preuve de merkle invalide
      const invalidProof = tree.getHexProof(
        KECCAK256(signer3.address)
      );

      // Réclamer l'airdrop avec une preuve invalide
      await expect(
        airdrop.connect(signer2).claim(invalidProof)
      ).to.be.revertedWith('Incorrect merkle proof');

      // Vérifiez que le solde de signer2 n'a pas changé
      expect(await token.balanceOf(signer2.address)).to.be.equal(0);
    });

    it('should emit a successful event', async () => {
      const proof = tree.getHexProof(KECCAK256(signer1.address));

      await expect(airdrop.connect(signer1).claim(proof))
        .to.emit(airdrop, 'Claimed')
        .withArgs(signer1.address, 500);
    });
  });

  describe('Function getContractBalance', () => {
    it('should return the correct contract balance', async () => {
      const contractBalance = await airdrop.getContractBalance();
      const tokenBalance = await token.balanceOf(airdrop.address);

      expect(contractBalance).to.equal(tokenBalance);
    });
  });
});
