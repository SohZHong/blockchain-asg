import { createClient } from '@supabase/supabase-js';
import { Room } from '@/types/battle';

// Ensure we're creating a new instance only when in the browser
const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    console.warn('Supabase client being initialized in a server context');
  }
  
  try {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      }
    );
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    throw error;
  }
};

// Initialize the client
const supabase = getSupabaseClient();

export interface RoomConfig {
  playerAddress: string;
  atkMin: number;
  atkMax: number;
  health: number;
  nftName?: string;
}

// Define the type to match the actual database columns
export interface GameState {
  player1_health?: number;
  player2_health?: number;
  status?: 'waiting' | 'ready' | 'playing' | 'completed';
}

export class RoomService {
  static async createRoom(config: RoomConfig): Promise<string> {
    const code = this.generateRoomCode();
    
    const { data, error } = await supabase
      .from('gameLobbies')
      .insert([{
        code,
        player1_address: config.playerAddress,
        player1_atk_min: config.atkMin,
        player1_atk_max: config.atkMax,
        player1_health: config.health,
        status: 'waiting'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      throw error;
    }

    return code;
  }

  static async joinRoom(code: string, config: RoomConfig): Promise<Room> {
    const { data, error } = await supabase
      .from('gameLobbies')
      .update({
        player2_address: config.playerAddress,
        player2_atk_min: config.atkMin,
        player2_atk_max: config.atkMax,
        player2_health: config.health,
        status: 'ready'
      })
      .eq('code', code)
      .select()
      .single();

    if (error) {
      console.error('Error joining room:', error);
      throw error;
    }

    return data;
  }

  static subscribeToRoom(code: string, onUpdate: (payload: any) => void) {
    const channel = supabase.channel(`game-${code}`);

    // Subscribe to game lobby updates
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'gameLobbies',
        filter: `code=eq.${code}`
      },
      (payload) => {
        console.log('Game lobby update received:', payload);
        payload.table = 'gameLobbies';
        onUpdate(payload);
      }
    );

    // Subscribe to battle log updates
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'battleLogs',
        filter: `code=eq.${code}`
      },
      (payload) => {
        console.log('Battle log update received:', payload);
        payload.table = 'battleLogs';
        onUpdate(payload);
      }
    );

    channel.subscribe((status) => {
      console.log('Subscription status:', status);
    });

    return channel;
  }

  static async getRoom(code: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('gameLobbies')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      return null;
    }

    return data;
  }

  static async updateBattleState(code: string, updates: GameState) {
    const { error } = await supabase
      .from('gameLobbies')
      .update(updates)
      .eq('code', code);

    if (error) {
      console.error('Error updating battle state:', error);
      throw error;
    }
  }

  static async updateRoomStatus(code: string, status: Room['status']) {
    const { error } = await supabase
      .from('gameLobbies')
      .update({ status })
      .eq('code', code);

    if (error) {
      console.error('Error updating room status:', error);
      throw error;
    }
  }

  private static generateRoomCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return code;
  }
} 