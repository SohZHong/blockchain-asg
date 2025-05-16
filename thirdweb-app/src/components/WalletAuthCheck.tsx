"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import { toast } from "sonner";
import Image from "next/image";
import { ConnectButton } from "thirdweb/react";

interface WalletAuthCheckProps {
  children: React.ReactNode;
}

export const WalletAuthCheck: React.FC<WalletAuthCheckProps> = ({ children }) => {
  const { account, client, appMetadata, accountAbstraction } = useThirdWeb();
  const router = useRouter();

  useEffect(() => {
    // Check if wallet is connected
    if (!account) {
      toast.error("Please connect your wallet to access this page", {
        duration: 3000,
      });
    }
  }, [account]);

  // If wallet is not connected, don't render children
  if (!account) {
    return (
      <div className="min-h-screen w-full bg-[url('/dapp/dapp-bg.png')] bg-cover bg-center text-white flex flex-col items-center justify-center">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 max-w-lg text-center">
          <Image 
            src="/landing-page/white-title.svg" 
            alt="Mystic Kaiser Logo" 
            width={200} 
            height={100}
            className="mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold mb-4 font-dark-mystic">Authentication Required</h2>
          <p className="text-gray-300 mb-6">Connect your wallet to access the Mystic Kaiser dapp.</p>
          
          {/* Display ConnectButton directly in the authentication screen */}
          <div className="mb-6">
            <ConnectButton
              client={client}
              appMetadata={appMetadata}
              accountAbstraction={accountAbstraction}
            />
          </div>
          
          <button 
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white text-sm"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // If wallet is connected, render children
  return <>{children}</>;
};

export default WalletAuthCheck; 