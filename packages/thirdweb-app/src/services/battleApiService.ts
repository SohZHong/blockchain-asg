import { BattleState, Room } from "@/types/battle";
import { RoomService } from "./roomService";

export class BattleApiService {
  /**
   * Fetch the current battle status
   */
  static async getBattleStatus(roomCode: string): Promise<{
    status: Room['status'];
    player1: {
      address: string;
      health: number;
      attack: { min: number; max: number };
      nftName?: string;
    };
    player2: {
      address: string;
      health: number;
      attack: { min: number; max: number };
      nftName?: string;
    } | null;
    currentTurn: string | null;
  }> {
    try {
      const response = await fetch(`/api/battle/status?roomCode=${roomCode}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching battle status:', error);
      // Fallback to direct database access if API fails
      const roomData = await RoomService.getRoom(roomCode);
      if (!roomData) throw new Error('Room not found');
      
      return {
        status: roomData.status,
        player1: {
          address: roomData.player1_address,
          health: roomData.player1_health,
          attack: { min: roomData.player1_atk_min, max: roomData.player1_atk_max },
          nftName: roomData.player1_nft_name || undefined
        },
        player2: roomData.player2_address ? {
          address: roomData.player2_address,
          health: roomData.player2_health || 0,
          attack: { 
            min: roomData.player2_atk_min || 0, 
            max: roomData.player2_atk_max || 0 
          },
          nftName: roomData.player2_nft_name || undefined
        } : null,
        currentTurn: roomData.current_turn
      };
    }
  }

  /**
   * Perform an attack
   */
  static async performAttack(roomCode: string, attacker: string, damage: number): Promise<{
    success: boolean;
    newHealth: number;
    targetPlayer: 'player1' | 'player2';
    gameOver: boolean;
  }> {
    try {
      const response = await fetch('/api/battle/attack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomCode,
          attacker,
          damage,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error performing attack:', error);
      
      // Fallback to direct database operations if API fails
      const room = await RoomService.getRoom(roomCode);
      if (!room) throw new Error('Room not found');
      
      const isPlayer1 = attacker === room.player1_address;
      const targetHealth = isPlayer1 ? 'player2_health' : 'player1_health';
      const currentHealth = room[targetHealth] ?? 0;
      const newHealth = Math.max(0, currentHealth - damage);
      
      // Create battle log
      try {
        const supabase = (await import('@supabase/supabase-js')).createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        await supabase
          .from('battleLogs')
          .insert({
            code: roomCode,
            attacker: attacker,
            damage: damage
          });
      } catch (logError) {
        console.error('Failed to log battle action:', logError);
      }
      
      // Update health
      await RoomService.updateBattleState(roomCode, {
        [targetHealth]: newHealth
      });
      
      // Check if game over
      let gameOver = false;
      if (newHealth <= 0) {
        await RoomService.updateRoomStatus(roomCode, 'completed');
        gameOver = true;
      }
      
      return {
        success: true,
        newHealth,
        targetPlayer: isPlayer1 ? 'player2' : 'player1',
        gameOver
      };
    }
  }

  /**
   * Fetch battle logs
   */
  static async getBattleLogs(roomCode: string, limit: number = 10): Promise<{
    logs: Array<{
      id: number;
      code: string;
      attacker: string;
      damage: number;
      created_at: string;
    }>;
    lastAttacker: string | null;
  }> {
    try {
      const response = await fetch(`/api/battle/logs?roomCode=${roomCode}&limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching battle logs:', error);
      
      // Fallback to direct database query
      try {
        const supabase = (await import('@supabase/supabase-js')).createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data: logs, error } = await supabase
          .from('battleLogs')
          .select('*')
          .eq('code', roomCode)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        
        const lastAttacker = logs && logs.length > 0 ? logs[0].attacker : null;
        
        return {
          logs: logs || [],
          lastAttacker
        };
      } catch (dbError) {
        console.error('Failed to fetch logs from database:', dbError);
        return { logs: [], lastAttacker: null };
      }
    }
  }

  /**
   * Generate random damage value between min and max
   */
  static generateRandomDamage(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Subscribe to battle updates
   * This is a wrapper around RoomService.subscribeToRoom for consistency
   */
  static subscribeToBattle(roomCode: string, onUpdate: (payload: any) => void) {
    return RoomService.subscribeToRoom(roomCode, onUpdate);
  }
} 