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
const managerAddress = "0xaBbd0129C6d83e54fFe8DF446A8F4964550dB1AC";
const nftAddress = "0xc61BF2E3cD2E9C25619aAb85f516E7160f4e31c0";

// Contract for organiser management
const organiserAddress = "0xfa1946ae5c5cc2b07419d307f727484b52c9a6c1";
// Contract for event factory
const eventFactoryAddress = "0x05e75f1c03b6dd8dfac975c699ef692bbba718d9";

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
