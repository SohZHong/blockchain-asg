import { client } from "@/app/client";
import React from "react";
import { celoAlfajoresTestnet } from "thirdweb/chains";
import { ConnectButton } from "thirdweb/react";

export default function ThirdWebConnectButton() {
  return (
    <React.Fragment>
      <ConnectButton
        client={client}
        appMetadata={{
          name: "Mystic Kaizer",
          url: "https://example.com",
        }}
        accountAbstraction={{
          chain: celoAlfajoresTestnet,
          sponsorGas: true,
        }}
      />
    </React.Fragment>
  );
}
