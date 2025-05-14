export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      battleLogs: {
        Row: {
          attacker: string | null;
          battle_id: number | null;
          code: string | null;
          created_at: string;
          damage: number | null;
          id: number;
        };
        Insert: {
          attacker?: string | null;
          battle_id?: number | null;
          code?: string | null;
          created_at?: string;
          damage?: number | null;
          id?: number;
        };
        Update: {
          attacker?: string | null;
          battle_id?: number | null;
          code?: string | null;
          created_at?: string;
          damage?: number | null;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "battleLogs_battle_id_fkey";
            columns: ["battle_id"];
            isOneToOne: false;
            referencedRelation: "gameLobbies";
            referencedColumns: ["battle_id"];
          },
          {
            foreignKeyName: "battleLogs_code_fkey";
            columns: ["code"];
            isOneToOne: false;
            referencedRelation: "gameLobbies";
            referencedColumns: ["code"];
          }
        ];
      };
      events: {
        Row: {
          address: string;
          created_at: string;
          description: string | null;
          event_id: number | null;
          id: number;
          is_started: boolean;
          location: string | null;
          name: string | null;
          organizer: string | null;
          participant_limit: number | null;
          registered_participants: number | null;
          reward_count: number | null;
          start_date: string | null;
        };
        Insert: {
          address: string;
          created_at?: string;
          description?: string | null;
          event_id?: number | null;
          id?: number;
          is_started?: boolean;
          location?: string | null;
          name?: string | null;
          organizer?: string | null;
          participant_limit?: number | null;
          registered_participants?: number | null;
          reward_count?: number | null;
          start_date?: string | null;
        };
        Update: {
          address?: string;
          created_at?: string;
          description?: string | null;
          event_id?: number | null;
          id?: number;
          is_started?: boolean;
          location?: string | null;
          name?: string | null;
          organizer?: string | null;
          participant_limit?: number | null;
          registered_participants?: number | null;
          reward_count?: number | null;
          start_date?: string | null;
        };
        Relationships: [];
      };
      gameLobbies: {
        Row: {
          battle_id: number | null;
          code: string;
          created_at: string;
          id: number;
          player1_address: string;
          player1_atk_max: number;
          player1_atk_min: number;
          player1_health: number;
          player2_address: string | null;
          player2_atk_max: number | null;
          player2_atk_min: number | null;
          player2_health: number | null;
          status: string;
        };
        Insert: {
          battle_id?: number | null;
          code: string;
          created_at?: string;
          id?: number;
          player1_address: string;
          player1_atk_max: number;
          player1_atk_min: number;
          player1_health: number;
          player2_address?: string | null;
          player2_atk_max?: number | null;
          player2_atk_min?: number | null;
          player2_health?: number | null;
          status?: string;
        };
        Update: {
          battle_id?: number | null;
          code?: string;
          created_at?: string;
          id?: number;
          player1_address?: string;
          player1_atk_max?: number;
          player1_atk_min?: number;
          player1_health?: number;
          player2_address?: string | null;
          player2_atk_max?: number | null;
          player2_atk_min?: number | null;
          player2_health?: number | null;
          status?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
