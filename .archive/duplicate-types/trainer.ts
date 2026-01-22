// types/trainer.ts - UPDATED with Phase 29 fields
// TypeScript definitions for Phase 25 Trainer Profile Builder + Phase 29 additions
export interface TrainerProfile {
  id: string
  user_id: string
  // Basic Info (Section A)
  full_name?: string | null
  first_name?: string | null;  // Phase 29 addition
  last_name?: string | null;   // Phase 29 addition
  age?: number | null
  gender?: string | null
  city_timezone?: string | null
  years_experience?: number | null
  certifications?: string[] | null
  links?: {
    instagram?: string
    website?: string
    twitter?: string
    linkedin?: string
    [key: string]: string | undefined
  } | null
  // Coaching Philosophy & Style (Sections B, C, E)
  bio?: string | null
  philosophy?: string | null
  coaching_philosophy?: string | null; // Phase 29: specific coaching philosophy snippet
  communication_style?: string | null
  lived_experience?: string | null
  specialties?: string[] | null
  headline?: string | null; // Phase 29: short headline/tagline
  // Phase 29 Trust Signals
  works_best_with?: string | null; // "Works best with clients who..."
  niche_tags?: string[] | null;    // Strength, beginner-friendly, trauma-informed, etc.
  verified_status?: 'unverified' | 'verified' | 'elite' | null
  subscription_status?: string | null
  hourly_rate?: number | null
  avatar_url?: string | null
  // Availability & Logistics (Section F)
  timezone?: string | null
  training_modes?: ('in-person' | 'online')[] | null
  availability_schedule?: {
    monday?: { start: string; end: string }[]
    tuesday?: { start: string; end: string }[]
    wednesday?: { start: string; end: string }[]
    thursday?: { start: string; end: string }[]
    friday?: { start: string; end: string }[]
    saturday?: { start: string; end: string }[]
    sunday?: { start: string; end: string }[]
  } | null
  // Completion & Readiness Flags
  completed: boolean
  vector_ready: boolean
  // Timestamps
  created_at: string
  updated_at: string
}
export interface TrainerQuestionnaireResponse {
  id: string
  trainer_profile_id: string
  question: string
  response_text: string
  created_at: string
}
export interface TrainerProfileFormData {
  // Section A: Basic Info
  basicInfo: {
    fullName: string
    age?: number
    gender?: string
    cityTimezone: string
    yearsExperience?: number
    certifications: string[]
    links: {
      instagram?: string
      website?: string
      twitter?: string
      linkedin?: string
    }
  }
  // Section B: Coaching Philosophy (Open-ended questions)
  philosophy: {
    philosophy: string; // "Describe your coaching philosophy"
    clientMotivation: string; // "What motivates your clients the most?"
    commonMistakes: string; // "What do you believe most trainers get wrong?"
    handlingSetbacks: string; // "How do you handle client setbacks?"
    idealClients: string; // "What type of clients do you work best with?"
  }
  // Section C: Training Style (Multi-select)
  trainingStyle: {
    specialties: Array<
      | 'strength'
      | 'hypertrophy'
      | 'weight-loss'
      | 'functional-fitness'
      | 'athletic-training'
      | 'mobility'
      | 'special-populations'
    >
    specialPopulations?: string[]; // ND, trauma-informed, disabilities, etc.
  }
  // Section D: Demographics & Lived Experience
  demographics: {
    comfortWithBeginners?: string
    comfortWithNeurodivergent?: string
    traumaSensitiveExperience?: string
    culturalExperience?: string
    languagePreferences?: string
  }
  // Section E: Communication Style
  communication: {
    style: Array<
      | 'soft-nurturing'
      | 'structured-disciplined'
      | 'high-energy'
      | 'direct-honest'
      | 'humor-based'
      | 'accountability-heavy'
    >
    styleExplanation: string
  }
  // Section F: Availability
  availability: {
    timezone: string
    modes: ('in-person' | 'online')[]
    schedule: {
      monday: { start: string; end: string }[]
      tuesday: { start: string; end: string }[]
      wednesday: { start: string; end: string }[]
      thursday: { start: string; end: string }[]
      friday: { start: string; end: string }[]
      saturday: { start: string; end: string }[]
      sunday: { start: string; end: string }[]
    }
    responseTime?: string
  }
  // Section G: Pricing (Placeholder)
  pricing: {
    notes?: string
  }
}
// Constants for form steps
export const TRAINER_FORM_STEPS = [
  'basic-info',
  'philosophy',
  'training-style',
  'demographics',
  'communication',
  'availability',
  'pricing'] as const
export type TrainerFormStep = typeof TRAINER_FORM_STEPS[number]
// Question bank for open-ended responses (to store in trainer_questionnaire_responses)
export const TRAINER_OPEN_ENDED_QUESTIONS = {
  PHILOSOPHY: 'Describe your coaching philosophy',
  CLIENT_MOTIVATION: 'What motivates your clients the most?',
  COMMON_MISTAKES: 'What do you believe most trainers get wrong?',
  HANDLING_SETBACKS: 'How do you handle client setbacks?',
  IDEAL_CLIENTS: 'What type of clients do you work best with?',
  COMMUNICATION_EXPLANATION: 'Explain your communication style',
  DEMOGRAPHICS_EXPERIENCE: 'Describe your lived experience and demographics'} as const
export type TrainerQuestionKey = keyof typeof TRAINER_OPEN_ENDED_QUESTIONS

