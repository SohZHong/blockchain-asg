import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const darkMystic = localFont({
  src: "../../public/font/darkmystic.otf",
  variable: "--font-dark-mystic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mystic Kaizer",
  description:
    "Mystic Kaizer is a unique social GamFi DApp where you participate events, connect with people and fight your friends with the NFTs you own!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${darkMystic.variable} antialiased font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
