import { PinataSDK } from "pinata-web3";

const PINATA_JWT = String(process.env.PINATA_JWT || "");
const PINATA_GATEWAY = String(process.env.PINATA_GATEWAY || "");

// Validate that all required environment variables are set
if (!PINATA_JWT || !PINATA_GATEWAY) {
  throw new Error(
    `Missing required environment variables: ${
      !PINATA_JWT ? "PINATA_JWT, " : ""
    } ${!PINATA_GATEWAY ? "PINATA_GATEWAY, " : ""}`
  );
}

export default new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATA_GATEWAY,
});
