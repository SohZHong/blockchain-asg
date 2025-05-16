import React from "react";
import { ConnectButton } from "thirdweb/react";
import { useThirdWeb } from "@/hooks/useThirdWeb";

export default function ThirdWebConnectButton() {
    const { client, appMetadata, accountAbstraction } = useThirdWeb();
  return (
    <React.Fragment>
      <ConnectButton
        client={client}
        appMetadata={appMetadata}
        accountAbstraction={accountAbstraction}
      />
    </React.Fragment>
  );
}
