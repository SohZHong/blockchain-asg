"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import { ConnectButton } from "thirdweb/react";

export default function LaunchButton() {
  const router = useRouter();
  const { account, client, appMetadata, accountAbstraction } = useThirdWeb();
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Automatically show the connect modal when component mounts if not connected
  useEffect(() => {
    if (!account) {
      setShowConnectModal(true);
    }
  }, [account]);

  const handleLaunchClick = () => {
    if (account) {
      // If wallet is connected, navigate to dapp
      router.push("/dapp");
    } else {
      // If wallet is not connected, show connect modal
      setShowConnectModal(true);
    }
  };

  return (
    <div className="relative">
      {/* Custom Launch Button */}
      {account ? (
        <button 
          onClick={handleLaunchClick}
          className="flex flex-row items-center gap-2 hover:scale-105 transition-all duration-300"
        >
          <Image
            src="/landing-page/launch-left.png"
            alt="Mystic Kaizer Logo"
            width={80}
            height={50}
          />
          <div className="py-3 text-3xl">
            Launch
          </div>
          <Image
            src="/landing-page/launch-right.png"
            alt="Mystic Kaizer Logo"
            width={80}
            height={50}
          />
        </button>
      ) : (
        <button 
          onClick={handleLaunchClick}
          className="flex flex-row items-center gap-2 hover:scale-105 transition-all duration-300"
        >
          <Image
            src="/landing-page/launch-left.png"
            alt="Mystic Kaizer Logo"
            width={80}
            height={50}
          />
          <div className="py-3 text-3xl">
            Launch
          </div>
          <Image
            src="/landing-page/launch-right.png"
            alt="Mystic Kaizer Logo"
            width={80}
            height={50}
          />
        </button>
      )}

      {/* ConnectButton modal that will be shown when needed */}
      {showConnectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-70" onClick={() => setShowConnectModal(false)}></div>
          <div className="relative z-10 bg-gray-900/90 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30 shadow-xl max-w-md w-full justify-center items-center">
            <h2 className="text-2xl font-bold text-white text-center mb-4 font-dark-mystic">Connect Your Wallet</h2>
            <p className="text-gray-300 text-center mb-6">Please connect your wallet to access Mystic Kaiser</p>
            <div className="flex justify-center items-center">
            <ConnectButton
              client={client}
              appMetadata={appMetadata}
              accountAbstraction={accountAbstraction}
              onConnect={() => {
                setShowConnectModal(false);
                router.push("/dapp");
              }}
            />
            </div>
            <button 
              onClick={() => setShowConnectModal(false)}
              className="mt-4 text-gray-400 hover:text-white text-sm block mx-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 