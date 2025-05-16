import { createClient } from '@supabase/supabase-js';
import { RoomService } from '@/services/roomService';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { roomCode, attacker, damage } = await request.json();

    if (!roomCode || !attacker || damage === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the current room state
    const room = await RoomService.getRoom(roomCode);
    
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Determine which player is attacking
    const isPlayer1 = attacker === room.player1_address;
    
    // Determine target health field
    const targetHealth = isPlayer1 ? 'player2_health' : 'player1_health';
    const currentHealth = room[targetHealth] ?? 0;
    const newHealth = Math.max(0, currentHealth - damage);

    // Record battle log in Supabase
    await supabase
      .from('battleLogs')
      .insert({
        code: roomCode,
        attacker: attacker,
        damage: damage
      });

    // Update health in game state
    await RoomService.updateBattleState(roomCode, {
      [targetHealth]: newHealth
    });

    // Check if game is over (health reached 0)
    let gameOver = false;
    if (newHealth <= 0) {
      // Update room status to completed
      await RoomService.updateRoomStatus(roomCode, 'completed');
      gameOver = true;
    }

    return NextResponse.json({
      success: true,
      newHealth,
      targetPlayer: isPlayer1 ? 'player2' : 'player1',
      gameOver
    });
  } catch (error) {
    console.error('Error in attack API:', error);
    return NextResponse.json(
      { error: 'Failed to process attack' },
      { status: 500 }
    );
  }
} 