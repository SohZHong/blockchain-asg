import chainConfig from '@/chain.config';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { rainbowkitBurnerWallet } from 'burner-connector';
import {
  metaMaskWallet,
  walletConnectWallet,
  ledgerWallet,
  coinbaseWallet,
  rainbowWallet,
  safeWallet,
} from '@rainbow-me/rainbowkit/wallets';

import * as chains from 'wagmi/chains';

const { onlyLocalBurnerWallet, targetNetworks } = chainConfig;

const wallets = [
  metaMaskWallet,
  walletConnectWallet,
  ledgerWallet,
  coinbaseWallet,
  rainbowWallet,
  safeWallet,
  ...(!targetNetworks.some(
    (network) => network.id !== (chains.hardhat as chains.Chain).id
  ) || !onlyLocalBurnerWallet
    ? [rainbowkitBurnerWallet]
    : []),
];

export const wagmiConnector = connectorsForWallets(
  [
    {
      groupName: 'Supported Wallets',
      wallets,
    },
  ],

  {
    appName: 'Mystic Kaizer',
    projectId: chainConfig.walletConnectProjectId,
  }
);
