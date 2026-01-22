// infra/external-trainers/types.ts

// External Trainer Profile (not yet on platform)
export interface ExternalTrainerProfile {
  id: string;
  name: string;
  public_name: string;
  bio?: string;
  specialties: string[];
  experience_years?: number;
  location?: string;
  timezone?: string;
  email?: string;
  website_url?: string;
  social_links?: Record<string, string>;

  // Platform status
  status: 'web_unclaimed' | 'claim_pending' | 'claim_invited' | 'claimed' | 'rejected' | 'archived';
  source: 'manual' | 'scraped' | 'client_suggested' | 'imported';

  // Scoring & visibility
  match_score_cap: number; // Default: 75
  safety_rating: number; // 0-100
  is_verified_external: boolean;

  // Claim system
  claim_token?: string;
  claim_token_expires_at?: string;
  claimed_by_user_id?: string;
  claimed_at?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Contact request to external trainer
export interface ExternalContactRequest {
  clientId: string;
  externalTrainerId: string;
  message: string; // Max 500 characters
  contactType: 'initial' | 'reply';
}

// Contact attempt record
export interface ExternalContactAttempt {
  id: string;
  client_id: string;
  client_profile_id?: string;
  external_trainer_id: string;
  message: string;
  trimmed_message?: string;
  character_count: number;
  contact_type: 'initial' | 'reply' | 'followup';
  contact_sequence: number;

  // Safety & delivery
  safety_scan_result: 'pending' | 'clean' | 'flagged' | 'blocked' | 'quarantined';
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed' | 'blocked';
  delivery_method: 'email' | 'platform';

  // Response tracking
  trainer_replied: boolean;
  trainer_reply_id?: string;
  trainer_replied_at?: string;

  // Claim flow
  claim_invitation_sent: boolean;
  claim_invitation_sent_at?: string;
  claim_token_used?: string;

  created_at: string;
  updated_at: string;
}

// Claim token for external trainer
export interface ExternalClaimToken {
  token: string;
  external_trainer_id: string;
  contact_attempt_id?: string;

  claimed_by_email?: string;
  claimed_by_user_id?: string;
  claimed_at?: string;

  max_uses: number;
  use_count: number;
  expires_at: string;

  is_revoked: boolean;
  revoke_reason?: string;
  revoked_at?: string;

  created_at: string;
}

// Safety flag for monitoring
export interface ExternalSafetyFlag {
  id: string;
  external_trainer_id: string;
  contact_attempt_id?: string;

  flag_type: 'off_platform_attempt' | 'suspicious_link' | 'inappropriate_content' |
             'spam_pattern' | 'rate_limit_exceeded' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  action_taken?: 'none' | 'warned' | 'quarantined' | 'blocked' | 'archived';

  resolved_at?: string;
  resolved_by?: string;

  created_at: string;
}

// Rate limit record
export interface ExternalRateLimit {
  id: string;
  identifier: string; // IP, client_id, email, etc.
  identifier_type: 'ip' | 'client_id' | 'email';
  action_type: 'contact' | 'view' | 'claim_request';
  count: number;
  time_window_start: string;
  time_window_end: string;

  created_at: string;
  updated_at: string;
}

// Match result for external trainer (cached)
export interface ExternalTrainerMatchResult {
  id: string;
  client_id: string;
  external_trainer_id: string;

  raw_score: number; // 0-100
  capped_score: number; // 0-75
  score_components: {
    goals: number;
    experience: number;
    specialties: number;
    availability: number;
    personality: number;
    location: number;
  }

  explanation_key: string; // 'external_trainer'
  rationale: string;

  is_visible: boolean;
  hide_reason?: string;

  calculated_at: string;
  expires_at: string;
}

// API Request/Response Types
export interface ContactExternalTrainerRequest {
  externalTrainerId: string;
  message: string;
}

export interface ContactExternalTrainerResponse {
  success: boolean;
  contactAttemptId: string;
  message: string;
  deliveryStatus: 'pending' | 'sent' | 'blocked';
  safetyScanResult: 'clean' | 'flagged' | 'pending';
}

export interface ClaimExternalTrainerRequest {
  token: string;
  email: string;
  acceptTerms: boolean;
}

export interface ClaimExternalTrainerResponse {
  success: boolean;
  trainerId?: string;
  userId?: string;
  message: string;
  nextStep?: 'verify_email' | 'complete_profile' | 'choose_tier';
}

// Integration with Phase 60 match results
export interface EnhancedMatchResult {
  isExternal: boolean;
  externalBadge: string; // "Not on FitMatch yet"
  contactLimit: 'one_message' | 'can_reply' | 'upgrade_required' | 'full_access';
  claimAvailable: boolean;
}

// Configuration for external trainer system
export interface ExternalTrainerConfig {
  maxMessageLength: number; // Default: 500
  scoreCap: number; // Default: 75
  initialContactLimit: number; // Default: 1
  replyLimit: number; // Default: 1
  claimTokenExpiryDays: number; // Default: 30
  safetyScanEnabled: boolean;
  rateLimits: {
    contactsPerDay: number;
    viewsPerHour: number;
    claimRequestsPerDay: number;
  }
}
