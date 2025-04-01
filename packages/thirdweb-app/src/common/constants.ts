import { celoAlfajoresTestnet } from "thirdweb/chains";

// Chain
const chain = celoAlfajoresTestnet;

// To sponsor gas
const sponsorGas: boolean = true;

// App Metadata
const appName = "Mystic Kaizer";
const appUrl = "https://example.com";

// Contract for match making
const managerAddress = "0xe0dBc74bB3795f69b763629752c27DF2e58d6f58";
// Contract for organiser management
const organiserAddress = "0xfb8672FDF496B66FB81b43B1b1cF1938CA7fb71e";
// Contract for event factory
const eventFactoryAddress = "0x8f986dBE23523cDEC3d4d69124b5ff250EdE9C36";

export {
  chain,
  sponsorGas,
  appName,
  appUrl,
  managerAddress,
  organiserAddress,
  eventFactoryAddress,
};
