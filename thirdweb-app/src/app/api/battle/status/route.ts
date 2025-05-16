import { RoomService } from '@/services/roomService';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomCode = searchParams.get('roomCode');

    if (!roomCode) {
      return NextResponse.json(
        { error: 'Missing room code' },
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

    // Return room details and status
    return NextResponse.json({
      status: room.status,
      player1: {
        address: room.player1_address,
        health: room.player1_health,
        attack: { min: room.player1_atk_min, max: room.player1_atk_max },
        nftName: room.player1_nft_name || undefined
      },
      player2: room.player2_address ? {
        address: room.player2_address,
        health: room.player2_health,
        attack: { min: room.player2_atk_min, max: room.player2_atk_max },
        nftName: room.player2_nft_name || undefined
      } : null,
      currentTurn: room.current_turn
    });
  } catch (error) {
    console.error('Error in battle status API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch battle status' },
      { status: 500 }
    );
  }
} 