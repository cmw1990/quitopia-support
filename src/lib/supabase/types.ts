export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          username: string | null
          email: string | null
          quit_date: string | null
          cigarettes_per_day: number | null
          price_per_pack: number | null
          cigarettes_per_pack: number | null
          health_score: number | null
          money_saved: number | null
          cigarettes_avoided: number | null
          mood_score: number | null
          energy_score: number | null
          focus_score: number | null
          last_updated: string | null
        }
        Insert: {
          id: string
          created_at?: string
          username?: string | null
          email?: string | null
          quit_date?: string | null
          cigarettes_per_day?: number | null
          price_per_pack?: number | null
          cigarettes_per_pack?: number | null
          health_score?: number | null
          money_saved?: number | null
          cigarettes_avoided?: number | null
          mood_score?: number | null
          energy_score?: number | null
          focus_score?: number | null
          last_updated?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          username?: string | null
          email?: string | null
          quit_date?: string | null
          cigarettes_per_day?: number | null
          price_per_pack?: number | null
          cigarettes_per_pack?: number | null
          health_score?: number | null
          money_saved?: number | null
          cigarettes_avoided?: number | null
          mood_score?: number | null
          energy_score?: number | null
          focus_score?: number | null
          last_updated?: string | null
        }
      }
      consumption_logs: {
        Row: {
          id: string
          user_id: string
          created_at: string
          cigarettes_smoked: number
          mood_before: number | null
          mood_after: number | null
          trigger: string | null
          notes: string | null
          location: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          cigarettes_smoked: number
          mood_before?: number | null
          mood_after?: number | null
          trigger?: string | null
          notes?: string | null
          location?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          cigarettes_smoked?: number
          mood_before?: number | null
          mood_after?: number | null
          trigger?: string | null
          notes?: string | null
          location?: string | null
        }
      }
      health_logs: {
        Row: {
          id: string
          user_id: string
          created_at: string
          mood_score: number | null
          energy_score: number | null
          focus_score: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          mood_score?: number | null
          energy_score?: number | null
          focus_score?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          mood_score?: number | null
          energy_score?: number | null
          focus_score?: number | null
          notes?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number | null
          category: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number | null
          category?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number | null
          category?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 