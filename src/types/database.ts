export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
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
        Relationships: []
      }
      contributions: {
        Row: {
          created_at: string | null
          department: string
          description: string | null
          event_id: string | null
          id: string
          outcome: string | null
          priority: string
          submitted_at: string | null
          task: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department: string
          description?: string | null
          event_id?: string | null
          id?: string
          outcome?: string | null
          priority?: string
          submitted_at?: string | null
          task: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string
          description?: string | null
          event_id?: string | null
          id?: string
          outcome?: string | null
          priority?: string
          submitted_at?: string | null
          task?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
        Relationships: []
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
          name?: string
          start_time?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
    }
    Views: Record<never, never>
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
          name: string
          start_time: string | null
          status: string
          updated_at: string | null
        }
      }
      get_admin_kpi_active_events: { Args: Record<string, never>; Returns: number }
      get_admin_kpi_completion_rate: { Args: Record<string, never>; Returns: number }
      get_admin_kpi_tasks_due: { Args: Record<string, never>; Returns: number }
      get_admin_kpi_total_members: { Args: Record<string, never>; Returns: number }
      get_admin_pending_submissions: {
        Args: Record<string, never>
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
      get_member_kpi_completion_rate: { Args: Record<string, never>; Returns: number }
      get_member_kpi_next_deadline: {
        Args: Record<string, never>
        Returns: { days_away: number; event_date: string; event_name: string }[]
      }
      get_member_kpi_remaining_tasks: { Args: Record<string, never>; Returns: number }
      get_member_kpi_team_sync_count: { Args: Record<string, never>; Returns: number }
      get_member_pending_milestones: {
        Args: Record<string, never>
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
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][T]["Update"]
