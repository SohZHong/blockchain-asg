// import { NextRequest, NextResponse } from "next/server";
// import {
//   BaseTransactionOptions,
//   createThirdwebClient,
//   getContract,
//   sendAndConfirmTransaction,
// } from "thirdweb";
// import { celoAlfajoresTestnet } from "thirdweb/chains";
// import {
//   addSessionKey,
//   AddSessionKeyOptions,
// } from "thirdweb/extensions/erc4337";
// import { privateKeyToAccount } from "thirdweb/wallets";

// export async function POST(req: Request) {
//   try {
//     const privateKey = process.env.PRIVATE_KEY;
//     if (!privateKey) throw new Error("Admin private key is not set");

//     const secretKey = process.env.THIRDWEB_SECRET_KEY;
//     if (!secretKey) throw new Error("Third web secret key is not set");

//     const engineWallet = process.env.THIRDWEB_ENGINE_WALLET_ADDRESS;
//     if (!engineWallet)
//       throw new Error("Third web engine wallet address is not set");

//     const { userAddress } = await req.json();
//     if (!userAddress) {
//       throw new Error("User address is required");
//     }

//     const client = createThirdwebClient({ secretKey });

//     // Initialize admin account
//     const adminAccount = privateKeyToAccount({ client, privateKey });

//     // Get the smart wallet contract
//     const smartWallet = getContract({
//       client,
//       chain: celoAlfajoresTestnet,
//       address: userAddress,
//     });

//     // Prepare session key options
//     const sessionKeyOptions: BaseTransactionOptions<AddSessionKeyOptions> = {
//       contract: smartWallet,
//       account: adminAccount,
//       sessionKeyAddress: engineWallet,
//       permissions: {
//         approvedTargets: "*",
//         nativeTokenLimitPerTransaction: 0.1, // in ETH
//         permissionStartTimestamp: new Date(),
//         permissionEndTimestamp: new Date(
//           Date.now() + 1000 * 60 * 60 * 24 * 365
//         ), // 1 year
//       },
//     };

//     const tx = addSessionKey(sessionKeyOptions);
//     const receipt = await sendAndConfirmTransaction({
//       transaction: tx,
//       account: adminAccount,
//     });

//     return NextResponse.json({
//       success: true,
//       receipt: JSON.parse(
//         JSON.stringify(receipt, (key, value) =>
//           typeof value === "bigint" ? value.toString() : value
//         )
//       ),
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
