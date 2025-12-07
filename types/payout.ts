// Types for Phase 20 - Payout System

export interface Payout {
  id: string;
  trainer_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  stripe_transfer_id?: string;
  failure_reason?: string;
  created_at: string;
  processed_at?: string;
  scheduled_for: string;
}

export interface TrainerEarnings {
  trainer_id: string;
  total_earned: number;
  pending_cents: number;
  locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayoutStartRequest {
  trainerId: string;
  amount: number; // in cents
}

export interface PayoutStartResponse {
  success: boolean;
  payout?: Payout;
  error?: string;
  message?: string;
}

export interface PayoutMarkFailedRequest {
  payoutId: string;
  trainerId: string;
  reason?: string;
}

export interface PayoutCompleteRequest {
  payoutId: string;
  trainerId: string;
  transferId: string;
  amount: number;
}

export interface TrainerPayoutsResponse {
  success: boolean;
  payouts: Payout[];
  error?: string;
}

// Admin payout filters
export interface PayoutFilters {
  status?: Payout['status'];
  trainerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Payout statistics for admin dashboard
export interface PayoutStats {
  total_payouts: number;
  total_amount: number;
  pending_count: number;
  processing_count: number;
  failed_count: number;
  paid_count: number;
}
