import * as MultiBaas from "@curvegrid/multibaas-sdk";
import { isAxiosError } from "axios";
import { ethers } from "ethers";
import { 
  getContract,
  prepareContractCall,
  sendTransaction,
  ThirdwebClient,
  waitForReceipt
} from "thirdweb";
import { Account } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";


const CELO_ALFAJORES = defineChain({
  id: 44787,
  name: "Celo Alfajores",
  nativeCurrency: {
    name: "Celo",
    symbol: "CELO",
    decimals: 18,
  },
  rpc: "https://alfajores-forno.celo-testnet.org",
  testnet: true,
});

const hostname = process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL;
const apiKey = process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY;
const config = new MultiBaas.Configuration({
  basePath: hostname + "/api/v0",
  accessToken: apiKey,
});
const contractsApi = new MultiBaas.ContractsApi(config);
const eventQueriesApi = new MultiBaas.EventQueriesApi(config);

const chain = "ethereum";
const deployedAddressOrAlias = "marketplace1";
const contractLabel = "marketplace";
const payload: MultiBaas.PostMethodArgs = {
  args: [],
};

const requestBody: MultiBaas.EventQuery = {
  events: [
    {
      select: [
        {
          name: "listingId",
          type: "input",
          alias: "",
          inputIndex: 0,
        },
        {
          name: "tokenId",
          type: "input",
          alias: "",
          inputIndex: 1,
        },
        {
          name: "seller",
          type: "input",
          alias: "",
          inputIndex: 2,
        },
        {
          name: "nftAddress",
          type: "input",
          alias: "",
          inputIndex: 3,
        },
        {
          name: "price",
          type: "input",
          alias: "",
          inputIndex: 4,
        },
      ],
      eventName: "BeastListed(uint256,uint256,address,address,uint256)",
    },
  ],
};

// Updated marketplace address to the correct one that implements ERC721Receiver
const MARKETPLACE_ADDRESS = "0x75E4C7832d2849bC99304c0056063319aD1b0E05";
const CELO_RPC = "https://alfajores-forno.celo-testnet.org";
const FEE_PERCENTAGE = 250; // 2.5% fee

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
}

export interface ListingItem {
  listingid: number;
  nftaddress: string;
  price: string;
  seller: string;
  tokenid: number;
  metadata?: NFTMetadata;
}

export interface NewListing {
  nftAddress: string;
  tokenId: string;
  price: string;
}

