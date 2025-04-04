"use client";

import { getOwnedNFTs } from "thirdweb/extensions/erc721";
import { getContract } from "thirdweb";
import { useEffect, useState } from "react";
import { NFT } from "thirdweb";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import { useNFTContext } from "@/contexts/NFTContext";
import Image from "next/image";
import Link from "next/link";

const NFT_CONTRACT_ADDRESS = "0x360E849E2b04C558067bC17Cc24bC575076eAE9F";

export default function UserNFTs() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const { nftContract, account } = useThirdWeb();
  const { selectedNFT, setSelectedNFT } = useNFTContext();

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!nftContract) return;
      if (!account) return;
      try {
        const ownedNFTs = await getOwnedNFTs({
          contract: nftContract,
          owner: account.address,
        });

        // Convert IPFS URI
        const updatedNFTs = ownedNFTs.map((nft) => ({
          ...nft,
          metadata: {
            ...nft.metadata,
            image: nft.metadata.image?.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            ),
          },
        }));

        console.log("Owned NFTs:", updatedNFTs);
        setNfts(updatedNFTs);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  if (loading)
    return <p className="text-white text-center">Loading Battle Cards...</p>;

  return (
    <div className="min-h-screen flex items-center flex-col justify-center">
      <h1 className=" text-4xl font-bold text-black mb-20 text-center">
        {selectedNFT
          ? "Are you ready to fight?"
          : nfts.length === 0
          ? ""
          : "Your Battle Cards"}
      </h1>

      {selectedNFT ? (
        <div className="flex flex-col gap-y-10">
          <div className="relative">
            <div className="relative bg-gray-800 rounded-lg overflow-hidden p-4 shadow-xl transform transition-all scale-105 animate-glow">
              <Image
                src={selectedNFT.metadata.image || "/placeholder.png"}
                alt={selectedNFT.metadata.name || "NFT"}
                width={400}
                height={400}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <h3 className="text-2xl font-bold text-white mt-4 text-center">
                {selectedNFT.metadata.name}
              </h3>
              {Array.isArray(selectedNFT.metadata.attributes) && (
                <div className="space-y-2 mt-2">
                  {(
                    selectedNFT.metadata.attributes as {
                      trait_type: string;
                      value: string;
                    }[]
                  ).map((attr, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm text-gray-400"
                    >
                      <span>{attr.trait_type}:</span>
                      <span className="text-gray-200 font-medium">
                        {attr.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedNFT(null)}
              className="absolute top-2 right-2 bg-red-600 text-white py-1 px-3 rounded-full text-sm shadow-md hover:bg-red-700 transition-all"
            >
              ✖ Close
            </button>
          </div>
          <button
            className="bg-blue-600 text-white py-3 px-8 rounded-lg text-lg font-semibold shadow-lg hover:bg-blue-700 transition-all mt-4 w-full max-w-md"
            onClick={() => {
              /* Add your ready function here */
            }}
          >
            YES, I'M READY!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <div
              onClick={() => setSelectedNFT(nft)}
              className="cursor-pointer bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all hover:scale-105 hover:shadow-xl"
            >
              <div className="relative">
                <Image
                  src={nft.metadata.image || "/placeholder.png"}
                  alt={nft.metadata.name || "NFT"}
                  width={400}
                  height={400}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    Select NFT
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white">
                  {nft.metadata.name}
                </h3>
                {Array.isArray(nft.metadata.attributes) && (
                  <div className="space-y-2 mt-2">
                    {(
                      nft.metadata.attributes as {
                        trait_type: string;
                        value: string;
                      }[]
                    ).map((attr, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm text-gray-400"
                      >
                        <span>{attr.trait_type}:</span>
                        <span className="text-gray-200 font-medium">
                          {attr.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {nfts.length === 0 && (
        <div className="text-center max-w-lg">
          <h1 className="text-4xl font-bold text-black mb-4">
            No Battle Cards Found
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            You need Battle Cards to participate in battles. Head to the events
            page to earn your first cards!
          </p>
          <Link
            href="/event"
            className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg text-lg font-semibold shadow-lg hover:bg-blue-700 transition-all"
          >
            Go to Events
          </Link>
        </div>
      )}

      <style jsx global>{`
        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 25px rgba(255, 215, 0, 0.6);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.9);
          }
        }
        .animate-glow {
          animation: glow 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
