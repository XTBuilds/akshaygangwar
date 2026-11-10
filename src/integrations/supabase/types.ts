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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          content: string
          cover_url: string | null
          created_at: string
          excerpt: string
          external_url: string | null
          id: string
          published: boolean
          published_at: string
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string
          external_url?: string | null
          id?: string
          published?: boolean
          published_at?: string
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string
          external_url?: string | null
          id?: string
          published?: boolean
          published_at?: string
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      hire_requests: {
        Row: {
          budget: string | null
          company: string | null
          created_at: string
          details: string
          email: string
          id: string
          name: string
          timeline: string | null
        }
        Insert: {
          budget?: string | null
          company?: string | null
          created_at?: string
          details: string
          email: string
          id?: string
          name: string
          timeline?: string | null
        }
        Update: {
          budget?: string | null
          company?: string | null
          created_at?: string
          details?: string
          email?: string
          id?: string
          name?: string
          timeline?: string | null
        }
        Relationships: []
      }
      instagram_posts: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          media_url: string | null
          permalink: string
          posted_at: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          permalink: string
          posted_at?: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          permalink?: string
          posted_at?: string
          sort_order?: number
        }
        Relationships: []
      }
      mahiru_logs: {
        Row: {
          answer_preview: string | null
          category: string
          created_at: string
          id: string
          kind: string
          page: string | null
          question: string
          session_id: string | null
        }
        Insert: {
          answer_preview?: string | null
          category?: string
          created_at?: string
          id?: string
          kind?: string
          page?: string | null
          question: string
          session_id?: string | null
        }
        Update: {
          answer_preview?: string | null
          category?: string
          created_at?: string
          id?: string
          kind?: string
          page?: string | null
          question?: string
          session_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string
          featured: boolean
          id: string
          live_url: string | null
          name: string
          repo_url: string | null
          slug: string
          sort_order: number
          tech_stack: string[]
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          live_url?: string | null
          name: string
          repo_url?: string | null
          slug: string
          sort_order?: number
          tech_stack?: string[]
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          live_url?: string | null
          name?: string
          repo_url?: string | null
          slug?: string
          sort_order?: number
          tech_stack?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          created_at: string
          id: string
          path: string
          referrer: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      telegram_audit_logs: {
        Row: {
          action: string
          actor_id: number | null
          actor_username: string | null
          chat_id: number
          created_at: string
          details: Json
          id: string
          reason: string | null
          target_user_id: number | null
        }
        Insert: {
          action: string
          actor_id?: number | null
          actor_username?: string | null
          chat_id: number
          created_at?: string
          details?: Json
          id?: string
          reason?: string | null
          target_user_id?: number | null
        }
        Update: {
          action?: string
          actor_id?: number | null
          actor_username?: string | null
          chat_id?: number
          created_at?: string
          details?: Json
          id?: string
          reason?: string | null
          target_user_id?: number | null
        }
        Relationships: []
      }
      telegram_group_settings: {
        Row: {
          antiflood_enabled: boolean
          antispam_enabled: boolean
          auto_mute_minutes: number
          chat_id: number
          command_permissions: Json
          enabled: boolean
          farewell_enabled: boolean
          farewell_template: string
          feature_flags: Json
          flood_limit: number
          flood_window_seconds: number
          locked: boolean
          locked_permissions: Json
          logging_enabled: boolean
          rules_text: string
          updated_at: string
          updated_by: number | null
          warning_threshold: number
          welcome_enabled: boolean
          welcome_template: string
        }
        Insert: {
          antiflood_enabled?: boolean
          antispam_enabled?: boolean
          auto_mute_minutes?: number
          chat_id: number
          command_permissions?: Json
          enabled?: boolean
          farewell_enabled?: boolean
          farewell_template?: string
          feature_flags?: Json
          flood_limit?: number
          flood_window_seconds?: number
          locked?: boolean
          locked_permissions?: Json
          logging_enabled?: boolean
          rules_text?: string
          updated_at?: string
          updated_by?: number | null
          warning_threshold?: number
          welcome_enabled?: boolean
          welcome_template?: string
        }
        Update: {
          antiflood_enabled?: boolean
          antispam_enabled?: boolean
          auto_mute_minutes?: number
          chat_id?: number
          command_permissions?: Json
          enabled?: boolean
          farewell_enabled?: boolean
          farewell_template?: string
          feature_flags?: Json
          flood_limit?: number
          flood_window_seconds?: number
          locked?: boolean
          locked_permissions?: Json
          logging_enabled?: boolean
          rules_text?: string
          updated_at?: string
          updated_by?: number | null
          warning_threshold?: number
          welcome_enabled?: boolean
          welcome_template?: string
        }
        Relationships: []
      }
      telegram_keyword_filters: {
        Row: {
          chat_id: number
          created_at: string
          created_by: number
          keyword: string
        }
        Insert: {
          chat_id: number
          created_at?: string
          created_by: number
          keyword: string
        }
        Update: {
          chat_id?: number
          created_at?: string
          created_by?: number
          keyword?: string
        }
        Relationships: []
      }
      telegram_message_activity: {
        Row: {
          chat_id: number
          created_at: string
          message_hash: string
          user_id: number
        }
        Insert: {
          chat_id: number
          created_at?: string
          message_hash: string
          user_id: number
        }
        Update: {
          chat_id?: number
          created_at?: string
          message_hash?: string
          user_id?: number
        }
        Relationships: []
      }
      telegram_update_receipts: {
        Row: {
          received_at: string
          update_id: number
        }
        Insert: {
          received_at?: string
          update_id: number
        }
        Update: {
          received_at?: string
          update_id?: number
        }
        Relationships: []
      }
      telegram_warnings: {
        Row: {
          chat_id: number
          last_reason: string | null
          updated_at: string
          user_id: number
          warning_count: number
        }
        Insert: {
          chat_id: number
          last_reason?: string | null
          updated_at?: string
          user_id: number
          warning_count?: number
        }
        Update: {
          chat_id?: number
          last_reason?: string | null
          updated_at?: string
          user_id?: number
          warning_count?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
