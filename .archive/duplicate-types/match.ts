// types/match.ts - Updated for Phase 29
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type MatchTier = 'free-spin' | 'full-fitmatch';
export type MatchLevel = 'low' | 'medium' | 'high' | 'neutral' | 'not-applicable';

export interface ExplanationItem {
  label: string;
  included: boolean;
}

export interface Explanation {
  summary: string;
  considered: ExplanationItem[];
  notConsidered: ExplanationItem[];
}

export interface CompatibilityItem {
  label: string;
  matchLevel: MatchLevel;
  details: string;
}

// Basic trainer info needed for match display
export interface MatchTrainer {
  id: string;
  first_name: string;
  last_name: string;
  headline: string;
  bio?: string;
  specialties?: string[];
  // Optional fields that might come from API
  experience_years?: number;
  hourly_rate?: number;
  verified_status?: string;
  coaching_philosophy?: string;
  works_best_with?: string;
  niche_tags?: string[];
}

export interface MatchResult {
  trainerId: string;
  trainer: MatchTrainer;
  score: number;
  confidence: ConfidenceLevel;
  tier: MatchTier;
  explanation: Explanation;
  compatibilityBreakdown: CompatibilityItem[];
  semanticUsed: boolean;
  matchType: 'basic' | 'deep';
  createdAt: string;
}

export interface MatchPageState {
  freeSpinMatches: MatchResult[];
  fullFitMatchMatches: MatchResult[];
  loading: boolean;
  error: string | null;
  selectedTier: 'all' | 'free-spin' | 'full-fitmatch';
}

// ====================
// Phase 33: Onboarding Types
// ====================

export type UserRole = 'client' | 'trainer';

export interface UserOnboardingState {
  user_id: string;
  role: UserRole;
  has_completed_questionnaire: boolean;
  has_viewed_matches: boolean;
  has_started_conversation: boolean;
  has_sent_first_message: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingUpdateInput {
  has_completed_questionnaire?: boolean;
  has_viewed_matches?: boolean;
  has_started_conversation?: boolean;
  has_sent_first_message?: boolean;
  completed_at?: string | null;
}

export type OnboardingStep = 
  | 'questionnaire'
  | 'view_matches' 
  | 'start_conversation'
  | 'send_message'
  | 'complete';

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  nextAction?: string;
  isComplete: boolean;
}

// Helper type for the smart router logic
export type OnboardingRedirectTarget = 
  | '/questionnaire' 
  | '/matches' 
  | '/messages' 
  | '/dashboard';