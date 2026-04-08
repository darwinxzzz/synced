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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string | null
          date: string
          event_id: string | null
          id: string
          meeting_week: number | null
          notes: string | null
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          event_id?: string | null
          id?: string
          meeting_week?: number | null
          notes?: string | null
          status: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          event_id?: string | null
          id?: string
          meeting_week?: number | null
          notes?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          challenges: string | null
          changes: string | null
          created_at: string | null
          department: string
          description: string | null
          event_id: string | null
          id: string
          priority: string
          submitted_at: string | null
          task: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenges?: string | null
          changes?: string | null
          created_at?: string | null
          department: string
          description?: string | null
          event_id?: string | null
          id?: string
          priority?: string
          submitted_at?: string | null
          task: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenges?: string | null
          changes?: string | null
          created_at?: string | null
          department?: string
          description?: string | null
          event_id?: string | null
          id?: string
          priority?: string
          submitted_at?: string | null
          task?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_members: {
        Row: {
          created_at: string | null
          department: string | null
          event_id: string
          id: string
          pillar_status: string
          role: string | null
          task: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          event_id: string
          id?: string
          pillar_status?: string
          role?: string | null
          task?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          event_id?: string
          id?: string
          pillar_status?: string
          role?: string | null
          task?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_members_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cover_url: string | null
          created_at: string | null
          created_by: string
          date: string | null
          description: string | null
          end_time: string | null
          id: string
          is_recurring: boolean | null
          kanban_status: string
          name: string
          start_time: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          created_by: string
          date?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean | null
          kanban_status?: string
          name: string
          start_time?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          created_by?: string
          date?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean | null
          kanban_status?: string
          name?: string
          start_time?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          id: string
          joined_date: string | null
          name: string
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          id: string
          joined_date?: string | null
          name: string
          role?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          joined_date?: string | null
          name?: string
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reflections: {
        Row: {
          challenges: string | null
          contribution_id: string
          created_at: string | null
          current_task: string | null
          description: string | null
          id: string
          impact: string | null
          org_learning: string | null
          personal_learning: string | null
          status: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenges?: string | null
          contribution_id: string
          created_at?: string | null
          current_task?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          org_learning?: string | null
          personal_learning?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenges?: string | null
          contribution_id?: string
          created_at?: string | null
          current_task?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          org_learning?: string | null
          personal_learning?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reflections_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "contributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonial_requests: {
        Row: {
          created_at: string | null
          id: string
          requested_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          requested_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          requested_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonial_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          content_json: Json | null
          created_at: string | null
          endorsement_name: string | null
          endorsement_quote: string | null
          endorsement_title: string | null
          finalised_at: string | null
          generated_at: string | null
          generated_by: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_json?: Json | null
          created_at?: string | null
          endorsement_name?: string | null
          endorsement_quote?: string | null
          endorsement_title?: string | null
          finalised_at?: string | null
          generated_at?: string | null
          generated_by: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_json?: Json | null
          created_at?: string | null
          endorsement_name?: string | null
          endorsement_quote?: string | null
          endorsement_title?: string | null
          finalised_at?: string | null
          generated_at?: string | null
          generated_by?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_event: {
        Args: {
          p_cover_url: string
          p_date: string
          p_description: string
          p_end_time: string
          p_is_recurring: boolean
          p_member_ids: string[]
          p_name: string
          p_start_time: string
        }
        Returns: {
          cover_url: string | null
          created_at: string | null
          created_by: string
          date: string | null
          description: string | null
          end_time: string | null
          id: string
          is_recurring: boolean | null
          kanban_status: string
          name: string
          start_time: string | null
          status: string
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "events"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_admin_kpi_active_events: { Args: never; Returns: number }
      get_admin_kpi_completion_rate: { Args: never; Returns: number }
      get_admin_kpi_tasks_due: { Args: never; Returns: number }
      get_admin_kpi_total_members: { Args: never; Returns: number }
      get_admin_pending_submissions: {
        Args: never
        Returns: {
          department: string
          event_date: string
          event_id: string
          event_name: string
          member_name: string
          task: string
          user_id: string
        }[]
      }
      get_member_kpi_completion_rate: { Args: never; Returns: number }
      get_member_kpi_next_deadline: {
        Args: never
        Returns: {
          days_away: number
          event_date: string
          event_name: string
        }[]
      }
      get_member_kpi_remaining_tasks: { Args: never; Returns: number }
      get_member_kpi_team_sync_count: { Args: never; Returns: number }
      get_member_pending_milestones: {
        Args: never
        Returns: {
          department: string
          event_date: string
          event_id: string
          event_name: string
          pillar_status: string
          task: string
        }[]
      }
    }
    Enums: {
      department:
        | "Software"
        | "Meet-ups"
        | "Inspire"
        | "Publicity"
        | "Connectors"
        | "Labs"
      priority: "high" | "medium" | "low"
      roles: "admin" | "lead" | "member"
      status: "attended" | "excused" | "absent"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      department: [
        "Software",
        "Meet-ups",
        "Inspire",
        "Publicity",
        "Connectors",
        "Labs",
      ],
      priority: ["high", "medium", "low"],
      roles: ["admin", "lead", "member"],
      status: ["attended", "excused", "absent"],
    },
  },
} as const
