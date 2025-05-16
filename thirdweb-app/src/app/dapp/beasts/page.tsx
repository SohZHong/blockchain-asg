"use client";

import React, { useState, useEffect } from "react";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import { getOwnedNFTs } from "thirdweb/extensions/erc721";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { chain } from "@/common/constants";
import Navigation from "@/components/landing-page/Navigation";
import { getContract } from "thirdweb";
import Navbar from "@/components/custom/navbar";

// Helper function to convert IPFS URLs
const convertIpfsUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    const ipfsHash = url.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  }
  return url;
};

export default function BeastsPage() {
  const { account, client } = useThirdWeb();
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!account?.address || !client) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get all event contracts from localStorage or your database
        // For now, we'll use a sample contract address for demonstration
        // You can replace this with actual event contract addresses
        const eventContracts = localStorage.getItem('eventContracts') 
          ? JSON.parse(localStorage.getItem('eventContracts') || '[]') 
          : [];
        
        let allNFTs: any[] = [];
        
        for (const contractAddress of eventContracts) {
          try {
            const contract = getContract({
              address: contractAddress, 
              chain,
              client
            });
            
            if (!contract) continue;
            
            const nfts = await getOwnedNFTs({
              contract,
              owner: account.address,
            });
            
            // Process NFTs: Convert IPFS URLs and add contract info
            const processedNFTs = nfts.map(nft => {
              // Process the metadata if available
              let processedMetadata = nft.metadata;
              
              if (processedMetadata) {
                // Convert image URL if it's IPFS
                if (processedMetadata.image) {
                  processedMetadata.image = convertIpfsUrl(processedMetadata.image);
                }
              }
              
              return {
                ...nft,
                metadata: processedMetadata,
                contractAddress
              };
            });
            
            allNFTs = [...allNFTs, ...processedNFTs];
          } catch (contractError) {
            console.error(`Error fetching NFTs from contract ${contractAddress}:`, contractError);
            // Continue with next contract
          }
        }
        
        console.log(allNFTs);
        setOwnedNFTs(allNFTs);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        toast.error("Failed to load your NFTs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [account?.address, client]);

  return (
    <div className="min-h-screen w-full bg-[url('/dapp/bg3.png')] bg-cover bg-center text-white">
      {/* Header with navigation */}
      <div>
        <Navbar />
      </div>
      
      <div className="container mx-auto pt-28 px-4">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-dark-mystic">My Beasts Collection</h1>
          <p className="text-gray-300 mt-2">View and manage your mystical beasts from events</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {ownedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {ownedNFTs.map((nft, index) => (
                  <motion.div 
                    key={`${nft.contractAddress}-${nft.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-black/80 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-900/50 hover:border-purple-600 transition-all duration-300"
                  >
                    <div className="relative aspect-square">
                      {nft.metadata?.image ? (
                        <Image 
                          src={nft.metadata.image}
                          alt={nft.metadata?.name || `NFT #${nft.id}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-900/30">
                          <span className="text-2xl">🔮</span>
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3 bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-full">
                        #{nft.id?.toString()}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-xl font-bold truncate">
                        {nft.metadata?.name || `Mystery Beast #${nft.id}`}
                      </h3>
                      
                      <p className="text-gray-200 text-sm mt-1 line-clamp-2 h-10">
                        {nft.metadata?.description || "A mysterious creature from another realm."}
                      </p>
                      
                      {/* Display attributes */}
                      {nft.metadata?.attributes && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {/* Health */}
                          {nft.metadata.attributes.find((attr: any) => attr.trait_type === "Health") && (
                            <div className="bg-purple-900/40 rounded-lg p-2 flex flex-col">
                              <span className="text-xs text-purple-300">Health</span>
                              <span className="text-lg font-bold">
                                {nft.metadata.attributes.find((attr: any) => attr.trait_type === "Health")?.value || 0}
                              </span>
                            </div>
                          )}
                          
                          {/* Attack Range */}
                          {nft.metadata.attributes.find((attr: any) => attr.trait_type === "Min Attack") && (
                            <div className="bg-purple-900/40 rounded-lg p-2 flex flex-col">
                              <span className="text-xs text-purple-300">Attack</span>
                              <span className="text-lg font-bold">
                                {nft.metadata.attributes.find((attr: any) => attr.trait_type === "Min Attack")?.value || 0} - {nft.metadata.attributes.find((attr: any) => attr.trait_type === "Max Attack")?.value || 0}
                              </span>
                            </div>
                          )}
                          
                          {/* Rarity */}
                          {nft.metadata.attributes.find((attr: any) => attr.trait_type === "Rarity") && (
                            <div className="bg-purple-900/40 rounded-lg p-2 flex flex-col">
                              <span className="text-xs text-purple-300">Rarity</span>
                              <span className="text-lg font-bold">
                                {nft.metadata.attributes.find((attr: any) => attr.trait_type === "Rarity")?.value || "Unknown"}
                              </span>
                            </div>
                          )}
                          
                          {/* Species */}
                          {nft.metadata.attributes.find((attr: any) => attr.trait_type === "Species") && (
                            <div className="bg-purple-900/40 rounded-lg p-2 flex flex-col">
                              <span className="text-xs text-purple-300">Species</span>
                              <span className="text-lg font-bold">
                                {nft.metadata.attributes.find((attr: any) => attr.trait_type === "Species")?.value || "Unknown"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center">
                          <div className="text-purple-300 text-xs">
                            Contract:
                          </div>
                          <div className="text-xs font-mono">
                            {nft.contractAddress?.slice(0, 6)}...{nft.contractAddress?.slice(-4)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 text-center">
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="text-2xl font-bold mb-2">No Beasts Found</h3>
                <p className="text-gray-400">
                  You don't have any NFT beasts yet. Participate in events and complete milestones to collect unique beasts!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
