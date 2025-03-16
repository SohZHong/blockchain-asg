import { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { FACTORIES } from '@/common/factories';
import { SimpleAccountAPI } from '@account-abstraction/sdk';
import { Paymaster } from '@/lib/Paymaster';
import { ENTRYPOINT_ADDRESS } from '@/common/constants';
import { Provider } from '@ethersproject/providers';
import { useEthersSigner } from '@/adapters/wagmiToEthers';

export function useAAProvider() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const signer = useEthersSigner();
  const [aaWallet, setAAWallet] = useState<SimpleAccountAPI | null>(null);

  useEffect(() => {
    async function setupAA() {
      try {
        if (!isConnected || !address || !connector || !signer) return;
        // Get the factory address based on the chainId
        const factoryAddress = FACTORIES[chainId];
        if (!factoryAddress)
          throw new Error(`No factory for chainId: ${chainId}`);

        // Initialize Paymaster API
        const paymasterAPI = new Paymaster([address!]);

        // Create the AA Wallet
        const aaWalletInstance = new SimpleAccountAPI({
          provider: (await connector.getProvider()) as Provider,
          entryPointAddress: ENTRYPOINT_ADDRESS,
          owner: signer,
          factoryAddress,
          paymasterAPI,
        });

        setAAWallet(aaWalletInstance);
      } catch (error) {
        console.error('Error setting up AA Wallet:', error);
      }
    }

    setupAA();
  }, [isConnected, chainId, signer]);

  return { aaWallet };
}
