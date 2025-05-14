"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoomService, RoomConfig } from "@/services/roomService";
import NFTSelector from "./nft-selector";
import { dummyNFTs, BattleNFT } from "@/data/dummyNfts";

interface BattleRoomProps {
  playerAddress: string;
  onRoomSelect: (code: string) => void;
}

export default function BattleRoom({ playerAddress, onRoomSelect }: BattleRoomProps) {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [selectedNFT, setSelectedNFT] = useState<BattleNFT | null>(null);

  // Updated configuration using selected NFT values or defaults
  const getBattleConfig = (): RoomConfig => {
    if (selectedNFT) {
      return {
        playerAddress,
        atkMin: selectedNFT.atkMin,
        atkMax: selectedNFT.atkMax,
        health: selectedNFT.health,
        // Only passing the name for identification in the UI, not saved to DB
        nftName: selectedNFT.name
      };
    }
    
    // Default battle configuration if no NFT selected
    return {
      playerAddress,
      atkMin: 20,
      atkMax: 80,
      health: 100
    };
  };

  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [subscription]);

  const handleCreateRoom = async () => {
    if (!selectedNFT) {
      setError('Please select an NFT champion for battle');
      return;
    }

    try {
      setIsLoading(true);
      setIsCreating(true);
      setError('');

      const config = getBattleConfig();
      const code = await RoomService.createRoom(config);
      setRoomCode(code);
      
      // Set up subscription for room updates
      const sub = RoomService.subscribeToRoom(code, (payload) => {
        if (payload.new.player2_address) {
          console.log("Player 2 has joined! Starting battle...");
          // Pass selected NFT image through URL parameter
          const nftImageParam = selectedNFT ? `&nftImage=${encodeURIComponent(selectedNFT.image)}` : '';
          router.push(`/dapp/battle/${code}?username=${playerAddress}${nftImageParam}`);
        }
      });
      setSubscription(sub);
    } catch (error) {
      setError('Failed to create room. Please try again.');
      console.error('Error creating room:', error);
      setIsCreating(false);
    } finally {
      setIsLoading(false);
      // Note: We don't reset isCreating here to keep button disabled after successful creation
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedNFT) {
      setError('Please select an NFT champion for battle');
      return;
    }
    
    if (roomCode.length !== 4) {
      setError('Please enter a valid 4-letter room code');
      return;
    }

    try {
      setIsLoading(true);
      setIsJoining(true);
      setError('');

      const config = getBattleConfig();
      const room = await RoomService.joinRoom(roomCode, config);
      if (room) {
        // Pass selected NFT image through URL parameter
        const nftImageParam = selectedNFT ? `&nftImage=${encodeURIComponent(selectedNFT.image)}` : '';
        router.push(`/dapp/battle/${roomCode}?username=${playerAddress}${nftImageParam}`);
      }
    } catch (error) {
      setError('Failed to join room. Please try again.');
      console.error('Error joining room:', error);
      setIsJoining(false);
    } finally {
      setIsLoading(false);
      // Note: We don't reset isJoining here to keep button disabled after successful join
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/dapp/dapp-bg.png')] bg-cover bg-center">
      <div className="bg-black/60 backdrop-blur-md p-8 rounded-xl text-white text-center w-full max-w-2xl">
        <h2 className="text-3xl font-bold font-dark-mystic mb-6">
          Battle Room
        </h2>

        {/* NFT Selector Component */}
        <div className="mb-8">
          <NFTSelector 
            nfts={dummyNFTs} 
            selectedNFT={selectedNFT} 
            onSelectNFT={setSelectedNFT} 
          />
        </div>

        {selectedNFT && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
            <h3 className="text-xl font-bold">Selected Champion: {selectedNFT.name}</h3>
            <p className="text-gray-300">Ready for battle with {selectedNFT.health} HP and {selectedNFT.atkMin}-{selectedNFT.atkMax} attack power!</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <button
              onClick={handleCreateRoom}
              disabled={isLoading || !selectedNFT || isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating Room...' : isCreating ? 'Waiting for Opponent...' : 'Create New Room'}
            </button>

            {roomCode && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-bold mb-2">Your Room Code</h3>
                <p className="text-3xl font-mono">{roomCode}</p>
                <p className="text-sm text-gray-400 mt-2">Share this code with your opponent</p>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black/60 text-gray-300">OR</span>
            </div>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 4-letter Room Code"
              className="w-full bg-white/10 border border-gray-300 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={4}
              disabled={isJoining}
            />
            <button
              type="submit"
              disabled={isLoading || !selectedNFT || isJoining}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Joining Room...' : isJoining ? 'Joining Game...' : 'Join Room'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-500/50 text-white rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 