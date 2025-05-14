"use client";

import { ReactNode } from "react";
import { NFTProvider } from "@/contexts/NFTContext";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/sonner";
import Navigation from "@/components/landing-page/Navigation";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      <NFTProvider>
        {/* <Navigation /> */}
        {children}
        <Toaster />
      </NFTProvider>
    </ThirdwebProvider>
  );
}
