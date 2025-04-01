"use client";

import { matchManager } from "@/abis/MatchManager";
import { useMemo } from "react";
import {
  BaseTransactionOptions,
  ContractOptions,
  createThirdwebClient,
  getContract,
  ThirdwebClient,
} from "thirdweb";
import { ChainOptions } from "thirdweb/chains";
import { AddSessionKeyOptions } from "thirdweb/extensions/erc4337";
import { useActiveAccount } from "thirdweb/react";
import { Account, SmartWalletOptions } from "thirdweb/wallets";
import {
  appName,
  appUrl,
  chain,
  eventFactoryAddress,
  managerAddress,
  organiserAddress,
  sponsorGas,
} from "@/common/constants";
import { organiserPass } from "@/abis/OrganiserPass";
import { eventFactory } from "@/abis/EventFactory";

interface AppMetadata {
  name: string;
  url: string;
}

interface ThirdWebHook {
  client: ThirdwebClient;
  chain: ChainOptions;
  account: Account | null;
  managerContract: Readonly<ContractOptions<any, `0x${string}`>> | null;
  organiserContract: Readonly<ContractOptions<any, `0x${string}`>> | null;
  eventFactoryContract: Readonly<ContractOptions<any, `0x${string}`>> | null;
  smartWallet: Readonly<ContractOptions<any, `0x${string}`>> | null;
  accountAbstraction: SmartWalletOptions;
  appMetadata: AppMetadata;
  sessionKeyOptions: BaseTransactionOptions<AddSessionKeyOptions> | null;
}

export const useThirdWeb = (): ThirdWebHook => {
  const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID as string;
  const engineWallet = process.env
    .NEXT_PUBLIC_THIRDWEB_ENGINE_WALLET_ADDRESS as string;

  const client = useMemo(() => createThirdwebClient({ clientId }), [clientId]);

  const account = useActiveAccount() || null;

  const managerContract = useMemo(() => {
    if (!client) return null;
    return getContract({
      address: managerAddress,
      chain,
      client,
      abi: matchManager,
    });
  }, [managerAddress, chain, client, matchManager]);

  const organiserContract = useMemo(() => {
    if (!client) return null;
    return getContract({
      address: organiserAddress,
      chain,
      client,
      abi: organiserPass,
    });
  }, [organiserAddress, chain, client, organiserPass]);

  const eventFactoryContract = useMemo(() => {
    if (!client) return null;
    return getContract({
      address: eventFactoryAddress,
      chain,
      client,
      abi: eventFactory,
    });
  }, [eventFactoryAddress, chain, client, eventFactory]);

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

  const sessionKeyOptions: BaseTransactionOptions<AddSessionKeyOptions> | null =
    useMemo(() => {
      if (!smartWallet || !account || !engineWallet) return null;
      return {
        contract: smartWallet,
        account: account,
        sessionKeyAddress: engineWallet,
        permissions: {
          approvedTargets: "*",
          nativeTokenLimitPerTransaction: 0.1, // in ETH
          permissionStartTimestamp: new Date(),
          permissionEndTimestamp: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 365
          ), // 1 year
        },
      };
    }, [smartWallet, account, engineWallet]);

  return {
    client,
    chain,
    account,
    managerContract,
    organiserContract,
    eventFactoryContract,
    smartWallet,
    accountAbstraction,
    appMetadata,
    sessionKeyOptions,
  };
};
