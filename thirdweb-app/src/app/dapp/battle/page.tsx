"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BattleRoom from "@/components/dapp/battle-room";
import { createClient } from '@supabase/supabase-js';
import { useThirdWeb } from "@/hooks/useThirdWeb";

interface BeastCard {
  id: number;
  name: string;
  image: string;
  health: number;
  maxHealth: number;
  attack: string;
  type: string;
  element: string;
}

interface Player {
  id: string;
  cards: BeastCard[];
  currentBeast: BeastCard | null;
  availableCards: number[];
}

export default function BattleFieldPage() {
  const router = useRouter();
  const { account } = useThirdWeb();
  const [supabase] = useState(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'room-select' | 'waiting' | 'playing' | 'finished'>('room-select');
  const [player, setPlayer] = useState<Player | null>(null);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);

  // Animation states
  const [playerShake, setPlayerShake] = useState(false);
  const [opponentShake, setOpponentShake] = useState(false);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);

  // Set up Supabase real-time subscription
  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase
      .channel(`battle:${roomCode}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        console.log('Presence state:', newState);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: account?.address || 'anonymous', // Use wallet address
            cards: generatePlayerCards(),
            currentBeast: null,
            availableCards: [0, 1, 2]
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, supabase, account]);

  const handleRoomSelect = (code: string) => {
    setRoomCode(code);
    setGameState('waiting');
  };

  const generatePlayerCards = (): BeastCard[] => {
    return [
      {
        id: 1,
        name: "LUMINA",
        image: "/marketplace/common-2.png",
        health: 100,
        maxHealth: 100,
        attack: "20-80",
        type: "Common",
        element: "Natura",
      },
      {
        id: 2,
        name: "OWLBEAR",
        image: "/marketplace/rare.png",
        health: 2200,
        maxHealth: 2200,
        attack: "30-160",
        type: "Rare",
        element: "Lighting",
      },
      {
        id: 3,
        name: "DRAGON",
        image: "/marketplace/mythic-2-square.png",
        health: 1200,
        maxHealth: 1200,
        attack: "40-100",
        type: "Mythic",
        element: "Earth",
      },
    ];
  };

  // If wallet not connected, show error message
  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/dapp/dapp-bg.png')] bg-cover bg-center">
        <div className="bg-black/60 backdrop-blur-md p-8 rounded-xl text-white text-center">
          <h2 className="text-2xl font-bold mb-4 font-dark-mystic">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-4">You need to connect your wallet to access battles.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'room-select') {
    return <BattleRoom playerAddress={account.address} onRoomSelect={handleRoomSelect} />;
  }

  if (gameState === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/dapp/dapp-bg.png')] bg-cover bg-center">
        <div className="bg-black/60 backdrop-blur-md p-8 rounded-xl text-white text-center">
          <div className="animate-spin mb-4 mx-auto w-12 h-12 border-4 border-white border-t-transparent rounded-full"></div>
          <h2 className="text-2xl font-bold font-dark-mystic">
            Waiting for opponent...
          </h2>
          <p className="mt-2 text-gray-300">Room Code: {roomCode}</p>
        </div>
      </div>
    );
  }

  if (!player?.currentBeast || !opponent?.currentBeast) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/dapp/dapp-bg.png')] bg-cover bg-center">
        <div className="bg-black/60 backdrop-blur-md p-8 rounded-xl text-white text-center">
          <div className="animate-spin mb-4 mx-auto w-12 h-12 border-4 border-white border-t-transparent rounded-full"></div>
          <h2 className="text-2xl font-bold font-dark-mystic">
            Loading Battle...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/dapp/dapp-bg.png')] bg-cover bg-center md:py-10">
      <div className="flex flex-col justify-between bg-white/90 w-screen h-screen md:w-[540px] md:h-auto rounded-lg px-6 relative">
        {/* Room Code Display */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-600 px-4 py-2 rounded-lg text-white font-bold">
          Room: {roomCode}
        </div>

        {/* Opponent Info */}
        <div className="absolute top-4 right-0 text-white font-bold z-10">
          <div className="flex items-center bg-slate-500 px-2 py-1 rounded-s-lg w-48 mb-1">
            <span className="mr-2">Opponent</span>
            <div className="flex ml-auto">
              {opponent.availableCards.map((i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full mx-0.5 flex items-center justify-center text-xs
                    ${i === 0 ? "bg-green-500 border-2 border-white" : "bg-white"}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player Info */}
        <div className="absolute bottom-[29.5rem] left-0 text-white font-bold z-10">
          <div className="flex items-center bg-slate-600 px-2 py-1 rounded-e-lg w-44">
            <span className="mr-2 truncate">You</span>
            <div className="flex ml-auto">
              {player.availableCards.map((i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full mx-0.5 flex items-center justify-center text-xs
                    ${i === 0 ? "bg-green-500 border-2 border-white" : "bg-white"}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Opponent Beast Card */}
        <div className={`flex justify-end ${opponentAttacking ? 'animate-attack' : ''}`}>
          <div className={`my-14 relative w-[220px] h-[220px] ${opponentShake ? 'animate-shake' : ''}`}>
            <Image
              src={opponent.currentBeast.image}
              alt={opponent.currentBeast.name}
              width={220}
              height={300}
              className={`rounded-lg border-4 ${
                opponent.currentBeast.type === "Common"
                  ? "border-gray-400"
                  : opponent.currentBeast.type === "Rare"
                  ? "border-blue-400"
                  : opponent.currentBeast.type === "Epic"
                  ? "border-purple-400"
                  : "border-yellow-400"
              }`}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg">
              <div className="text-center font-dark-mystic text-xl">
                {opponent.currentBeast.name}
              </div>
              <div className="flex justify-between text-sm px-2">
                <div>
                  HEALTH
                  <br />
                  {opponent.currentBeast.health}
                </div>
                <div>
                  ATTACK
                  <br />
                  {opponent.currentBeast.attack}
                </div>
              </div>
            </div>
            <div
              className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(opponent.currentBeast.health / opponent.currentBeast.maxHealth) * 100}%`,
                maxWidth: "90%",
              }}
            ></div>
          </div>
        </div>

        <div className="text-5xl font-bold font-dark-mystic text-center">
          VS
        </div>

        {/* Player Beast Card */}
        <div className={`mt-8 mb-4 relative w-[220px] h-[220px] ${playerAttacking ? 'animate-attack' : ''} ${playerShake ? 'animate-shake' : ''}`}>
          <Image
            src={player.currentBeast.image}
            alt={player.currentBeast.name}
            width={220}
            height={300}
            className={`rounded-lg border-4 ${
              player.currentBeast.type === "Common"
                ? "border-gray-400"
                : player.currentBeast.type === "Rare"
                ? "border-blue-400"
                : player.currentBeast.type === "Epic"
                ? "border-purple-400"
                : "border-yellow-400"
            }`}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg">
            <div className="text-center font-dark-mystic text-xl">
              {player.currentBeast.name}
            </div>
            <div className="flex justify-between text-sm px-2">
              <div>
                HEALTH
                <br />
                {player.currentBeast.health}
              </div>
              <div>
                ATTACK
                <br />
                {player.currentBeast.attack}
              </div>
            </div>
          </div>
          <div
            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-red-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(player.currentBeast.health / player.currentBeast.maxHealth) * 100}%`,
              maxWidth: "90%",
            }}
          ></div>
        </div>

        <div className="flex flex-col items-center justify-center">
          {/* Turn Indicator */}
          <div className="text-xl font-bold mb-4">
            {currentTurn === account.address ? "Your Turn" : "Opponent's Turn"}
          </div>

          {/* Battle Result */}
          {gameOver && battleResult && (
            <div
              className={`text-3xl font-bold my-4 ${
                battleResult === "win" ? "text-green-600" : "text-red-600"
              }`}
            >
              {battleResult === "win" ? "VICTORY!" : "DEFEAT!"}
            </div>
          )}

          {/* Battle Log */}
          {battleLog.length > 0 && (
            <div className="bg-gray-100 p-3 rounded-lg w-full max-h-32 overflow-y-auto mb-4 text-sm">
              {battleLog.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
