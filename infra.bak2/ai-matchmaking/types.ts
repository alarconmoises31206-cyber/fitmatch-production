// infra/ai-matchmaking/types.ts

export interface ClientProfile {
  id: string;
  user_id: string;
  goals: string[];
  experience_level: string;
  training_preference: string;
  weekly_time_availability: string;
  timezone: string;
  communication_style: string;
}

export interface TrainerProfile {
  id: string;
  user_id: string;
  specialties: string[];
  experience_years: number;
  availability: string;
  availability_schedule: string;
  timezone: string;
  communication_style: string;
  communication_tone: string;
  subscription_status: 'web' | 'free' | 'paid' | 'verified' | 'elite_verified';
  // Phase 62: Post-claim boost fields
  claimed_boost_until?: string | null; // ISO date string
  new_trainer_badge_until?: string | null; // ISO date string
}

export interface MatchScore {
  trainerId: string;
  userId: string;
  score: number; // 0-100
  confidence: number; // 0-1
  breakdown: {
    goals: number;
    experience: number;
    specialties: number;
    availability: number;
    personality: number;
    location: number;
    tier: number;
  }
}

export interface MatchResult extends MatchScore {
  rationale: string;
  tokenCostEstimate: number;
  visibleDetails: 'blurred' | 'partial' | 'full';
}

export interface MatchRequest {
  clientId: string;
  tokenBudget?: number;
  limit?: number;
}

export interface MatchResponse {
  clientId: string;
  matches: MatchResult[];
  tokensRemaining?: number;
  metadata?: {
    platformMatches?: number;
    externalMatches?: number;
    totalConsidered?: number;
    [key: string]: any;
  }
}
