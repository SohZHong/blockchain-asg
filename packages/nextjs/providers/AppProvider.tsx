'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
import {
  Web3AuthProvider,
  Web3AuthInnerContext,
} from '@web3auth/modal-react-hooks';
import { WalletServicesProvider } from '@web3auth/wallet-services-plugin-react-hooks';
import { web3AuthContextConfig } from '@/web3auth.config';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <WalletServicesProvider context={Web3AuthInnerContext}>
        <QueryClientProvider client={queryClient}>
          <main>{children}</main>
        </QueryClientProvider>
      </WalletServicesProvider>
    </Web3AuthProvider>
  );
}
