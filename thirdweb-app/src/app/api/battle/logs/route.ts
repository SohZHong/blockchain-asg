import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomCode = searchParams.get('roomCode');
    const limit = searchParams.get('limit') || '10';

    if (!roomCode) {
      return NextResponse.json(
        { error: 'Missing room code' },
        { status: 400 }
      );
    }

    // Get battle logs for the room
    const { data: logs, error } = await supabase
      .from('battleLogs')
      .select('*')
      .eq('code', roomCode)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) {
      throw error;
    }

    // Get the last attacker if any logs exist
    const lastAttacker = logs && logs.length > 0 ? logs[0].attacker : null;

    return NextResponse.json({
      logs,
      lastAttacker
    });
  } catch (error) {
    console.error('Error in battle logs API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch battle logs' },
      { status: 500 }
    );
  }
} 