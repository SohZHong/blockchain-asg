import { matchManager } from "@/abis/MatchManager";
import { BaseTransactionOptions, getContract } from "thirdweb";
import { celoAlfajoresTestnet } from "thirdweb/chains";
import { AddSessionKeyOptions } from "thirdweb/extensions/erc4337";

import { createThirdwebClient } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { Account, SmartWalletOptions } from "thirdweb/wallets";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;

if (!clientId) {
  throw new Error("No client ID provided");
}

export const client = createThirdwebClient({
  clientId: clientId,
});

export const chain = celoAlfajoresTestnet;
export const managerAddress = "0xe0dBc74bB3795f69b763629752c27DF2e58d6f58";
const account = useActiveAccount();

export const managerContract = getContract({
  address: managerAddress,
  chain,
  client,
  abi: matchManager,
});

export const smartWallet = getContract({
  client: client,
  chain,
  address: account?.address as string,
});

export const getSessionKeyOptions = (
  account: Account | undefined
): BaseTransactionOptions<AddSessionKeyOptions> => {
  if (!account) throw new Error("Account not found");

  return {
    contract: smartWallet,
    account: account,
    sessionKeyAddress: "0x42d0c62B46372491F1bb7C494c43A8469EEd5224",
    permissions: {
      approvedTargets: "*",
      nativeTokenLimitPerTransaction: 0.1, // in ETH
      permissionStartTimestamp: new Date(),
      permissionEndTimestamp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
    },
  };
};

// export const sessionKeyOptions: BaseTransactionOptions<AddSessionKeyOptions> = {
//   contract: smartWallet,
//   account: account as Account,
//   sessionKeyAddress: "0x42d0c62B46372491F1bb7C494c43A8469EEd5224",
//   permissions: {
//     approvedTargets: "*",
//     nativeTokenLimitPerTransaction: 0.1, // in
//     permissionStartTimestamp: new Date(),
//     permissionEndTimestamp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
//   },
// };

export const appMetadata = {
  name: "Mystic Kaizer",
  url: "https://example.com",
};

export const accountAbstraction: SmartWalletOptions = {
  chain,
  sponsorGas: true,
};
