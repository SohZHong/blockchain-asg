"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ThirdWebConnectButton from "../ThirdWebConnectButton";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className=" fixed w-full z-20 top-0 start-0 ">
      <div className="flex flex-wrap items-center justify-between mx-auto p-4 px-10">
        <Link
          href="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image src="/landing-page/white-title.svg" alt="Mystic Kaizer" width={200} height={80} />
        </Link>

        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <ThirdWebConnectButton />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden "
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
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 font-dark-mystic text-xl ${
            isMenuOpen ? "" : "hidden"
          }`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 ">
            <li>
              <Link
                href="/event"
                className="block py-2 px-3 text-white rounded md:hover:bg-transparent hover:text-blue-300 md:p-0"
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                href="/readyBattle"
                className="block py-2 px-3 text-white rounded md:hover:bg-transparent hover:text-blue-300 md:p-0"
                aria-current="page"
              >
                Battle
              </Link>
            </li>
            <li>
              <Link
                href="/dapp/marketplace"
                className="block py-2 px-3 text-white rounded md:hover:bg-transparent hover:text-blue-300 md:p-0 "
                aria-current="page"
              >
                Marketplace
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
