"use client";

import React from "react";
import Image from "next/image";
import { BattleNFT } from "@/data/dummyNfts";

interface NFTSelectorProps {
  nfts: BattleNFT[];
  selectedNFT: BattleNFT | null;
  onSelectNFT: (nft: BattleNFT) => void;
}

export default function NFTSelector({ 
  nfts, 
  selectedNFT, 
  onSelectNFT 
}: NFTSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-4">Select Your NFT Champion</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {nfts.map((nft) => (
          <div 
            key={nft.id}
            onClick={() => onSelectNFT(nft)}
            className={`
              relative border-2 rounded-lg p-4 transition-all cursor-pointer
              ${selectedNFT?.id === nft.id 
                ? 'border-blue-500 bg-blue-500/20 transform scale-105' 
                : 'border-gray-600 hover:border-gray-400'}
            `}
          >
            <div className="aspect-square relative overflow-hidden rounded-md mb-3">
              <Image
                src={nft.image}
                alt={nft.name}
                fill
                className="object-cover"
              />
            </div>
            
            <h4 className="font-bold text-lg">{nft.name}</h4>
            <p className="text-sm text-gray-300 mb-2">{nft.description}</p>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col border border-gray-700 rounded p-2">
                <span className="text-gray-400">Health</span>
                <span className="font-bold text-green-400">{nft.health}</span>
              </div>
              <div className="flex flex-col border border-gray-700 rounded p-2">
                <span className="text-gray-400">Attack</span>
                <span className="font-bold text-red-400">{nft.atkMin}-{nft.atkMax}</span>
              </div>
            </div>
            
            {selectedNFT?.id === nft.id && (
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 