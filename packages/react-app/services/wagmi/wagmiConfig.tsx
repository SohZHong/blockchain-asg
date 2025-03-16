import { wagmiConnector } from './wagmiConnector';
import { Chain, createClient, fallback, http } from 'viem';
import { hardhat, mainnet } from 'wagmi/chains';
import { createConfig } from 'wagmi';
import chainConfig from '@/chain.config';

const { targetNetworks } = chainConfig;

export const enabledChains = targetNetworks.find(
  (network: Chain) => network.id === 1
)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

export const wagmiConfig = createConfig({
  chains: enabledChains,
  connectors: wagmiConnector,
  ssr: true,
  client({ chain }) {
    let rpcFallbacks = [http()];

    return createClient({
      chain,
      transport: fallback(rpcFallbacks),
      ...(chain.id !== (hardhat as Chain).id
        ? {
            pollingInterval: chainConfig.pollingInterval,
          }
        : {}),
    });
  },
});
