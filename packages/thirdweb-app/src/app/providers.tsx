"use client";

import { ReactNode } from "react";
import { NFTProvider } from "@/contexts/NFTContext";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      <NFTProvider>
        {children}
        <Toaster />
      </NFTProvider>
    </ThirdwebProvider>
  );
}
