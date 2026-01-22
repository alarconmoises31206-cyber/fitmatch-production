-- supabase/migrations/20250104000000_phase63_consultation_gating.sql
-- Phase 63: Consultation State & Gating

-- Add consultation pricing fields to trainer_profiles
ALTER TABLE trainer_profiles
ADD COLUMN IF NOT EXISTS free_message_limit INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS paid_rate_tokens INTEGER DEFAULT 10;

-- Add consultation state to conversations
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS consultation_state VARCHAR(20) DEFAULT 'FREE',
ADD COLUMN IF NOT EXISTS free_messages_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tokens_charged INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Create enum for consultation state (if not using CHECK constraint)
-- We'll use CHECK constraint
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS consultation_state_check;
ALTER TABLE conversations
ADD CONSTRAINT consultation_state_check CHECK (consultation_state IN ('FREE', 'LOCKED', 'PAID', 'ENDED'));

-- Update existing conversations to have default state
UPDATE conversations SET consultation_state = 'FREE' WHERE consultation_state IS NULL;
