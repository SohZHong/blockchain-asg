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
const managerAddress = "0x65F5D6d678dE105e2AB1F28F4433766d757E5573";
const nftAddress = "0xc61BF2E3cD2E9C25619aAb85f516E7160f4e31c0";

// Contract for organiser management
const organiserAddress = "0x8a608cc6b060B865EF35183d0e39C24c5Fc4a731";
// Contract for event factory
const eventFactoryAddress = "0x2DcC812eB80AE506DfB155c193f74f9cf26E6109";

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
