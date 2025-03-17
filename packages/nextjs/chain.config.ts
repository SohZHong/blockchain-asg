import {
  CHAIN_NAMESPACES,
  CustomChainConfig,
  WEB3AUTH_NETWORK_TYPE,
} from '@web3auth/base';
import { WEB3AUTH_NETWORK } from '@web3auth/base';

interface ChainConfig extends CustomChainConfig {
  web3AuthNetwork: WEB3AUTH_NETWORK_TYPE;
}

const chainConfig: ChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0xaef3', // hex of 44787, celo testnet
  rpcTarget: 'https://rpc.ankr.com/celo',
  // Avoid using public rpcTarget in production.
  // Use services like Infura, Quicknode etc
  displayName: 'Celo Testnet',
  blockExplorerUrl: 'https://alfajores-blockscout.celo-testnet.org',
  ticker: 'CELO',
  tickerName: 'CELO',
  logo: 'https://cryptologos.cc/logos/celo-celo-logo.png',
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
};

export default chainConfig;
