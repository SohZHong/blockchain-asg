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
const managerAddress = "0xe0dBc74bB3795f69b763629752c27DF2e58d6f58";
// Contract for organiser management
const organiserAddress = "0xfb8672FDF496B66FB81b43B1b1cF1938CA7fb71e";
// Contract for event factory
const eventFactoryAddress = "0x26cdc1B349e50A8793Cbd1C5749334Bb39CccD62";

export {
  chain,
  sponsorGas,
  appName,
  appUrl,
  ownerAddress,
  managerAddress,
  organiserAddress,
  eventFactoryAddress,
};
