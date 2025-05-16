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
const managerAddress = "0x97f768869a4207DE4450C610A3A5331e36CC3BAd";
// Contract for marketplace
const nftAddress = "0x41Be93E3914e4262dD7A08cEce2f80EB84b8B0e2";

// Contract for organiser management
const organiserAddress = "0xfa1946ae5c5cc2b07419d307f727484b52c9a6c1";
// Contract for event factory
const eventFactoryAddress = "0xC4F53B0021141407Ec99F14Fd844f8A0C03ACacF";

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