const fetchNFTMetadata = async (nftAddress: string, tokenId: number): Promise<NFTMetadata> => {
  try {
    const provider = new ethers.JsonRpcProvider("https://alfajores-forno.celo-testnet.org");
    const contract = new ethers.Contract(nftAddress, [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "tokenURI",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ], provider);

    const tokenURI = await contract.tokenURI(tokenId);
    const ipfsUrl = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
    const response = await fetch(ipfsUrl);
    const metadata = await response.json();
    if (metadata.image.startsWith('ipfs://')) {
      metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return metadata;
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return {
      name: "Unknown NFT",
      description: "Metadata not available",
      image: "https://via.placeholder.com/400",
    };
  }
};

export const marketplaceService = {
  async approveNFT(nftAddress: string, tokenId: string, account: Account, client: ThirdwebClient): Promise<boolean> {
    try {
      const contract = getContract({
        address: nftAddress,
        abi: [
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              }
            ],
            "name": "approve",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "sender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "owner",
                "type": "address"
              }
            ],
            "name": "ERC721IncorrectOwner",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "operator",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              }
            ],
            "name": "ERC721InsufficientApproval",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "approver",
                "type": "address"
              }
            ],
            "name": "ERC721InvalidApprover",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "operator",
                "type": "address"
              }
            ],
            "name": "ERC721InvalidOperator",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "owner",
                "type": "address"
              }
            ],
            "name": "ERC721InvalidOwner",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
              }
            ],
            "name": "ERC721InvalidReceiver",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "sender",
                "type": "address"
              }
            ],
            "name": "ERC721InvalidSender",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              }
            ],
            "name": "ERC721NonexistentToken",
            "type": "error"
          }
        ],
        client,
        chain: CELO_ALFAJORES
      });

      const transaction = prepareContractCall({
        contract,
        method: "approve",
        params: [MARKETPLACE_ADDRESS, BigInt(tokenId)] as const
      });

      await sendTransaction({
        transaction,
        account
      });

      return true;
    } catch (error) {
      console.error("Error approving NFT:", error);
      throw error;
    }
  },

  async addListing(listing: NewListing, account: Account, client: ThirdwebClient) {
    try {
      // First approve the marketplace to transfer the NFT
      await this.approveNFT(listing.nftAddress, listing.tokenId, account, client);
      console.log("Marketplace approved to transfer NFT, proceeding with listing creation");

      // Create the listing using MultiBaas
      const payload: MultiBaas.PostMethodArgs = {
        args: [
          listing.nftAddress,
          listing.tokenId,
          listing.price
        ],
        from: account.address,
      };

      const resp = await contractsApi.callContractFunction(
        chain,
        deployedAddressOrAlias,
        contractLabel,
        "listBeast",
        payload
      );

      if (resp.data.result.kind === "TransactionToSignResponse" && !resp.data.result.submitted) {
        // Create a contract instance for the marketplace
        const contract = getContract({
          address: MARKETPLACE_ADDRESS,
          abi: [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "nftAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                }
              ],
              "name": "listBeast",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ],
          client,
          chain: CELO_ALFAJORES
        });

        // Prepare and send the transaction
        const transaction = prepareContractCall({
          contract,
          method: "listBeast",
          params: [
            listing.nftAddress,
            BigInt(listing.tokenId),
            BigInt(listing.price)
          ] as const
        });

        const tx = await sendTransaction({
          transaction,
          account
        });

        // Wait for transaction receipt
        const receipt = await waitForReceipt(tx);
        console.log("Listing creation transaction receipt:", receipt);
        return true;
      }

      throw new Error("Unexpected response from MultiBaas");
    } catch (error) {
      console.error("Error in addListing:", error);
      if (isAxiosError(error)) {
        console.error(`MultiBaas error with status '${error.response?.data?.status}' and message: ${error.response?.data?.message}`);
      }
      throw error;
    }
  },

  async removeListing(listingId: number, account: Account, client: ThirdwebClient): Promise<boolean> {
    try {
      const payload: MultiBaas.PostMethodArgs = {
        args: [listingId],
        from: account.address,
      };

      const resp = await contractsApi.callContractFunction(
        chain,
        deployedAddressOrAlias,
        contractLabel,
        "cancelListing",
        payload
      );

      if (resp.data.result.kind === "TransactionToSignResponse" && !resp.data.result.submitted) {
        // Create a contract instance for the marketplace
        const contract = getContract({
          address: MARKETPLACE_ADDRESS,
          abi: [
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "listingId",
                  "type": "uint256"
                }
              ],
              "name": "cancelListing",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ],
          client,
          chain: CELO_ALFAJORES
        });

        // Prepare and send the transaction
        const transaction = prepareContractCall({
          contract,
          method: "cancelListing",
          params: [BigInt(listingId)] as const
        });

        const tx = await sendTransaction({
          transaction,
          account
        });

        // Wait for transaction receipt
        const receipt = await waitForReceipt(tx);
        console.log("Cancel listing transaction receipt:", receipt);
        return true;
      }

      throw new Error("Unexpected response from MultiBaas");
    } catch (error) {
      console.error("Error in removeListing:", error);
      if (isAxiosError(error)) {
        console.error(`MultiBaas error with status '${error.response?.data?.status}' and message: ${error.response?.data?.message}`);
      }
      throw error;
    }
  },

  async fetchListings(): Promise<ListingItem[]> {
    try {
      const response = await contractsApi.callContractFunction(
        chain,
        deployedAddressOrAlias,
        contractLabel,
        "getActiveBeastListings",
        payload
      );
      const activeListingId: any = response.data.result;
      console.log("Function call result:\n", activeListingId.output);

      const response2 = await eventQueriesApi.executeArbitraryEventQuery(
        requestBody,
        0,
        50
      );
      const activeListing: any = response2.data.result;
      console.log("Event query result:\n", activeListing.rows);

      const activeIds = activeListingId.output;
      const matchedListings = activeListing.rows.filter((item: any) =>
        activeIds.includes(item.listingid)
      );

      const listingsWithMetadata = await Promise.all(
        matchedListings.map(async (item: any) => {
          const metadata = await fetchNFTMetadata(
            item.nftaddress,
            item.tokenid
          );
          return { ...item, metadata };
        })
      );

      console.log(
        "Filtered active listings with metadata:\n",
        listingsWithMetadata
      );
      return listingsWithMetadata;
    } catch (e) {
      console.error("Error fetching listings:", e);
      return [];
    }
  },

  async buyNFT(listingId: number, account: Account, client: ThirdwebClient): Promise<boolean> {
    try {
      // Get the listing details first
      const listings = await this.fetchListings();
      const listing = listings.find(l => l.listingid === listingId);
      
      if (!listing) {
        throw new Error("Listing not found");
      }

      // Calculate total amount with fee
      const baseAmount = BigInt(listing.price);
      const feeAmount = (baseAmount * BigInt(FEE_PERCENTAGE)) / BigInt(10000);
      const totalAmount = baseAmount + feeAmount;

      const payload: MultiBaas.PostMethodArgs = {
        args: [listingId],
        from: account.address,
        value: totalAmount.toString(),
      };

      const resp = await contractsApi.callContractFunction(
        chain,
        deployedAddressOrAlias,
        contractLabel,
        "buyBeast",
        payload
      );

      if (resp.data.result.kind === "TransactionToSignResponse" && !resp.data.result.submitted) {
        // Create a contract instance for the marketplace
        const contract = getContract({
          address: MARKETPLACE_ADDRESS,
          abi: [
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "listingId",
                  "type": "uint256"
                }
              ],
              "name": "buyBeast",
              "outputs": [],
              "stateMutability": "payable",
              "type": "function"
            }
          ],
          client,
          chain: CELO_ALFAJORES
        });

        // Prepare and send the transaction
        const transaction = prepareContractCall({
          contract,
          method: "buyBeast",
          params: [BigInt(listingId)] as const,
          value: totalAmount
        });

        const tx = await sendTransaction({
          transaction,
          account
        });

        // Wait for transaction receipt
        const receipt = await waitForReceipt(tx);
        console.log("Transaction receipt:", receipt);
        return true;
      }

      throw new Error("Unexpected response from MultiBaas");
    } catch (e) {
      if (isAxiosError(e)) {
        console.error(`MultiBaas error with status '${e.response?.data?.status}' and message: ${e.response?.data?.message}`);
      } else {
        console.error("An unexpected error occurred:", e);
      }
      throw e;
    }
  },
}; 