'use client';

import * as React from 'react';
import {
  Web3AuthProvider,
  Web3AuthInnerContext,
} from '@web3auth/modal-react-hooks';
import { WalletServicesProvider } from '@web3auth/wallet-services-plugin-react-hooks';
import { web3AuthContextConfig } from '@/web3auth.config';

export function Web3AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <WalletServicesProvider context={Web3AuthInnerContext}>
        {children}
      </WalletServicesProvider>
    </Web3AuthProvider>
  );
}
