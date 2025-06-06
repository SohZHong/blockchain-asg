"use client";
import Image from "next/image";
import Link from "next/link";
import ThirdWebConnectButton from "../ThirdWebConnectButton";
import LaunchButton from "@/components/LaunchButton";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import { TransactionButton } from "thirdweb/react";
import { addSessionKey } from "thirdweb/extensions/erc4337";
import { toast } from "sonner";
import { Spinner } from "../Spinner";
import { FaKey } from "react-icons/fa";

export default function Navigation() {
  const { account, smartWallet, sessionKeyOptions } = useThirdWeb();
  console.log(sessionKeyOptions);


  return (
    <nav className="fixed w-full bg-transparent z-50 font-dark-mystic">
      <div className="mx-auto px-4 sm:px-12 h-24 flex items-center justify-center md:justify-between">
        <Link href="/">
          <Image
            src="/landing-page/white-title.svg"
            alt="Mystic Kaizer Logo"
            width={190}
            height={168}
          />
        </Link>
        <div className="hidden md:flex flex-row items-center gap-6 text-2xl text-white">
          <LaunchButton />
        </div>
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-col items-center text-2xl text-white font-inter">
             <ThirdWebConnectButton />
             {sessionKeyOptions ? (
            <TransactionButton
              className="w-8 h-8 min-w-[0px] !important text-white bg-black flex items-center justify-center p-0"
              transaction={() => addSessionKey(sessionKeyOptions)}
              onTransactionConfirmed={(tx) => {
                toast("Session Key Added", {
                  description: JSON.stringify(tx, (key, value) =>
                    typeof value === "bigint" ? value.toString() : value
                  ),
                  action: {
                    label: "Close",
                    onClick: () => console.log("Closed"),
                  },
                });
              }}
              onError={(err) => {
                toast("Error adding session key", {
                  description: err.message,
                  action: {
                    label: "Close",
                    onClick: () => console.log("Closed"),
                  },
                });
              }}
            >
              <FaKey />
            </TransactionButton>
          ) : (
            <p className="text-gray-500">
              <Spinner />
              <span className="text-white text-sm">Waiting for session key configuration...</span>
            </p>
          )}
        </div>
      </div>
    </nav>
  );
}