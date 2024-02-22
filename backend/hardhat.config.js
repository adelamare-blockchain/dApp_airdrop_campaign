require('@nomiclabs/hardhat-waffle');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.19',
    defaultNetwork: 'hardhat',
    networks: {
      hardhat: {},
      localhost: {
        url: 'http://127.0.0.1:8545',
        chainId: 31337,
      },
      mumbai: {
        url: 'https://rpc-mumbai.maticvigil.com/',
        accounts: [`0x${process.env.PRIVATE_KEY}`],
      },
      mumbai2: {
        url: 'https://rpc.ankr.com/polygon_mumbai',
        accounts: [`0x${process.env.PRIVATE_KEY}`],
      },
      mumbai3: {
        url: 'https://polygon-testnet.public.blastapi.io',
        accounts: [`0x${process.env.PRIVATE_KEY}`],
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    artifacts: '../frontend/src/artifacts',
  },
};
