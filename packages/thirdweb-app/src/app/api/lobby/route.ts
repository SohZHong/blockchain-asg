import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Generate a random 4-character code
function generateLobbyCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Create a new lobby
export async function POST(request: NextRequest) {
  try {
    const { playerAddress } = await request.json();
    
    if (!playerAddress) {
      return NextResponse.json(
        { error: "Player address is required" },
        { status: 400 }
      );
    }

    // Try to generate a unique code (max 5 attempts)
    let code;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      code = generateLobbyCode();
      
      // Check if code already exists
      const { data: existingLobby, error: checkError } = await supabase
        .from("gameLobbies")
        .select("code")
        .eq("code", code)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error("Error checking code:", checkError);
        return NextResponse.json(
          { error: "Failed to check lobby code" },
          { status: 500 }
        );
      }

      if (!existingLobby) {
        break; // Found a unique code
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: "Failed to generate unique lobby code" },
        { status: 500 }
      );
    }

    // Create new lobby
    const { data, error } = await supabase
      .from("gameLobbies")
      .insert([
        {
          code,
          player1_address: playerAddress,
          player1_health: 100,
          player2_health: null,
          player1_atk_min: 20,
          player1_atk_max: 80,
          player2_atk_min: null,
          player2_atk_max: null,
          created_at: new Date().toISOString(),
          status: 'open'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create lobby" },
        { status: 500 }
      );
    }

    return NextResponse.json({ code, data });
  } catch (error) {
    console.error("Error creating lobby:", error);
    return NextResponse.json(
      { error: "Failed to create lobby" },
      { status: 500 }
    );
  }
}

// Join or leave a lobby
export async function PATCH(request: NextRequest) {
  try {
    const { code, playerAddress, action } = await request.json();

    if (!code || !playerAddress || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action === 'join') {
      // Check if lobby exists and is available
      const { data: lobby, error: fetchError } = await supabase
        .from("gameLobbies")
        .select("*")
        .eq("code", code)
        .single();

      if (fetchError || !lobby) {
        return NextResponse.json(
          { error: "Lobby not found" },
          { status: 404 }
        );
      }

      if (lobby.player2_address) {
        return NextResponse.json(
          { error: "Lobby is full" },
          { status: 400 }
        );
      }

      // Join the lobby
      const { data, error } = await supabase
        .from("gameLobbies")
        .update({
          player2_address: playerAddress,
          player2_health: lobby.player1_health,
          player2_atk_min: lobby.player1_atk_min,
          player2_atk_max: lobby.player1_atk_max,
          status: 'full'
        })
        .eq("code", code)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return NextResponse.json({ data });
    } 
    else if (action === 'leave') {
      // Check which player is leaving
      const { data: lobby, error: fetchError } = await supabase
        .from("gameLobbies")
        .select("*")
        .eq("code", code)
        .single();

      if (fetchError || !lobby) {
        return NextResponse.json(
          { error: "Lobby not found" },
          { status: 404 }
        );
      }

      // If player 2 is leaving, just remove them
      if (lobby.player2_address === playerAddress) {
        const { data, error } = await supabase
          .from("gameLobbies")
          .update({
            player2_address: null,
            player2_health: null,
            player2_atk_min: null,
            player2_atk_max: null,
            status: 'open'
          })
          .eq("code", code)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ data });
      }
      
      // If player 1 is leaving, delete the lobby
      if (lobby.player1_address === playerAddress) {
        const { error } = await supabase
          .from("gameLobbies")
          .delete()
          .eq("code", code);

        if (error) throw error;
        return NextResponse.json({ message: "Lobby deleted" });
      }
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating lobby:", error);
    return NextResponse.json(
      { error: "Failed to update lobby" },
      { status: 500 }
    );
  }
} 