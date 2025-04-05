import { celoAlfajoresTestnet } from "thirdweb/chains";

// Chain
const chain = celoAlfajoresTestnet;

// To sponsor gas
const sponsorGas: boolean = true;

// App Metadata
const appName = "Mystic Kaizer";
const appUrl = "https://example.com";

// Owner address
const ownerAddress = "0x42d0c62B46372491F1bb7C494c43A8469EEd5224";

// Contract for match making
const managerAddress = "0x01d6Fd3d96d715B04932A21868C3b0c97C7aabc2";
const nftAddress = "0xc61BF2E3cD2E9C25619aAb85f516E7160f4e31c0";

// Contract for organiser management
const organiserAddress = "0x8a608cc6b060B865EF35183d0e39C24c5Fc4a731";
// Contract for event factory
const eventFactoryAddress = "0xDA7CAd26299A991F625e1A7f089F8F763ed32F5A";

export {
  chain,
  sponsorGas,
  appName,
  appUrl,
  ownerAddress,
  managerAddress,
  nftAddress,
  organiserAddress,
  eventFactoryAddress,
};
