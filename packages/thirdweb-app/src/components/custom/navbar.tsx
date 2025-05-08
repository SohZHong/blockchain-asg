"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ThirdWebConnectButton from "../ThirdWebConnectButton";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import {
  addSessionKey,
  getAllActiveSigners,
} from "thirdweb/extensions/erc4337";
import { TransactionButton } from "thirdweb/react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Spinner } from "../Spinner";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { account, smartWallet, sessionKeyOptions } = useThirdWeb();
  console.log(sessionKeyOptions);
  const getSigners = async () => {
    if (!smartWallet) return;
    const res = await getAllActiveSigners({
      contract: smartWallet,
    });
    console.log(res);
  };

  return (
    <nav className="bg-gray-900 fixed w-full z-20 top-0 start-0 ">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link
          href="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image
            src="/landing-page/white-title.svg"
            alt="Title"
            width={220}
            height={60}
            className="object-cover items-center cursor-pointer"
          />
        </Link>

        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <ThirdWebConnectButton />
          {account && <Button onClick={() => getSigners()}>Signers</Button>}
          {sessionKeyOptions ? (
            <TransactionButton
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
              Add Session Key
            </TransactionButton>
          ) : (
            <p className="text-gray-500">
              <Spinner />
              Waiting for session key configuration...
            </p>
          )}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-sticky"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isMenuOpen ? "" : "hidden"
          }`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 ">
            <li>
              <Link
                href="/"
                className="block py-2 px-3 text-white rounded md:bg-transparent md:text-blue-500 md:p-0 md:dark:text-blue-500"
                aria-current="page"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/event"
                className="block py-2 px-3 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                href="/readyBattle"
                className="block py-2 px-3  hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                aria-current="page"
              >
                Battle
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
