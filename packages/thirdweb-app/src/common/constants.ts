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
const nftAddress = "0xc61BF2E3cD2E9C25619aAb85f516E7160f4e31c0";

export { chain, sponsorGas, appName, appUrl, managerAddress, nftAddress };
