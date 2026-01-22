// File: types/database.types.ts
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
      conversations: {
        Row: {
          id: string
          client_id: string
          trainer_id: string
          match_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          trainer_id: string
          match_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          trainer_id?: string
          match_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_match_id_fkey"
            columns: ["match_id"]
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_trainer_id_fkey"
            columns: ["trainer_id"]
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          sender_role: string
          content: string
          created_at: string
          read: boolean
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          sender_role: string
          content: string
          created_at?: string
          read?: boolean
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          sender_role?: string
          content?: string
          created_at?: string
          read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      conversation_nudges: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          user_role: 'client' | 'trainer'
          nudge_type: string
          message: string | null
          dismissed: boolean
          dismissed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          user_role: 'client' | 'trainer'
          nudge_type: string
          message?: string | null
          dismissed?: boolean
          dismissed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          user_role?: 'client' | 'trainer'
          nudge_type?: string
          message?: string | null
          dismissed?: boolean
          dismissed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_nudges_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      // Add other tables as needed
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
