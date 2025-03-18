import { Web3AuthContextConfig } from '@web3auth/modal-react-hooks';
import { Web3AuthOptions } from '@web3auth/modal';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import {
  CHAIN_NAMESPACES,
  CustomChainConfig,
  WEB3AUTH_NETWORK,
} from '@web3auth/base';
import { AuthAdapter } from '@web3auth/auth-adapter';
import { WalletServicesPlugin } from '@web3auth/wallet-services-plugin';
import { getInjectedAdapters } from '@web3auth/default-evm-adapter';

const chainConfig: CustomChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0xaef3', // hex of 44787, celo testnet
  rpcTarget: 'https://alfajores-forno.celo-testnet.org',
  displayName: 'Celo Testnet',
  blockExplorerUrl: 'https://alfajores.celoscan.io',
  ticker: 'CELO',
  tickerName: 'CELO',
  logo: 'https://cryptologos.cc/logos/celo-celo-logo.png',
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig,
  },
});

const web3AuthOptions: Web3AuthOptions = {
  chainConfig,
  clientId: process.env.NEXT_PUBLIC_W3_CLIENT_ID || '',
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  uiConfig: {
    uxMode: 'redirect',
    appName: 'Mystic Kaizer',
    appUrl: 'https://web3auth.io/',
    theme: {
      primary: '#7ed6df',
    },
    logoLight: 'https://web3auth.io/images/web3authlog.png',
    logoDark: 'https://web3auth.io/images/web3authlogodark.png',
    defaultLanguage: 'en', // en, de, ja, ko, zh, es, fr, pt, nl, tr
    mode: 'auto', // whether to enable dark mode. defaultValue: auto
    useLogoLoader: true,
  },
  privateKeyProvider: privateKeyProvider,
  sessionTime: 86400, // 1 day
  // useCoreKitKey: true,
};

const authAdapter = new AuthAdapter({
  loginSettings: {
    mfaLevel: 'optional',
  },
  adapterSettings: {
    uxMode: 'redirect', // "redirect" | "popup"
    whiteLabel: {
      logoLight: 'https://web3auth.io/images/web3authlog.png',
      logoDark: 'https://web3auth.io/images/web3authlogodark.png',
      defaultLanguage: 'en', // en, de, ja, ko, zh, es, fr, pt, nl, tr
      mode: 'auto', // whether to enable dark, light or auto mode. defaultValue: auto [ system theme]
    },
    mfaSettings: {
      deviceShareFactor: {
        enable: true,
        priority: 1,
        mandatory: true,
      },
      backUpShareFactor: {
        enable: true,
        priority: 2,
        mandatory: false,
      },
      socialBackupFactor: {
        enable: true,
        priority: 3,
        mandatory: false,
      },
      passwordFactor: {
        enable: true,
        priority: 4,
        mandatory: true,
      },
    },
  },
});

const walletServicesPlugin = new WalletServicesPlugin();

const adapters = getInjectedAdapters({ options: web3AuthOptions });
// const adapters = getDefaultExternalAdapters({ options: web3AuthOptions });

export const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
  adapters: [authAdapter, ...adapters],
  plugins: [walletServicesPlugin],
};
