import React from "react";
import { ConnectButton } from "thirdweb/react";
import { accountAbstraction, appMetadata, client } from "../../constants";

export default function ThirdWebConnectButton() {
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
