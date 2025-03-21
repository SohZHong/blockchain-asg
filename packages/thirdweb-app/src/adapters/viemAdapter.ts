import { viemAdapter } from "thirdweb/adapters/viem";
import { client } from "@/app/client";
import { celoAlfajoresTestnet } from "thirdweb/chains";
import { Wallet } from "thirdweb/wallets";

// convert a thirdweb account to viem wallet client
export const getViemClientWallet = (wallet: Wallet) => {
  const viemClientWallet = viemAdapter.wallet.toViem({
    client,
    chain: celoAlfajoresTestnet,
    wallet,
  });
  return viemClientWallet;
};

// convert a thirdweb account to viem public client
export const getViemPublicClient = () => {
  const publicClient = viemAdapter.publicClient.toViem({
    chain: celoAlfajoresTestnet,
    client,
  });
  return publicClient;
};
