import { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { getWalletClient } from '@wagmi/core';
import { FACTORIES } from '@/common/factories';
import { SimpleAccountAPI } from '@account-abstraction/sdk';
import { Paymaster } from '@/lib/Paymaster';
import { ENTRYPOINT_ADDRESS } from '@/common/constants';
import { wagmiConfig } from '@/services/wagmi/wagmiConfig';

export function useAAProvider() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const [aaWallet, setAAWallet] = useState<SimpleAccountAPI | null>(null);

  useEffect(() => {
    async function setupAA() {
      try {
        if (!isConnected || !address) return;

        const walletClient = await getWalletClient(wagmiConfig);

        const account = walletClient.account; // This is an EOA account

        // Get the factory address based on the chainId
        const factoryAddress = FACTORIES[chainId];
        if (!factoryAddress)
          throw new Error(`No factory for chainId: ${chainId}`);

        // Initialize Paymaster API
        const paymasterAPI = new Paymaster([address!]);

        // Create the AA Wallet
        const aaWalletInstance = new SimpleAccountAPI({
          provider: connector.getProvider(),
          entryPointAddress: ENTRYPOINT_ADDRESS,
          owner: account,
          factoryAddress,
          paymasterAPI,
        });

        setAAWallet(aaWalletInstance);
      } catch (error) {
        console.error('Error setting up AA Wallet:', error);
      }
    }

    setupAA();
  }, [isConnected, chainId]);

  return { aaWallet };
}
