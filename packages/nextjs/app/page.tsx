'use client';

import { Button } from '@/components/ui/button';
import { useWeb3Auth } from '@web3auth/modal-react-hooks';
import { useWalletServicesPlugin } from '@web3auth/wallet-services-plugin-react-hooks';

export default function Home() {
  const {
    provider,
    web3Auth,
    isConnected,
    connect,
    authenticateUser,
    logout,
    addChain,
    switchChain,
    userInfo,
    isMFAEnabled,
    enableMFA,
    status,
    addAndSwitchChain,
  } = useWeb3Auth();
  const {
    showCheckout,
    showWalletConnectScanner,
    showWalletUI,
    showSwap,
    isPluginConnected,
  } = useWalletServicesPlugin();

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold mb-4'>Web3Auth + Celo Alfajores</h1>
      {provider ? (
        <>
          <p className='text-green-500'>✅ Logged In</p>
          <Button
            className='bg-red-500 text-white px-4 py-2 mt-4'
            onClick={() => logout()}
          >
            Logout
          </Button>
        </>
      ) : (
        <Button className='bg-blue-500 text-white px-4 py-2' onClick={connect}>
          Login with Web3Auth
        </Button>
      )}
    </div>
  );
}
