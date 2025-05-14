"use client";
import {
  Configuration,
  ContractsApi,
  EventsApi,
  ChainsApi,
  PostMethodArgs,
  MethodCallResponse,
  TransactionToSignResponse,
  Event,
} from "@curvegrid/multibaas-sdk";
import { useMemo, useCallback } from "react";
import { useActiveAccount } from "thirdweb/react";

interface ChainStatus {
  chainID: number;
  blockNumber: number;
}

interface PlayerStatus {
  p1HP: number;
  p2HP: number;
}

interface Player {
  address: `0x${string}`;
  minDmg: number;
  maxDmg: number;
}

interface Battle {
  player1: Player;
  player2: Player;
  currentTurn: `0x${string}`;
  active: boolean;
}

interface NFTAttributes {
  trait_type: string;
  value: string;
}
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<NFTAttributes>;
}

interface MultiBaasHook {
  getChainStatus: () => Promise<ChainStatus | null>;
  getBattleCounter: () => Promise<number | null>;
  getHp: (battleId: number) => Promise<PlayerStatus | null>;
  getOrganiserMetadata: (tokenId: number) => Promise<NFTMetadata | null>;
  getBattle: (battleId: number) => Promise<Battle | null>;
  getAttackEvents: () => Promise<Array<Event> | null>;
  getBattleStartedEvents: () => Promise<Array<Event> | null>;
  getBattleEndedEvents: () => Promise<Array<Event> | null>;
  getOrganiserEvent: (targetAddress: `0x${string}`) => Promise<Event | null>;
  getOrganisedEvents: (
    pageNum: number,
    limit: number
  ) => Promise<Array<Event> | null>;
}

