"use client";

import WalletAuthCheck from "@/components/WalletAuthCheck";
import Navigation from "@/components/landing-page/Navigation";

export default function DappLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletAuthCheck>
      <div className="hidden">
        <Navigation />
      </div>
      {children}
    </WalletAuthCheck>
  );
} 