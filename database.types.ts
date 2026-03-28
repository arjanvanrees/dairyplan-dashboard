export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      chats: {
        Row: {
          created_at: string
          id: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cows: {
        Row: {
          birth_date: string | null
          calving_date: string | null
          cow_number: number
          created_at: string
          group_number: number | null
          lact_no: number | null
          name: string | null
          registration_number: string | null
          responder: string | null
          status_code: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          calving_date?: string | null
          cow_number: number
          created_at?: string
          group_number?: number | null
          lact_no?: number | null
          name?: string | null
          registration_number?: string | null
          responder?: string | null
          status_code?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          calving_date?: string | null
          cow_number?: number
          created_at?: string
          group_number?: number | null
          lact_no?: number | null
          name?: string | null
          registration_number?: string | null
          responder?: string | null
          status_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          parts: Json | null
          role: Database["public"]["Enums"]["message_role"]
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: string
          parts?: Json | null
          role: Database["public"]["Enums"]["message_role"]
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          parts?: Json | null
          role?: Database["public"]["Enums"]["message_role"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      milk_tests: {
        Row: {
          cow_number: number
          fat_pct: number | null
          id: number
          lactose_pct: number | null
          mun: number | null
          protein_pct: number | null
          scc: number | null
          synced_at: string
          test_date: string
        }
        Insert: {
          cow_number: number
          fat_pct?: number | null
          id?: number
          lactose_pct?: number | null
          mun?: number | null
          protein_pct?: number | null
          scc?: number | null
          synced_at?: string
          test_date: string
        }
        Update: {
          cow_number?: number
          fat_pct?: number | null
          id?: number
          lactose_pct?: number | null
          mun?: number | null
          protein_pct?: number | null
          scc?: number | null
          synced_at?: string
          test_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "milk_tests_cow_number_fkey"
            columns: ["cow_number"]
            isOneToOne: false
            referencedRelation: "cows"
            referencedColumns: ["cow_number"]
          },
        ]
      }
      milkings: {
        Row: {
          cow_number: number
          id: number
          milk_weight_kg: number
          milked_at: string
          responder: string | null
          synced_at: string
        }
        Insert: {
          cow_number: number
          id?: number
          milk_weight_kg: number
          milked_at: string
          responder?: string | null
          synced_at?: string
        }
        Update: {
          cow_number?: number
          id?: number
          milk_weight_kg?: number
          milked_at?: string
          responder?: string | null
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milkings_cow_number_fkey"
            columns: ["cow_number"]
            isOneToOne: false
            referencedRelation: "cows"
            referencedColumns: ["cow_number"]
          },
        ]
      }
      sync_log: {
        Row: {
          error: string | null
          id: number
          ran_at: string
          records_synced: number
          status: string
        }
        Insert: {
          error?: string | null
          id?: number
          ran_at?: string
          records_synced?: number
          status: string
        }
        Update: {
          error?: string | null
          id?: number
          ran_at?: string
          records_synced?: number
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      daily_milk_production: {
        Args: { from_date: string; to_date: string }
        Returns: {
          cow_count: number
          day: string
          session1_kg: number
          session2_kg: number
          session3_kg: number
          total_kg: number
        }[]
      }
    }
    Enums: {
      message_role: "user" | "assistant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      message_role: ["user", "assistant"],
    },
  },
} as const
