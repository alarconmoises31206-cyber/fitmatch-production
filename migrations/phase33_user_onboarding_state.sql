-- Phase 33: User Onboarding State Table
-- Created: 20241215_2023

BEGIN;

-- Create the onboarding state table
CREATE TABLE user_onboarding_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('client', 'trainer')) NOT NULL,
  has_completed_questionnaire BOOLEAN DEFAULT FALSE,
  has_viewed_matches BOOLEAN DEFAULT FALSE,
  has_started_conversation BOOLEAN DEFAULT FALSE,
  has_sent_first_message BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Index for role-based queries
CREATE INDEX idx_onboarding_state_role ON user_onboarding_state(role);

-- Index for incomplete onboarding users
CREATE INDEX idx_onboarding_incomplete ON user_onboarding_state(
  (has_completed_questionnaire IS FALSE OR 
   has_viewed_matches IS FALSE OR 
   has_started_conversation IS FALSE)
);

-- RLS Policies
ALTER TABLE user_onboarding_state ENABLE ROW LEVEL SECURITY;

-- Users can read their own onboarding state
CREATE POLICY "Users can view own onboarding state"
ON user_onboarding_state
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role can do everything (for automated updates)
CREATE POLICY "Service role full access"
ON user_onboarding_state
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_onboarding_updated_at
BEFORE UPDATE ON user_onboarding_state
FOR EACH ROW
EXECUTE FUNCTION update_onboarding_updated_at();

COMMIT;