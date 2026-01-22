-- supabase/migrations/20250102000000_phase61_external_trainer_discovery.sql
-- Phase 61: External Trainer Discovery & Controlled Contact

-- ============================================
-- 1. External Trainers Table
-- Stores external/web trainers not yet on platform
-- ============================================
CREATE TABLE IF NOT EXISTS external_trainers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Basic info (from web scraping or manual entry)
  name VARCHAR(255) NOT NULL,
  public_name VARCHAR(255), -- Display name (can differ from real name)
  bio TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  experience_years INTEGER,
  location VARCHAR(255),
  timezone VARCHAR(50),
  
  -- Contact/verification info
  email VARCHAR(255), -- For claim invitations
  website_url VARCHAR(500),
  social_links JSONB DEFAULT '{}',
  source VARCHAR(50) NOT NULL CHECK (source IN ('manual', 'scraped', 'client_suggested', 'imported')),
  
  -- Platform status
  status VARCHAR(50) NOT NULL DEFAULT 'web_unclaimed' 
    CHECK (status IN ('web_unclaimed', 'claim_pending', 'claim_invited', 'claimed', 'rejected', 'archived')),
  claim_token VARCHAR(64) UNIQUE, -- For secure claiming
  claim_token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- References to platform after claim
  claimed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  match_score_cap INTEGER DEFAULT 75, -- Max score they can receive
  is_verified_external BOOLEAN DEFAULT FALSE, -- Manually verified by admin
  ingestion_source_details JSONB, -- Original source data
  ingestion_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Safety/quality flags
  safety_rating INTEGER DEFAULT 0 CHECK (safety_rating >= 0 AND safety_rating <= 100),
  last_safety_check TIMESTAMP WITH TIME ZONE,
  abuse_flags INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_external_trainers_status ON external_trainers(status);
CREATE INDEX IF NOT EXISTS idx_external_trainers_claim_token ON external_trainers(claim_token);
CREATE INDEX IF NOT EXISTS idx_external_trainers_specialties ON external_trainers USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_external_trainers_created_at ON external_trainers(created_at);
CREATE INDEX IF NOT EXISTS idx_external_trainers_safety_rating ON external_trainers(safety_rating);

-- ============================================
-- 2. External Contact Attempts Table
-- Tracks all contact attempts with external trainers
-- ============================================
CREATE TABLE IF NOT EXISTS external_contact_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Client info
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_profile_id UUID REFERENCES client_profiles(id) ON DELETE SET NULL,
  
  -- External trainer info
  external_trainer_id UUID REFERENCES external_trainers(id) ON DELETE CASCADE,
  
  -- Message details
  message TEXT NOT NULL,
  message_hash VARCHAR(64), -- For duplicate detection
  trimmed_message TEXT, -- After safety filtering
  character_count INTEGER NOT NULL CHECK (character_count >= 1 AND character_count <= 500),
  
  -- Contact rules enforcement
  contact_type VARCHAR(50) NOT NULL DEFAULT 'initial' 
    CHECK (contact_type IN ('initial', 'reply', 'followup')),
  contact_sequence INTEGER NOT NULL DEFAULT 1, -- 1 = first contact, 2 = reply, etc.
  is_within_limits BOOLEAN DEFAULT TRUE,
  
  -- Safety/abuse monitoring
  safety_scan_result VARCHAR(50) DEFAULT 'pending'
    CHECK (safety_scan_result IN ('pending', 'clean', 'flagged', 'blocked', 'quarantined')),
  safety_scan_details JSONB,
  scanned_at TIMESTAMP WITH TIME ZONE,
  
  -- Delivery status
  delivery_status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'blocked')),
  delivery_method VARCHAR(50) DEFAULT 'email',
  delivery_attempts INTEGER DEFAULT 0,
  
  -- Trainer response tracking
  trainer_replied BOOLEAN DEFAULT FALSE,
  trainer_reply_id UUID, -- References another record in this table
  trainer_replied_at TIMESTAMP WITH TIME ZONE,
  
  -- Claim flow tracking
  claim_invitation_sent BOOLEAN DEFAULT FALSE,
  claim_invitation_sent_at TIMESTAMP WITH TIME ZONE,
  claim_token_used VARCHAR(64), -- If they claimed from this contact
  
  -- Rate limiting
  client_ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraints
  CONSTRAINT one_initial_contact_per_pair UNIQUE(client_id, external_trainer_id, contact_type) 
    WHERE contact_type = 'initial'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ext_contact_client_id ON external_contact_attempts(client_id);
CREATE INDEX IF NOT EXISTS idx_ext_contact_trainer_id ON external_contact_attempts(external_trainer_id);
CREATE INDEX IF NOT EXISTS idx_ext_contact_delivery_status ON external_contact_attempts(delivery_status);
CREATE INDEX IF NOT EXISTS idx_ext_contact_created_at ON external_contact_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_ext_contact_message_hash ON external_contact_attempts(message_hash);

