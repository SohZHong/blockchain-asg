"use client";

import { NFT } from "thirdweb";
import { createContext, useContext, useState, ReactNode } from "react";

interface NFTContextType {
  selectedNFT: NFT | null;
  setSelectedNFT: (nft: NFT | null) => void;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

export function NFTProvider({ children }: { children: ReactNode }) {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  return (
    <NFTContext.Provider value={{ selectedNFT, setSelectedNFT }}>
      {children}
    </NFTContext.Provider>
  );
}

export function useNFTContext() {
  const context = useContext(NFTContext);
  if (context === undefined) {
    throw new Error("useNFTContext must be used within a NFTProvider");
  }
  return context;
}
