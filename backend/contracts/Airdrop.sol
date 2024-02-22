// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
// import "hardhat/console.sol";

contract Airdrop {
    // VARIABLES
    address public immutable owner; // Adresse du propriétaire du contrat

    address public immutable tokenAddress; // Addresse du token
    bytes32 public immutable merkleRoot; // Racine du merkle tree 
    uint256 public immutable airdropAmount; // Montant du airdrop
    
    // Mapping des users airdroppés
    mapping(address => bool) private claimedAddresses;
    
    // EVENT
    event Claimed(address indexed _from, uint256 _aidropAmount);

    // Constructor du smart contract
    constructor(address _tokenAddress, bytes32 _merkleRoot, uint256 _airdropAmount) {
        require(_tokenAddress != address(0), "Address du token invalide");
        tokenAddress = _tokenAddress;
        merkleRoot = _merkleRoot;
        airdropAmount = _airdropAmount;
        owner = msg.sender;
    }

    // Function 1 : claimAirdrop
    function claim(bytes32[] calldata _proof) external {
        // Check si airdrop déjà effectué
        require(!claimedAddresses[msg.sender], "Airdrop already claimed.");
        // require(tokenContract.balanceOf(address(this)) >= airdropAmount, "Not enough tokens in the contract");

        // Modification de l'état du airdrop à effectuer
        claimedAddresses[msg.sender] = true;

        // Check verify proof (preuve de merkle)
        _verifyProof(msg.sender, _proof);
        
        // Modification de l'event
        emit Claimed(msg.sender, airdropAmount);
        
        // Envoi des tokens au msg.sender
        require(IERC20(tokenAddress).transfer(msg.sender, airdropAmount), "MerkleProof transfer failed");
    }

    // Function 2 : récupération du solde du contrat (tokens non distribués)
    function getContractBalance() external view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    // Function 3 (internal): verification de la preuve de merkle
    function _verifyProof(address _user, bytes32[] memory _proof) private view {
        bytes32 leaf = keccak256(abi.encodePacked(_user));
        require(MerkleProof.verify(_proof, merkleRoot, leaf), "Incorrect merkle proof");
    }

}