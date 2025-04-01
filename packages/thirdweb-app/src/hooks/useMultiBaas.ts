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
import { SendTransactionParameters } from "viem";

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

interface MultiBaasHook {
  getChainStatus: () => Promise<ChainStatus | null>;
  getBattleCounter: () => Promise<number | null>;
  attack: (battleId: number) => Promise<SendTransactionParameters>;
  startBattle: (
    opponent: `0x${string}`,
    player1MinDmg: number,
    player1MaxDmg: number,
    player2MinDmg: number,
    player2MaxDmg: number
  ) => Promise<SendTransactionParameters>;
  getHp: (battleId: number) => Promise<PlayerStatus | null>;
  getBattle: (battleId: number) => Promise<Battle | null>;
  getAttackEvents: () => Promise<Array<Event> | null>;
  getBattleStartedEvents: () => Promise<Array<Event> | null>;
  getBattleEndedEvents: () => Promise<Array<Event> | null>;
  getOrganiserEvent: (targetAddress: `0x${string}`) => Promise<Event | null>;
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

  const attack = useCallback(
    async (battleId: number): Promise<SendTransactionParameters> => {
      return await callContractFunction(
        "attack",
        matchAddressLabel,
        matchContractLabel,
        [battleId]
      );
    },
    [callContractFunction, matchAddressLabel, matchContractLabel]
  );

  const startBattle = useCallback(
    async (
      opponent: `0x${string}`,
      player1MinDmg: number,
      player1MaxDmg: number,
      player2MinDmg: number,
      player2MaxDmg: number
    ): Promise<SendTransactionParameters> => {
      return await callContractFunction(
        "startBattle",
        matchAddressLabel,
        matchContractLabel,
        [opponent, player1MinDmg, player1MaxDmg, player2MinDmg, player2MaxDmg]
      );
    },
    [callContractFunction, matchAddressLabel, matchContractLabel]
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
        // Ensure we have results
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
        console.log(matchedEvent);
        return matchedEvent || null; // Return event or null if not found
      } catch (err) {
        console.error("Error getting organizer events:", err);
        return null;
      }
    },
    [eventsApi, chain, organiserAddressLabel, organiserContractLabel]
  );

  return {
    getChainStatus,
    getBattleCounter,
    attack,
    startBattle,
    getHp,
    getBattle,
    getAttackEvents,
    getBattleStartedEvents,
    getBattleEndedEvents,
    getOrganiserEvent,
  };
};

export default useMultiBaasWithThirdweb;
