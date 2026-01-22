export interface MatchResult {
  trainerId: string;
  tier: 'free-spin' | 'full-fitmatch';
  score: number;
  confidence: 'high' | 'medium' | 'low';
  trainer: Trainer;
  explanation: Explanation;
  compatibilityBreakdown: CompatibilityItem[];
  semanticUsed: boolean;
  matchType: 'basic' | 'deep';
  createdAt: string;
}

export interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  headline: string;
  bio: string;
  specialties: string[];
  experience_years: number;
  hourly_rate: number;
  coaching_philosophy: string;
  works_best_with: string;
  verified_status: 'verified' | 'pending';
}

export interface Explanation {
  summary: string;
  considered: ConsideredItem[];
  notConsidered: ConsideredItem[];
}

export interface ConsideredItem {
  label: string;
  included: boolean;
}

export interface CompatibilityItem {
  label: string;
  matchLevel: 'high' | 'medium' | 'low';
  details: string;
}