-- ============================================
-- 3. Claim Tokens Table (Additional security)
-- ============================================
CREATE TABLE IF NOT EXISTS external_claim_tokens (
  token VARCHAR(64) PRIMARY KEY,
  external_trainer_id UUID REFERENCES external_trainers(id) ON DELETE CASCADE,
  contact_attempt_id UUID REFERENCES external_contact_attempts(id) ON DELETE SET NULL,
  
  -- Claim details
  claimed_by_email VARCHAR(255),
  claimed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,
  
  -- Token limits
  max_uses INTEGER DEFAULT 1,
  use_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Security
  is_revoked BOOLEAN DEFAULT FALSE,
  revoke_reason TEXT,
  revoked_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_claim_tokens_trainer_id ON external_claim_tokens(external_trainer_id);
CREATE INDEX IF NOT EXISTS idx_claim_tokens_expires_at ON external_claim_tokens(expires_at);

-- ============================================
-- 4. External Trainer Match Cache
-- Pre-calculated match scores for performance
-- ============================================
CREATE TABLE IF NOT EXISTS external_trainer_match_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_trainer_id UUID REFERENCES external_trainers(id) ON DELETE CASCADE,
  
  -- Match scores (capped per Phase 61 rules)
  raw_score INTEGER NOT NULL CHECK (raw_score >= 0 AND raw_score <= 100),
  capped_score INTEGER NOT NULL CHECK (capped_score >= 0 AND capped_score <= 75),
  score_components JSONB NOT NULL,
  
  -- Explainability
  explanation_key VARCHAR(50) NOT NULL DEFAULT 'external_trainer',
  rationale TEXT NOT NULL,
  
  -- Visibility
  is_visible BOOLEAN DEFAULT TRUE,
  hide_reason TEXT,
  
  -- Performance
  calculation_duration_ms INTEGER,
  
  -- Timestamps
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Unique constraint
  UNIQUE(client_id, external_trainer_id)
);

CREATE INDEX IF NOT EXISTS idx_ext_match_cache_client_id ON external_trainer_match_cache(client_id);
CREATE INDEX IF NOT EXISTS idx_ext_match_cache_capped_score ON external_trainer_match_cache(capped_score DESC);
CREATE INDEX IF NOT EXISTS idx_ext_match_cache_expires_at ON external_trainer_match_cache(expires_at);

-- ============================================
-- 5. Safety & Abuse Monitoring Tables
-- ============================================
CREATE TABLE IF NOT EXISTS external_safety_flags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  external_trainer_id UUID REFERENCES external_trainers(id) ON DELETE CASCADE,
  contact_attempt_id UUID REFERENCES external_contact_attempts(id) ON DELETE SET NULL,
  
  flag_type VARCHAR(50) NOT NULL CHECK (flag_type IN (
    'off_platform_attempt', 'suspicious_link', 'inappropriate_content',
    'spam_pattern', 'rate_limit_exceeded', 'other'
  )),
  severity VARCHAR(20) NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB NOT NULL,
  action_taken VARCHAR(50) CHECK (action_taken IN (
    'none', 'warned', 'quarantined', 'blocked', 'archived'
  )),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS external_rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- Can be IP, client_id, etc.
  identifier_type VARCHAR(50) NOT NULL CHECK (identifier_type IN ('ip', 'client_id', 'email')),
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('contact', 'view', 'claim_request')),
  count INTEGER NOT NULL DEFAULT 0,
  time_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  time_window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  UNIQUE(identifier, identifier_type, action_type, time_window_start)
);

-- ============================================
-- 6. RLS Policies
-- ============================================

-- External trainers: Read-only for authenticated users
ALTER TABLE external_trainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "External trainers are visible to authenticated users" ON external_trainers
  FOR SELECT USING (auth.role() = 'authenticated' AND status != 'archived');

-- External contact attempts: Users can see their own
ALTER TABLE external_contact_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own external contact attempts" ON external_contact_attempts
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can insert own external contact attempts" ON external_contact_attempts
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- External trainer match cache: Users can see their own
ALTER TABLE external_trainer_match_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own external match cache" ON external_trainer_match_cache
  FOR SELECT USING (auth.uid() = client_id);

-- ============================================
-- 7. Functions and Triggers
-- ============================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_external_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_external_trainers_updated_at
  BEFORE UPDATE ON external_trainers
  FOR EACH ROW
  EXECUTE FUNCTION update_external_updated_at();

CREATE TRIGGER update_external_contact_updated_at
  BEFORE UPDATE ON external_contact_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_external_updated_at();

-- Function to generate claim token
CREATE OR REPLACE FUNCTION generate_claim_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate secure token for new external trainers
  IF NEW.claim_token IS NULL AND NEW.status = 'web_unclaimed' THEN
    NEW.claim_token = encode(gen_random_bytes(32), 'hex');
    NEW.claim_token_expires_at = TIMEZONE('utc', NOW()) + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_external_trainer_claim_token
  BEFORE INSERT ON external_trainers
  FOR EACH ROW
  EXECUTE FUNCTION generate_claim_token();

-- Function to clean expired cache
CREATE OR REPLACE FUNCTION clean_expired_external_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM external_trainer_match_cache WHERE expires_at < TIMEZONE('utc', NOW());
  DELETE FROM external_claim_tokens WHERE expires_at < TIMEZONE('utc', NOW());
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Comments
-- ============================================
COMMENT ON TABLE external_trainers IS 'External trainers not yet on platform (Phase 61)';
COMMENT ON TABLE external_contact_attempts IS 'Controlled contact attempts with external trainers';
COMMENT ON TABLE external_claim_tokens IS 'Secure tokens for claiming external trainer accounts';
COMMENT ON TABLE external_trainer_match_cache IS 'Cached match scores for external trainers';
COMMENT ON TABLE external_safety_flags IS 'Safety and abuse monitoring for external interactions';
COMMENT ON TABLE external_rate_limits IS 'Rate limiting for external trainer interactions';
