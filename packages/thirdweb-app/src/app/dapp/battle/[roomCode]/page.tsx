"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { FaFistRaised } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { RoomService } from "@/services/roomService";
import { BattleApiService } from "@/services/battleApiService";
import { createClient } from '@supabase/supabase-js';
import { Room } from "@/types/battle";
import { toast } from "sonner";
import Image from "next/image";

interface PageParams {
  roomCode: string;
}

export default function BattleRoomPage({ params }: { params: PageParams }) {
  const { roomCode } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const battleStartedRef = useRef(false);
  const [supabase] = useState(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));
  const [room, setRoom] = useState<any>(null);
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'playing' | 'finished'>('waiting');
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastAttacker, setLastAttacker] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);
  const [initialP1Health, setInitialP1Health] = useState<number | null>(null);
  const [initialP2Health, setInitialP2Health] = useState<number | null>(null);
  const [isAttacking, setIsAttacking] = useState(false);

  // Get current user's address from URL parameters
  const currentUserAddress = searchParams.get('username') || 'Anonymous';
  // Get the NFT image from URL parameter
  const myNftImage = searchParams.get('nftImage');
  
  // State to store opponent's NFT image when it's received
  const [opponentNftImage, setOpponentNftImage] = useState<string | null>(null);

  // Calculate if it's the current player's turn
  const isMyTurn = useMemo(() => {
    if (!room || !lastAttacker) {
      // If no one has attacked yet, player1 goes first
      return currentUserAddress === room?.player1_address;
    }
    // It's my turn if the last attacker was NOT me
    return lastAttacker !== currentUserAddress;
  }, [currentUserAddress, lastAttacker, room]);

  // Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCountdownActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setGameState('playing');
      setIsCountdownActive(false);
      // Start the game by updating status to playing
      RoomService.updateRoomStatus(roomCode, 'playing');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCountdownActive, countdown, roomCode]);

  // Fetch initial battle logs
  useEffect(() => {
    const fetchBattleLogs = async () => {
      if (!room) return;
      
      try {
        const { logs, lastAttacker: lastAttackerFromLogs } = await BattleApiService.getBattleLogs(roomCode);
        
        if (lastAttackerFromLogs) {
          setLastAttacker(lastAttackerFromLogs);
          console.log('Last attacker:', lastAttackerFromLogs);
        }
        
        // Format logs for display
        if (logs && logs.length > 0) {
          const formattedLogs = logs.map(log => 
            `${log.attacker} attacked for ${log.damage} damage!`
          );
          setBattleLog(formattedLogs.reverse()); // Reverse to show oldest first
        }
      } catch (error) {
        console.error('Error fetching battle logs:', error);
      }
    };

    fetchBattleLogs();
  }, [room, roomCode]);

  // Set up subscription for all game updates
  useEffect(() => {
    const initializeRoom = async () => {
      try {
        console.log('Fetching room data...');
        // Get current battle status from API
        const battleStatus = await BattleApiService.getBattleStatus(roomCode);
        
        if (!battleStatus) {
          console.error('Room not found');
          router.push('/dapp/battle');
          return;
        }

        // Store initial health values to use as max health
        if (initialP1Health === null) {
          setInitialP1Health(battleStatus.player1.health);
        }
        if (battleStatus.player2 && initialP2Health === null) {
          setInitialP2Health(battleStatus.player2.health);
        }

        // Convert API response to room structure
        const roomData = {
          code: roomCode,
          status: battleStatus.status,
          player1_address: battleStatus.player1.address,
          player1_health: battleStatus.player1.health,
          player1_atk_min: battleStatus.player1.attack.min,
          player1_atk_max: battleStatus.player1.attack.max,
          player1_nft_name: battleStatus.player1.nftName,
          player2_address: battleStatus.player2?.address || null,
          player2_health: battleStatus.player2?.health || null,
          player2_atk_min: battleStatus.player2?.attack.min || null,
          player2_atk_max: battleStatus.player2?.attack.max || null,
          player2_nft_name: battleStatus.player2?.nftName || null,
          current_turn: battleStatus.currentTurn
        };
        
        setRoom(roomData);
        console.log('Room data:', roomData);
        
        // If room is already full, initialize game state
        if (roomData.status === 'ready' && roomData.player2_address) {
          console.log('Room is now full, starting countdown');
          setGameState('ready');
          setIsCountdownActive(true);
          setCountdown(3);

          if(currentUserAddress === roomData.player1_address && !battleStartedRef.current) {
            // Set the ref to true to prevent duplicate calls
            battleStartedRef.current = true;
            console.log('Will call start-battle API once...');
            console.log('Game state BEFORE start-battle API call:', { 
              player1: { 
                address: roomData.player1_address,
                health: roomData.player1_health,
                atk_min: roomData.player1_atk_min,
                atk_max: roomData.player1_atk_max,
                nft_name: roomData.player1_nft_name
              },
              player2: { 
                address: roomData.player2_address,
                health: roomData.player2_health,
                atk_min: roomData.player2_atk_min,
                atk_max: roomData.player2_atk_max,
                nft_name: roomData.player2_nft_name
              }
            });
            setTimeout(async () => {
              try {
                console.log('Calling start-battle API...');
                const response = await fetch("/api/start-battle", {
                  method: "POST",
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    address: roomData.player1_address,
                    opponent: roomData.player2_address,
                    player1MinDmg: roomData.player1_atk_min,
                    player1MaxDmg: roomData.player1_atk_max,
                    player2MinDmg: roomData.player2_atk_min,
                    player2MaxDmg: roomData.player2_atk_max,
                  }),
                });
                
                const res = await response.json();
                if (res.success) {
                  console.log('Battle started successfully:', res);
                  // Get latest room state after battle start
                  const updatedBattleStatus = await BattleApiService.getBattleStatus(roomCode);
                  console.log('Game state AFTER start-battle API call:', { 
                    player1: { 
                      address: updatedBattleStatus.player1.address,
                      health: updatedBattleStatus.player1.health,
                      attack: updatedBattleStatus.player1.attack
                    },
                    player2: updatedBattleStatus.player2 ? { 
                      address: updatedBattleStatus.player2.address,
                      health: updatedBattleStatus.player2.health,
                      attack: updatedBattleStatus.player2.attack
                    } : null
                  });
                  
                  // Force a refresh of battle status to synchronize data
                  refreshBattleStatus();
                  
                  toast("Battle Started", {
                    description: "Both players have joined. The battle is beginning!",
                    action: {
                      label: "Close",
                      onClick: () => console.log("Closed"),
                    },
                  });
                } else {
                  console.error('Error starting battle:', res);
                  toast("Error Starting Battle", {
                    description: "There was an issue starting the battle. Gameplay will continue normally.",
                    action: {
                      label: "Close",
                      onClick: () => console.log("Closed"),
                    },
                  });
                }
              } catch (error) {
                console.error('Error calling start-battle API:', error);
              }
            }, 500); // small delay to ensure state is updated
          }
        }
        
        // Set up subscription for all game updates
        const sub = BattleApiService.subscribeToBattle(roomCode, (payload) => {
          console.log('Update received:', payload);
          
          // Check if this is a new player joining with NFT image
          if (payload.table === 'gameLobbies' && 
              payload.new.player2_address && 
              payload.new.status === 'ready' &&
              searchParams.get('nftImage') && 
              currentUserAddress === payload.new.player1_address) {
            // Broadcast my NFT image for the new player
            supabase.channel(`nft-image-${roomCode}`).send({
              type: 'broadcast',
              event: 'player1-nft-image',
              payload: { nftImage: searchParams.get('nftImage') }
            });
          }
          
          // Handle game lobby updates
          if (payload.table === 'gameLobbies') {
            const newRoom = payload.new;
            console.log('New room state:', newRoom);
            setRoom((prev: Room | null) => {
              const updatedRoom = prev ? { ...prev, ...newRoom } : newRoom;
              console.log('Updated room state:', updatedRoom);
              
              // Check for game completion
              if (updatedRoom.status === 'completed') {
                console.log('Game completed, checking winner...');
                const isPlayer1 = currentUserAddress === updatedRoom.player1_address;
                if ((isPlayer1 && updatedRoom.player2_health <= 0) || (!isPlayer1 && updatedRoom.player1_health <= 0)) {
                  console.log('Player won by reducing health to 0!');
                  setBattleResult('victory');
                  setShowResultModal(true);
                } else {
                  console.log('Player lost by health reaching 0!');
                  setBattleResult('defeat');
                  setShowResultModal(true);
                }
              }
              
              return updatedRoom;
            });

            if (newRoom.status === 'completed') {
              setGameState('finished');
            }
          }
          
          // Handle battle log updates
          if (payload.table === 'battleLogs' && payload.eventType === 'INSERT') {
            const newLog = payload.new;
            setLastAttacker(newLog.attacker);
            setBattleLog(prev => [...prev, `${newLog.attacker} attacked for ${newLog.damage} damage!`]);
          }
        });
        
        // Listen for opponent's NFT image
        const nftImageChannel = supabase.channel(`nft-image-${roomCode}`);
        
        // Player 1 listens for player 2's NFT image
        if (currentUserAddress === roomData.player1_address) {
          nftImageChannel.on('broadcast', { event: 'player2-nft-image' }, ({ payload }) => {
            console.log('Received Player 2 NFT image:', payload.nftImage);
            setOpponentNftImage(payload.nftImage);
          });
        }
        
        // Player 2 listens for player 1's NFT image
        if (currentUserAddress === roomData.player2_address) {
          nftImageChannel.on('broadcast', { event: 'player1-nft-image' }, ({ payload }) => {
            console.log('Received Player 1 NFT image:', payload.nftImage);
            setOpponentNftImage(payload.nftImage);
          });
          
          // Player 2 broadcasts their NFT image when joining
          if (searchParams.get('nftImage')) {
            nftImageChannel.send({
              type: 'broadcast',
              event: 'player2-nft-image',
              payload: { nftImage: searchParams.get('nftImage') }
            });
          }
        }
        
        nftImageChannel.subscribe();
        setSubscription(sub);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing room:', error);
        setError('Failed to initialize battle room');
      }
    };

    initializeRoom();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [roomCode, router, currentUserAddress, searchParams, myNftImage, initialP1Health, initialP2Health]);

  const handleReturnHome = () => {
    if (subscription) {
      subscription.unsubscribe();
    }
    router.push('/dapp');
  };

  const handleAttack = async (damage: number) => {
    if (!room || !isMyTurn) return;

    try {
      setIsAttacking(true);
      
      // Call the attack API
      const result = await BattleApiService.performAttack(roomCode, currentUserAddress, damage);

      console.log('Attack result:', result);
      
      // Toast notification for successful attack
      toast(`You attacked for ${damage} damage!`, {
        description: `You dealt ${damage} damage to your opponent.`,
      });
      
      // Update UI immediately based on the attack result
      if (result.gameOver) {
        // Set result based on who won immediately
        setBattleResult('victory');
        setShowResultModal(true);
        toast("Victory!", {
          description: "You have defeated your opponent!",
        });
      }
    } catch (error) {
      console.error('Error making move:', error);
      setError('Failed to make move');
      toast("Attack Failed", {
        description: "There was an error processing your attack.",
      });
    } finally {
      // We don't set isAttacking back to false since the turn has changed
      // It will reset when it becomes the player's turn again
    }
  };

  const handleAttackClick = async () => {
    if (!room || !isMyTurn || isAttacking) return;
    
    // Get attack range for current player
    const isPlayer1 = currentUserAddress === room.player1_address;
    const minDamage = isPlayer1 ? room.player1_atk_min : room.player2_atk_min;
    const maxDamage = isPlayer1 ? room.player1_atk_max : room.player2_atk_max;
    
    // Generate random damage between min-max
    const damage = BattleApiService.generateRandomDamage(minDamage, maxDamage);
    await handleAttack(damage);
  };

  // Calculate if current player is player1
  const isPlayer1 = useMemo(() => {
    return currentUserAddress === room?.player1_address;
  }, [currentUserAddress, room?.player1_address]);

  // Calculate health percentage for player 1
  const player1HealthPercent = useMemo(() => {
    if (!room || !initialP1Health) return 100;
    return Math.max(0, Math.min(100, (room.player1_health / initialP1Health) * 100));
  }, [room, initialP1Health]);

  // Calculate health percentage for player 2
  const player2HealthPercent = useMemo(() => {
    if (!room || !initialP2Health) return 100;
    if (room.player2_health === null) return 0;
    return Math.max(0, Math.min(100, (room.player2_health / initialP2Health) * 100));
  }, [room, initialP2Health]);

  // Get player names from correct perspective
  const myName = currentUserAddress;
  const opponentName = useMemo(() => {
    if (!room) return 'Waiting...';
    return isPlayer1 ? room.player2_address : room.player1_address;
  }, [isPlayer1, room]);

  // Reset isAttacking when it's the player's turn again
  useEffect(() => {
    if (isMyTurn) {
      setIsAttacking(false);
    }
  }, [isMyTurn]);

  // Define a function to refresh battle status
  const refreshBattleStatus = useCallback(async () => {
    try {
      console.log('Refreshing battle status...');
      const battleStatus = await BattleApiService.getBattleStatus(roomCode);
      
      if (!battleStatus) {
        console.error('Room not found during refresh');
        return;
      }
      
      // Update initial health values if needed
      if (initialP1Health === null) {
        setInitialP1Health(battleStatus.player1.health);
      }
      if (battleStatus.player2 && initialP2Health === null) {
        setInitialP2Health(battleStatus.player2.health);
      }
      
      // Create updated room data
      const updatedRoomData = {
        code: roomCode,
        status: battleStatus.status,
        player1_address: battleStatus.player1.address,
        player1_health: battleStatus.player1.health,
        player1_atk_min: battleStatus.player1.attack.min,
        player1_atk_max: battleStatus.player1.attack.max,
        player1_nft_name: battleStatus.player1.nftName,
        player2_address: battleStatus.player2?.address || null,
        player2_health: battleStatus.player2?.health || null,
        player2_atk_min: battleStatus.player2?.attack.min || null,
        player2_atk_max: battleStatus.player2?.attack.max || null,
        player2_nft_name: battleStatus.player2?.nftName || null,
        current_turn: battleStatus.currentTurn
      };
      
      console.log('Updated room data after refresh:', updatedRoomData);
      
      // Update room state
      setRoom(updatedRoomData);
    } catch (error) {
      console.error('Error refreshing battle status:', error);
    }
  }, [roomCode, initialP1Health, initialP2Health]);

  // Reload and refresh room data when status changes to 'playing'
  useEffect(() => {
    if (room?.status === 'playing' && gameState === 'playing') {
      console.log('Game is now playing, refreshing battle data...');
      refreshBattleStatus();
    }
  }, [room?.status, gameState, refreshBattleStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Loading battle...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-red-500">{error || 'Battle not found'}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/dapp/dapp-bg.png')] bg-cover bg-center md:py-10">
      <div className="flex flex-col justify-between bg-white/90 w-screen h-screen md:w-[650px] md:h-auto rounded-lg px-6 relative py-6">
        {/* Room Code Display */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-600 px-4 py-2 rounded-lg text-white font-bold">
          Room: {roomCode}
        </div>

        {/* Status Display */}
        {gameState === 'ready' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-black/80 backdrop-blur-md p-8 rounded-xl text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Both Players Ready!</h2>
              <div className="text-6xl font-bold text-blue-500 animate-pulse">
                {countdown}
              </div>
            </div>
          </div>
        )}

        {/* Player Names and Health Bars */}
        {room && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Player 1 Section - Always shows Player 1's data regardless of who is viewing */}
            <div className={`p-4 rounded-lg ${currentUserAddress === room.player1_address ? 'bg-blue-800/50 border border-blue-500' : 'bg-gray-800/50'}`}>
              <div className="flex items-center mb-3">
                <div className="relative w-16 h-16 mr-3 rounded-full overflow-hidden border-2 border-blue-500">
                  {/* Show correct NFT image based on whose view it is */}
                  {currentUserAddress === room.player1_address ? (
                    myNftImage ? (
                      <Image
                        src={myNftImage}
                        alt={room.player1_nft_name || "Player 1 NFT"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-900 flex items-center justify-center text-white text-2xl">
                        P1
                      </div>
                    )
                  ) : (
                    opponentNftImage ? (
                      <Image
                        src={opponentNftImage}
                        alt={room.player1_nft_name || "Player 1 NFT"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-900 flex items-center justify-center text-white text-2xl">
                        P1
                      </div>
                    )
                  )}
                </div>
                <div>
                  <div className="font-bold">
                    {currentUserAddress === room.player1_address ? "You" : "Opponent"}
                  </div>
                  <div className="text-xs text-gray-300 truncate max-w-[150px]">
                    {room.player1_address}
                  </div>
                  {room.player1_nft_name && (
                    <div className="mt-1 text-sm text-blue-300 font-semibold">
                      {room.player1_nft_name}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Health bar and stats */}
              <div className="mb-2">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${player1HealthPercent}%` }}
                  ></div>
                </div>
                <div className="text-sm mt-1">
                  HP: {room.player1_health || 0} / {initialP1Health || room.player1_health || 100}
                </div>
              </div>
            </div>

            {/* Player 2 Section - Always shows Player 2's data regardless of who is viewing */}
            <div className={`p-4 rounded-lg ${currentUserAddress === room.player2_address ? 'bg-blue-800/50 border border-blue-500' : 'bg-gray-800/50'}`}>
              <div className="flex items-center mb-3">
                <div className="relative w-16 h-16 mr-3 rounded-full overflow-hidden border-2 border-red-500">
                  {/* Show correct NFT image based on whose view it is */}
                  {currentUserAddress === room.player2_address ? (
                    myNftImage ? (
                      <Image
                        src={myNftImage}
                        alt={room.player2_nft_name || "Player 2 NFT"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-red-900 flex items-center justify-center text-white text-2xl">
                        P2
                      </div>
                    )
                  ) : (
                    opponentNftImage ? (
                      <Image
                        src={opponentNftImage}
                        alt={room.player2_nft_name || "Player 2 NFT"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-red-900 flex items-center justify-center text-white text-2xl">
                        P2
                      </div>
                    )
                  )}
                </div>
                <div>
                  <div className="font-bold">
                    {currentUserAddress === room.player2_address ? "You" : "Opponent"}
                  </div>
                  <div className="text-xs text-gray-300 truncate max-w-[150px]">
                    {room.player2_address || "Waiting for player..."}
                  </div>
                  {room.player2_nft_name && (
                    <div className="mt-1 text-sm text-red-300 font-semibold">
                      {room.player2_nft_name}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Health bar and stats */}
              <div className="mb-2">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${player2HealthPercent}%` }}
                  ></div>
                </div>
                <div className="text-sm mt-1">
                  HP: {room.player2_health || 0} / {initialP2Health || room.player2_health || 100}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Turn Indicator */}
        {gameState === 'playing' && (
          <div className="text-xl font-bold text-center">
            {isMyTurn ? "Your Turn" : "Opponent's Turn"}
          </div>
        )}

        {/* Attack Button */}
        {gameState === 'playing' && isMyTurn && (
          <div className=" bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <button
              onClick={handleAttackClick}
              disabled={isAttacking}
              className={`w-full ${isAttacking ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform ${isAttacking ? '' : 'hover:scale-105'} flex items-center justify-center gap-2`}
            >
              {isAttacking ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span>Storing attack onchain...</span>
                </>
              ) : (
                <>
                  <FaFistRaised className="text-xl" />
                  <span>Attack!</span>
                  <span className="text-sm">
                    ({isPlayer1 ? room.player1_atk_min : room.player2_atk_min}-
                    {isPlayer1 ? room.player1_atk_max : room.player2_atk_max} damage)
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Battle Log */}
        <div className="mt-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 max-h-48 overflow-y-auto">
          <h3 className="text-lg font-bold mb-2 text-white">Battle Log</h3>
          {battleLog.map((log, index) => (
            <div key={index} className="text-white mb-1">{log}</div>
          )).reverse()}
        </div>

        {/* Result Modal */}
        {battleResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
              <h2 className="text-3xl font-bold mb-4">
                {battleResult === 'victory' ? 'Victory!' : 'Defeat!'}
              </h2>
              <p className="text-xl mb-6">
                {battleResult === 'victory' 
                  ? 'You have defeated your opponent!'
                  : 'You have been defeated!'}
              </p>
              <button
                onClick={handleReturnHome}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 