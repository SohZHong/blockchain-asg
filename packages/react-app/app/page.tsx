'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useAAProvider } from '@/hooks/useAAProvider';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { aaWallet } = useAAProvider();
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  console.log('Address:', address);
  console.log('AAWallet:', aaWallet);
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="h1">
        There you go... a canvas for your next Celo project!
      </div>
      {isConnected ? (
        <div className="h2 text-center">Your address: {address}</div>
      ) : (
        <div>No Wallet Connected</div>
      )}
    </div>
  );
}
