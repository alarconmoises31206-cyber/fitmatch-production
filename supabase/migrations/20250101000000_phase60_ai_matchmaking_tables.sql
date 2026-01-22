-- supabase/migrations/20250101000000_phase60_ai_matchmaking_tables.sql
-- Phase 60: AI Matchmaking Engine - Database Tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Match Requests Table
-- Tracks each match generation request
-- ============================================
CREATE TABLE IF NOT EXISTS match_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token_budget_used INTEGER DEFAULT 0,
  matches_generated INTEGER NOT NULL,
  request_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Indexes for performance
  CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_match_requests_client_id ON match_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_created_at ON match_requests(created_at);

-- ============================================
-- 2. User Tokens Table
-- Tracks token balances for users
-- ============================================
CREATE TABLE IF NOT EXISTS user_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  CONSTRAINT balance_non_negative CHECK (balance >= 0),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);

-- Insert default token balances for existing users (optional)
-- INSERT INTO user_tokens (user_id, balance)
-- SELECT id, 10 FROM auth.users
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 3. Token Transactions Table
-- Audit trail for all token transactions
-- ============================================
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('purchase', 'reward', 'trainer_contact', 'refund', 'adjustment')),
  description TEXT,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_id UUID, -- Links to other tables (contact_requests, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  CONSTRAINT fk_user_transaction FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(type);

-- ============================================
-- 4. Contact Requests Table
-- Tracks when clients contact trainers
-- ============================================
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_profile_id UUID REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  token_cost INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message TEXT,
  client_visible BOOLEAN DEFAULT true,
  trainer_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  CONSTRAINT fk_client_contact FOREIGN KEY (client_id) REFERENCES auth.users(id),
  CONSTRAINT fk_trainer_contact FOREIGN KEY (trainer_id) REFERENCES auth.users(id),
  CONSTRAINT fk_trainer_profile FOREIGN KEY (trainer_profile_id) REFERENCES trainer_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_client_id ON contact_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_trainer_id ON contact_requests(trainer_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at);

-- ============================================
-- 5. User Activities Table
-- Logs user actions for analytics and auditing
-- ============================================
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
    'login', 'logout', 'profile_update', 'trainer_contact', 
    'match_generation', 'token_purchase', 'token_spent'
  )),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  CONSTRAINT fk_user_activity FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activities_details ON user_activities USING GIN(details);

-- ============================================
-- 6. Match Results Cache Table (Optional)
-- Caches match results for faster retrieval
-- ============================================
CREATE TABLE IF NOT EXISTS match_results_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_profile_id UUID REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  breakdown JSONB NOT NULL,
  rationale TEXT,
  token_cost_estimate INTEGER DEFAULT 0,
  visible_details VARCHAR(20) CHECK (visible_details IN ('blurred', 'partial', 'full')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  CONSTRAINT fk_client_cache FOREIGN KEY (client_id) REFERENCES auth.users(id),
  CONSTRAINT fk_trainer_cache FOREIGN KEY (trainer_id) REFERENCES auth.users(id),
  CONSTRAINT fk_trainer_profile_cache FOREIGN KEY (trainer_profile_id) REFERENCES trainer_profiles(id),
  UNIQUE(client_id, trainer_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_match_results_cache_client_id ON match_results_cache(client_id);
CREATE INDEX IF NOT EXISTS idx_match_results_cache_expires_at ON match_results_cache(expires_at);

-- ============================================
-- 7. RLS (Row Level Security) Policies
-- ============================================

-- Match Requests: Users can see their own requests
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own match requests" ON match_requests
  FOR SELECT USING (auth.uid() = client_id);

-- User Tokens: Users can see their own balance
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own token balance" ON user_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Token Transactions: Users can see their own transactions
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own token transactions" ON token_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Contact Requests: Users can see their sent/received requests
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own contact requests" ON contact_requests
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Users can insert own contact requests" ON contact_requests
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- User Activities: Users can see their own activities
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activities" ON user_activities
  FOR SELECT USING (auth.uid() = user_id);

-- Match Results Cache: Users can see their own cached results
ALTER TABLE match_results_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cached matches" ON match_results_cache
  FOR SELECT USING (auth.uid() = client_id);

-- ============================================
-- 8. Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for contact_requests updated_at
CREATE TRIGGER update_contact_requests_updated_at
  BEFORE UPDATE ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_match_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM match_results_cache WHERE expires_at < TIMEZONE('utc', NOW());
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. Comments for documentation
-- ============================================
COMMENT ON TABLE match_requests IS 'Tracks AI match generation requests for analytics';
COMMENT ON TABLE user_tokens IS 'User token balances for accessing premium features';
COMMENT ON TABLE token_transactions IS 'Audit trail for all token transactions';
COMMENT ON TABLE contact_requests IS 'Contact requests between clients and trainers';
COMMENT ON TABLE user_activities IS 'User activity log for analytics and auditing';
COMMENT ON TABLE match_results_cache IS 'Cached match results for performance optimization';
