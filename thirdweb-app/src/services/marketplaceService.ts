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
export const MARKETPLACE_ADDRESS = "0x41Be93E3914e4262dD7A08cEce2f80EB84b8B0e2";
export const NFT_CONTRACT_ADDRESS = "0xc61BF2E3cD2E9C25619aAb85f516E7160f4e31c0";
const CELO_RPC = "https://alfajores-forno.celo-testnet.org";
const FEE_PERCENTAGE = 250; // 2.5% fee

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: {
    trait_type: string;
    value: string;
  }[];
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
  tokenId: string;
  price: string;
  nftAddress: string;
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
  async approveNFT(tokenId: string, account: Account, client: ThirdwebClient): Promise<boolean> {
    try {
      const contract = getContract({
        address: NFT_CONTRACT_ADDRESS,
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

  async addListing(listing: NewListing, account: Account, client: ThirdwebClient): Promise<string> {
    try {
      // First approve the marketplace to transfer the NFT
      await this.approveNFT(listing.tokenId, account, client);
      console.log("Marketplace approved to transfer NFT, proceeding with listing creation");

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
          },
          {
            "inputs": [],
            "name": "NotApproved",
            "type": "error"
          },
          {
            "inputs": [],
            "name": "NotOwner",
            "type": "error"
          },
          {
            "inputs": [],
            "name": "PriceMustBeAboveZero",
            "type": "error"
          },
          {
            "inputs": [],
            "name": "TokenNotApproved",
            "type": "error"
          }
        ],
        client,
        chain: CELO_ALFAJORES
      });

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

      const receipt = await waitForReceipt(tx);
      console.log("Listing creation transaction receipt:", receipt);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Error in addListing:", error);
      throw error;
    }
  },

  async removeListing(listingId: number, account: Account, client: ThirdwebClient): Promise<string> {
    try {
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

      const transaction = prepareContractCall({
        contract,
        method: "cancelListing",
        params: [BigInt(listingId)] as const
      });

      const tx = await sendTransaction({
        transaction,
        account
      });

      const receipt = await waitForReceipt(tx);
      console.log("Cancel listing transaction receipt:", receipt);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Error in removeListing:", error);
      throw error;
    }
  },

  async fetchListings(): Promise<ListingItem[]> {
    try {
      const provider = new ethers.JsonRpcProvider(CELO_RPC);
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, [
        {
          "inputs": [],
          "name": "getActiveBeastListings",
          "outputs": [
            {
              "internalType": "uint256[]",
              "name": "",
              "type": "uint256[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "listings",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "listingId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "seller",
              "type": "address"
            },
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
            },
            {
              "internalType": "bool",
              "name": "active",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ], provider);

      const activeListingIds = await contract.getActiveBeastListings();
      const listings: ListingItem[] = [];

      for (const listingId of activeListingIds) {
        const listing = await contract.listings(listingId);
        if (listing.active && listing.nftAddress.toLowerCase() === NFT_CONTRACT_ADDRESS.toLowerCase()) {
          const metadata = await fetchNFTMetadata(NFT_CONTRACT_ADDRESS, listing.tokenId);
          listings.push({
            listingid: Number(listingId),
            nftaddress: NFT_CONTRACT_ADDRESS,
            price: listing.price.toString(),
            seller: listing.seller,
            tokenid: Number(listing.tokenId),
            metadata
          });
        }
      }

      return listings;
    } catch (error) {
      console.error("Error fetching listings:", error);
      return [];
    }
  },

  async buyNFT(listingId: number, account: Account, client: ThirdwebClient): Promise<string> {
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

      const receipt = await waitForReceipt(tx);
      console.log("Transaction receipt:", receipt);
      return receipt.transactionHash;
    } catch (error) {
      console.error("Error in buyNFT:", error);
      throw error;
    }
  },
}; 