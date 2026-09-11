/**
 * Hand-written mirror of supabase/migrations. Shaped like the output of
 * `supabase gen types typescript` so it can be swapped for generated types later:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type TaskUrgency = 'critical' | 'high' | 'medium' | 'low'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          timezone?: string
        }
        Update: {
          display_name?: string | null
          avatar_url?: string | null
          timezone?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
        }
        Update: {
          name?: string
          color?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          title: string
          description: string | null
          urgency: TaskUrgency
          status: TaskStatus
          start_date: string | null
          due_date: string | null
          start_time: string | null
          due_time: string | null
          color: string | null
          position: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          title: string
          description?: string | null
          urgency?: TaskUrgency
          status?: TaskStatus
          start_date?: string | null
          due_date?: string | null
          start_time?: string | null
          due_time?: string | null
          color?: string | null
          position?: number
          completed_at?: string | null
        }
        Update: {
          category_id?: string | null
          title?: string
          description?: string | null
          urgency?: TaskUrgency
          status?: TaskStatus
          start_date?: string | null
          due_date?: string | null
          start_time?: string | null
          due_time?: string | null
          color?: string | null
          position?: number
          completed_at?: string | null
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          id: string
          task_id: string
          user_id: string
          title: string
          is_completed: boolean
          position: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          title: string
          is_completed?: boolean
          position?: number
          completed_at?: string | null
        }
        Update: {
          title?: string
          is_completed?: boolean
          position?: number
          completed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      task_urgency: TaskUrgency
      task_status: TaskStatus
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
