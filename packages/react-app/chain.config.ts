import * as chains from 'wagmi/chains';

export type ChainConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

const chainConfig = {
  // The networks on which the DApp is live
  targetNetworks: [chains.celoAlfajores],

  // The interval at which your front-end polls the RPC servers for new data
  pollingInterval: 30000,

  walletConnectProjectId:
    process.env.WC_PROJECT_ID || '3a8170812b534d0ff9d794f19a901d64',

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,
} as const satisfies ChainConfig;

export default chainConfig;
