// lib/types.ts
export type SubscriptionStatus = 
  | 'none' 
  | 'active' 
  | 'past_due' 
  | 'canceled' 
  | 'incomplete' 
  | 'trialing';

export interface TrainerProfile {
  id: string;
  name?: string;
  headline?: string;
  bio?: string;
  specialties?: string[];
  certifications?: string[];
  subscription_status: SubscriptionStatus;
  subscription_end?: string | null;
  stripe_account_id?: string | null;
  vector_embedding?: number[] | null;
  ml_cluster_id?: number | null;
}

export interface UserCredits {
  user_id: string;
  spins_remaining: number;
  last_purchased_at?: string | null;
}

export interface UnlockRecord {
  id: string;
  user_id: string;
  trainer_id: string;
  unlocked_at: string;
  created_at: string;
}

export interface Subscription {
  id?: string;
  stripe_subscription_id: string;
  trainer_id: string;
  status: SubscriptionStatus;
  current_period_end?: string | null;
  created_at?: string;
  updated_at?: string;
}