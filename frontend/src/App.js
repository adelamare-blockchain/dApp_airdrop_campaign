// Librairies
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import KECCAK256 from 'keccak256';
import MerkleTree from 'merkletreejs';
import { Buffer } from 'buffer/';
import './App.css';

// Components
import artifact from './artifacts/contracts/Airdrop.sol/Airdrop.json';
const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

window.Buffer = window.Buffer || Buffer;

// FUNCTION APP
function App() {
  // VARIABLES
  // Variable 1 - useStates
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);
  const [tree, setTree] = useState(undefined);
  const [proof, setProof] = useState([]);

  // Variable 2 - useEffect (Component didMount)
  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(
        window.ethereum
      );
      setProvider(provider);

      const contract = await new ethers.Contract(
        CONTRACT_ADDRESS,
        artifact.abi,
        provider
      );
      setContract(contract);

      const tree = await getTree();
      setTree(tree);
    };
    onLoad();
  }, []);

  // Function 1 - isConnected
  const isConnected = () => signer !== undefined;

  // Function 2 - connect to metamask
  const connect = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        getSigner(provider).then((signer) => {
          setSigner(signer);
        });
      } else {
        console.error('Metamask not found.');
      }
    } catch (error) {
      console.error('Error connecting to Metamask:', error);
    }
  };

  // Function 3 - get merkle Tree
  const getTree = async () => {
    const indexedAddresses = require('./walletAddresses.json');

    const addresses = [];
    Object.keys(indexedAddresses).forEach(function (idx) {
      addresses.push(indexedAddresses[idx]);
    });

    const leaves = addresses.map((x) => KECCAK256(x));
    const tree = new MerkleTree(leaves, KECCAK256, {
      sortPairs: true,
    });

    return tree;
  };

  // Function 4 - get Signer/provider
  const getSigner = async (provider) => {
    const signer = provider.getSigner();

    await signer.getAddress().then((address) => {
      setSignerAddress(address);

      const proof = tree.getHexProof(KECCAK256(address));
      setProof(proof);
    });

    return signer;
  };

  // Function 5 - claim Airdrop
  const claimAirdrop = async () => {
    await contract.connect(signer).claim(proof);
  };

  // RENDU JSX
  return (
    <div className='App'>
      <header className='App-header'>
        {isConnected() ? (
          <div>
            <p>Welcome {signerAddress?.substring(0, 10)}...</p>
            <div className='list-group'>
              <div className='list-group-item'>
                <button
                  className='btn btn-success'
                  onClick={() => claimAirdrop()}>
                  Claim
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p>You are not connected</p>
            <button onClick={connect} className='btn btn-primary'>
              Connect Metamask
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
