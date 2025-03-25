"use client";

import { matchManager } from "@/abis/MatchManager";
import { useMemo } from "react";
import {
  ContractOptions,
  createThirdwebClient,
  getContract,
  ThirdwebClient,
} from "thirdweb";
import { celoAlfajoresTestnet, ChainOptions } from "thirdweb/chains";
import { useActiveAccount } from "thirdweb/react";
import { Account, SmartWalletOptions } from "thirdweb/wallets";

interface AppMetadata {
  name: string;
  url: string;
}

interface ThirdWebHook {
  client: ThirdwebClient;
  chain: ChainOptions;
  account: Account | null;
  managerContract: Readonly<ContractOptions<any, `0x${string}`>> | null;
  smartWallet: Readonly<ContractOptions<any, `0x${string}`>> | null;
  accountAbstraction: SmartWalletOptions;
  appMetadata: AppMetadata;
}

export const useThirdWeb = (): ThirdWebHook => {
  const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID as string;
  const managerAddress = "0xe0dBc74bB3795f69b763629752c27DF2e58d6f58";

  const appName = "Mystic Kaizer";
  const appUrl = "https://example.com";

  const client = useMemo(() => createThirdwebClient({ clientId }), [clientId]);

  const chain = celoAlfajoresTestnet;
  const account = useActiveAccount() || null;
  const sponsorGas: boolean = true;

  const managerContract = useMemo(() => {
    if (!client) return null;
    return getContract({
      address: managerAddress,
      chain,
      client,
      abi: matchManager,
    });
  }, [managerAddress, chain, client, matchManager]);

  const smartWallet = useMemo(() => {
    if (!client || !account?.address) return null;
    return getContract({
      client,
      chain,
      address: account.address,
    });
  }, [client, chain, account]);

  const accountAbstraction: SmartWalletOptions | null = useMemo(() => {
    return {
      chain,
      sponsorGas,
    };
  }, [sponsorGas, chain]);

  const appMetadata: AppMetadata = useMemo(() => {
    return {
      name: appName,
      url: appUrl,
    };
  }, [appName, appUrl]);

  return {
    client,
    chain,
    account,
    managerContract,
    smartWallet,
    accountAbstraction,
    appMetadata,
  };
};
