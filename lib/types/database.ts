// lib/types/database.ts
// Database TypeScript definitions for Supabase
// Updated for Phase 66.5: Question & Signal Design Foundation

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      trainer_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          age: number | null;
          gender: string | null;
          city_timezone: string | null;
          years_experience: number | null;
          certifications: string[] | null;
          links: Json | null;
          bio: string | null;
          philosophy: string | null;
          communication_style: string | null;
          lived_experience: string | null;
          specialties: string[] | null;
          timezone: string | null;
          training_modes: string[] | null;
          availability_schedule: Json | null;
          completed: boolean;
          vector_ready: boolean;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          age?: number | null;
          gender?: string | null;
          city_timezone?: string | null;
          years_experience?: number | null;
          certifications?: string[] | null;
          links?: Json | null;
          bio?: string | null;
          philosophy?: string | null;
          communication_style?: string | null;
          lived_experience?: string | null;
          specialties?: string[] | null;
          timezone?: string | null;
          training_modes?: string[] | null;
          availability_schedule?: Json | null;
          completed?: boolean;
          vector_ready?: boolean;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          age?: number | null;
          gender?: string | null;
          city_timezone?: string | null;
          years_experience?: number | null;
          certifications?: string[] | null;
          links?: Json | null;
          bio?: string | null;
          philosophy?: string | null;
          communication_style?: string | null;
          lived_experience?: string | null;
          specialties?: string[] | null;
          timezone?: string | null;
          training_modes?: string[] | null;
          availability_schedule?: Json | null;
          completed?: boolean;
          vector_ready?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      }
      client_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          age: number | null;
          gender: string | null;
          city_timezone: string | null;
          completed: boolean;
          vector_ready: boolean;
          ai_summary: Json | null;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          age?: number | null;
          gender?: string | null;
          city_timezone?: string | null;
          completed?: boolean;
          vector_ready?: boolean;
          ai_summary?: Json | null;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          age?: number | null;
          gender?: string | null;
          city_timezone?: string | null;
          completed?: boolean;
          vector_ready?: boolean;
          ai_summary?: Json | null;
          created_at?: string;
          updated_at?: string;
        }
      }
      trainer_questionnaire_responses: {
        Row: {
          id: string;
          trainer_profile_id: string;
          question: string;
          response_text: string;
          created_at: string;
        }
        Insert: {
          id?: string;
          trainer_profile_id: string;
          question: string;
          response_text: string;
          created_at?: string;
        }
        Update: {
          id?: string;
          trainer_profile_id?: string;
          question?: string;
          response_text?: string;
          created_at?: string;
        }
      }
      client_questionnaire_responses: {
        Row: {
          id: string;
          client_profile_id: string;
          question: string;
          response_text: string;
          created_at: string;
        }
        Insert: {
          id?: string;
          client_profile_id: string;
          question: string;
          response_text: string;
          created_at?: string;
        }
        Update: {
          id?: string;
          client_profile_id?: string;
          question?: string;
          response_text?: string;
          created_at?: string;
        }
      }
    }
    Views: {
      admin_trainer_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          age: number | null;
          // ... all trainer_profiles columns plus:
          email: string | null;
          user_created_at: string | null;
        }
      }
    }
    Functions: {
      // We can add functions later if needed
    }
    Enums: {
      // We can add enums later if needed
    }
  }
}