const useMultiBaasWithThirdweb = (): MultiBaasHook => {
  const mbBaseUrl = process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL || "";
  const mbApiKey = process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY || "";
  const matchContractLabel =
    process.env.NEXT_PUBLIC_MULTIBAAS_MATCH_CONTRACT_LABEL || "";
  const matchAddressLabel =
    process.env.NEXT_PUBLIC_MULTIBAAS_MATCH_ADDRESS_LABEL || "";
  const organiserContractLabel =
    process.env.NEXT_PUBLIC_MULTIBAAS_ORGANISER_CONTRACT_LABEL || "";
  const organiserAddressLabel =
    process.env.NEXT_PUBLIC_MULTIBAAS_ORGANISER_ADDRESS_LABEL || "";
  const eventFactoryContractLabel =
    process.env.NEXT_PUBLIC_MULTIBAAS_EVENT_FACTORY_CONTRACT_LABEL || "";
  const eventFactoryAddressLabel =
    process.env.NEXT_PUBLIC_MULTIBAAS_EVENT_FACTORY_ADDRESS_LABEL || "";

  const chain = "ethereum";

  const account = useActiveAccount();

  // Initialize MultiBaas
  const mbConfig = useMemo(
    () =>
      new Configuration({
        basePath: new URL("/api/v0", mbBaseUrl).toString(),
        accessToken: mbApiKey,
      }),
    [mbBaseUrl, mbApiKey]
  );
  const contractsApi = useMemo(() => new ContractsApi(mbConfig), [mbConfig]);
  const eventsApi = useMemo(() => new EventsApi(mbConfig), [mbConfig]);
  const chainsApi = useMemo(() => new ChainsApi(mbConfig), [mbConfig]);

  // Get Chain Status
  const getChainStatus = async () => {
    try {
      const response = await chainsApi.getChainStatus(chain);
      return response.data.result;
    } catch (err) {
      console.error("Error getting chain status:", err);
      return null;
    }
  };

  const callContractFunction = useCallback(
    async (
      methodName: string,
      addressLabel: string,
      contractLabel: string,
      args: PostMethodArgs["args"] = []
    ): Promise<
      MethodCallResponse["output"] | TransactionToSignResponse["tx"]
    > => {
      const payload: PostMethodArgs = {
        args,
        contractOverride: true,
      };
      const response = await contractsApi.callContractFunction(
        chain,
        addressLabel,
        contractLabel,
        methodName,
        payload
      );

      if (response.data.result.kind === "MethodCallResponse") {
        return response.data.result.output;
      } else if (response.data.result.kind === "TransactionToSignResponse") {
        return response.data.result.tx;
      } else {
        throw new Error(
          `Unexpected response type: ${response.data.result.kind}`
        );
      }
    },
    [contractsApi, chain, account]
  );

  const getBattleCounter = useCallback(async (): Promise<number | null> => {
    try {
      const result = await callContractFunction(
        "battleCounter",
        matchAddressLabel,
        matchContractLabel
      );
      return result as number;
    } catch (err) {
      console.error("Error getting battle counter:", err);
      return null;
    }
  }, [callContractFunction, matchAddressLabel, matchContractLabel]);

  const getBattle = useCallback(
    async (battleId: number): Promise<Battle | null> => {
      try {
        const result = await callContractFunction(
          "battles",
          matchAddressLabel,
          matchContractLabel,
          [battleId]
        );
        return result as Battle;
      } catch (err) {
        console.error("Error getting battle:", err);
        return null;
      }
    },
    [callContractFunction, matchAddressLabel, matchContractLabel]
  );

  const getHp = useCallback(
    async (battleId: number): Promise<PlayerStatus | null> => {
      try {
        const result = await callContractFunction(
          "getHP",
          matchAddressLabel,
          matchContractLabel,
          [battleId]
        );
        return result as PlayerStatus;
      } catch (err) {
        console.error("Error getting player hp:", err);
        return null;
      }
    },
    [callContractFunction, matchAddressLabel, matchContractLabel]
  );

  const getOrganiserMetadata = useCallback(
    async (tokenId: number): Promise<NFTMetadata | null> => {
      try {
        // Get the tokenURI from the contract
        const tokenURI = await callContractFunction(
          "tokenURI",
          organiserAddressLabel,
          organiserContractLabel,
          [tokenId]
        );

        if (!tokenURI || typeof tokenURI !== "string") {
          console.error("Invalid tokenURI:", tokenURI);
          return null;
        }

        // Convert IPFS URI to HTTP Gateway URL
        const metadataUrl = tokenURI.startsWith("ipfs://")
          ? tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
          : tokenURI;

        // Fetch metadata from IPFS
        const response = await fetch(metadataUrl);
        if (!response.ok) {
          console.error("Failed to fetch metadata:", response.statusText);
          return null;
        }

        const metadata: NFTMetadata = await response.json();
        return metadata;
      } catch (error) {
        console.error("Error fetching organiser metadata:", error);
        return null;
      }
    },
    [callContractFunction, organiserAddressLabel, organiserContractLabel]
  );

  const getAttackEvents =
    useCallback(async (): Promise<Array<Event> | null> => {
      try {
        const eventSignature =
          "Attack(uint256,address,uint256,address,uint256)";
        const response = await eventsApi.listEvents(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          false,
          chain,
          matchAddressLabel,
          matchContractLabel,
          eventSignature,
          50
        );

        return response.data.result;
      } catch (err) {
        console.error("Error getting attack events:", err);
        return null;
      }
    }, [eventsApi, chain, matchAddressLabel, matchContractLabel]);

  const getBattleStartedEvents =
    useCallback(async (): Promise<Array<Event> | null> => {
      try {
        const eventSignature = "BattleStarted(uint256,address,address)";
        const response = await eventsApi.listEvents(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          false,
          chain,
          matchAddressLabel,
          matchContractLabel,
          eventSignature,
          50
        );

        return response.data.result;
      } catch (err) {
        console.error("Error getting battle started events:", err);
        return null;
      }
    }, [eventsApi, chain, matchAddressLabel, matchContractLabel]);

  const getBattleEndedEvents =
    useCallback(async (): Promise<Array<Event> | null> => {
      try {
        const eventSignature = "BattleEnded(uint256,address)";
        const response = await eventsApi.listEvents(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          false,
          chain,
          matchAddressLabel,
          matchContractLabel,
          eventSignature,
          50
        );

        return response.data.result;
      } catch (err) {
        console.error("Error getting battle ended events:", err);
        return null;
      }
    }, [eventsApi, chain, matchAddressLabel, matchContractLabel]);

  const getOrganiserEvent = useCallback(
    async (targetAddress: string): Promise<Event | null> => {
      try {
        const eventSignature = "OrganizerMinted(address,uint256)";
        const response = await eventsApi.listEvents(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          false,
          chain,
          organiserAddressLabel,
          organiserContractLabel,
          eventSignature,
          50
        );

        if (!response.data.result || response.data.result.length === 0) {
          console.log("No events found");
          return null;
        }

        // Loop through events and find matching organizer
        const matchedEvent = response.data.result.find((event) => {
          return (
            event.event.inputs[0].value.toLowerCase() ===
            targetAddress.toLowerCase()
          );
        });
        return matchedEvent || null; // Return event or null if not found
      } catch (err) {
        console.error("Error getting organizer events:", err);
        return null;
      }
    },
    [eventsApi, chain, organiserAddressLabel, organiserContractLabel]
  );

  const getOrganisedEvents = useCallback(
    async (
      pageNum: number = 1,
      limit: number = 20
    ): Promise<Array<Event> | null> => {
      try {
        const eventSignature = "EventCreated(uint256,address,address)";
        const response = await eventsApi.listEvents(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          false,
          chain,
          eventFactoryAddressLabel,
          eventFactoryContractLabel,
          eventSignature,
          limit,
          (pageNum - 1) * limit
        );
        return response.data.result;
      } catch (err) {
        console.error("Error getting organized events:", err);
        return null;
      }
    },
    [eventsApi, chain, eventFactoryAddressLabel, eventFactoryContractLabel]
  );

  return {
    getChainStatus,
    getBattleCounter,
    getHp,
    getOrganiserMetadata,
    getBattle,
    getAttackEvents,
    getBattleStartedEvents,
    getBattleEndedEvents,
    getOrganiserEvent,
    getOrganisedEvents,
  };
};

export default useMultiBaasWithThirdweb;
