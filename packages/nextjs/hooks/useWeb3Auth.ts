import { Web3Auth } from '@web3auth/modal';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import chainConfig from '@/chain.config';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IProvider } from '@web3auth/base';

interface Web3AuthHook {
  provider: IProvider | null;
  web3auth: Web3Auth | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const useWeb3Auth = (): Web3AuthHook => {
  const clientId: string = process.env.NEXT_PUBLIC_W3_CLIENT_ID || '';
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Initialize Private Key Provider
  const privateKeyProvider = useMemo(() => {
    return new EthereumPrivateKeyProvider({
      config: { chainConfig: chainConfig },
    });
  }, [chainConfig]);

  // Initialize Web3Auth
  const web3authInstance = useMemo(() => {
    return new Web3Auth({
      clientId,
      web3AuthNetwork: chainConfig.web3AuthNetwork,
      privateKeyProvider,
    });
  }, [clientId, chainConfig.web3AuthNetwork]);

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        await web3authInstance.initModal(); // Initialize Web3Auth modal
        setWeb3auth(web3authInstance);
        if (web3authInstance.provider) {
          setProvider(web3authInstance.provider);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Web3Auth initialization failed:', error);
      }
    };

    initWeb3Auth();
  }, [web3authInstance]);

  // Login Function
  const login = useCallback(async () => {
    if (!web3auth) return;
    try {
      const provider = await web3auth.connect();
      setProvider(provider);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
    }
  }, [web3auth]);

  // Logout Function
  const logout = useCallback(async () => {
    if (!web3auth) return;
    try {
      await web3auth.logout();
      setProvider(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [web3auth]);

  return { provider, web3auth, login, logout, isAuthenticated };
};

export default useWeb3Auth;
