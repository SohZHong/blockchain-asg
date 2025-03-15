import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-verify';
import { config as dotEnvConfig } from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import 'hardhat-multibaas-plugin';

dotEnvConfig();

const config: HardhatUserConfig = {
  defaultNetwork: 'development',
  networks: {
    development: {
      url: `${process.env.MULTIBAAS_DEPLOYMENT_URL}/web3/${process.env.MULTIBAAS_ADMIN_API_KEY}`,
      chainId: 44787,
      accounts: [process.env.PRIVATE_KEY ?? '0x0'],
    },
    alfajores: {
      accounts: [process.env.PRIVATE_KEY ?? '0x0'],
      url: 'https://alfajores-forno.celo-testnet.org',
    },
    celo: {
      accounts: [process.env.PRIVATE_KEY ?? '0x0'],
      url: 'https://forno.celo.org',
    },
  },
  // Configuration for multibaas
  mbConfig: {
    apiKey: process.env.MULTIBAAS_ADMIN_API_KEY ?? '',
    host: process.env.MULTIBAAS_DEPLOYMENT_URL ?? '',
    allowUpdateAddress: ['development'],
    allowUpdateContract: ['development'],
  },
  etherscan: {
    apiKey: {
      alfajores: process.env.CELOSCAN_API_KEY ?? '',
      celo: process.env.CELOSCAN_API_KEY ?? '',
    },
    customChains: [
      {
        chainId: 44_787,
        network: 'alfajores',
        urls: {
          apiURL: 'https://api-alfajores.celoscan.io/api',
          browserURL: 'https://alfajores.celoscan.io',
        },
      },
      {
        chainId: 42_220,
        network: 'celo',
        urls: {
          apiURL: 'https://api.celoscan.io/api',
          browserURL: 'https://celoscan.io/',
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
};

export default config;
