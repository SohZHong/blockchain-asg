"use client";

import { ReactNode } from "react";
import { NFTProvider } from "@/contexts/NFTContext";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/custom/navbar";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      <NFTProvider>
        <Navbar />
        {children}
        <Toaster />
      </NFTProvider>
    </ThirdwebProvider>
  );
}
