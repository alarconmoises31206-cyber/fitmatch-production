-- supabase/migrations/20260108181537_phase66_5_questionnaire_tables.sql
-- Phase 66.5: Question & Signal Design Foundation
-- Creates questionnaire response tables for structured matching signals

-- ============================================
-- 1. Create client_questionnaire_responses table
-- ============================================
CREATE TABLE IF NOT EXISTS client_questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one response per question per client profile
  UNIQUE(client_profile_id, question)
);

-- Add index for faster queries by client profile
CREATE INDEX IF NOT EXISTS idx_client_questionnaire_client_profile 
ON client_questionnaire_responses(client_profile_id);

-- Add index for faster queries by question type
CREATE INDEX IF NOT EXISTS idx_client_questionnaire_question 
ON client_questionnaire_responses(question);

COMMENT ON TABLE client_questionnaire_responses IS 
'Structured responses to Phase 66.5 client questions. Used for intentional matching based on question design.';

-- ============================================
-- 2. Create trainer_questionnaire_responses table (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS trainer_questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_profile_id UUID NOT NULL REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one response per question per trainer profile
  UNIQUE(trainer_profile_id, question)
);

-- Add index for faster queries by trainer profile
CREATE INDEX IF NOT EXISTS idx_trainer_questionnaire_trainer_profile 
ON trainer_questionnaire_responses(trainer_profile_id);

-- Add index for faster queries by question type
CREATE INDEX IF NOT EXISTS idx_trainer_questionnaire_question 
ON trainer_questionnaire_responses(question);

COMMENT ON TABLE trainer_questionnaire_responses IS 
'Structured responses to Phase 66.5 trainer questions. Used for intentional matching based on question design.';

-- ============================================
-- 3. Add RLS (Row Level Security) policies
-- ============================================
ALTER TABLE client_questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Clients can only see their own questionnaire responses
CREATE POLICY "Clients can view own questionnaire responses" 
ON client_questionnaire_responses
FOR SELECT USING (
  client_profile_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
  )
);

-- Clients can insert/update their own questionnaire responses
CREATE POLICY "Clients can manage own questionnaire responses" 
ON client_questionnaire_responses
FOR ALL USING (
  client_profile_id IN (
    SELECT id FROM client_profiles WHERE user_id = auth.uid()
  )
);

-- Trainers can only see their own questionnaire responses
CREATE POLICY "Trainers can view own questionnaire responses" 
ON trainer_questionnaire_responses
FOR SELECT USING (
  trainer_profile_id IN (
    SELECT id FROM trainer_profiles WHERE user_id = auth.uid()
  )
);

-- Trainers can insert/update their own questionnaire responses
CREATE POLICY "Trainers can manage own questionnaire responses" 
ON trainer_questionnaire_responses
FOR ALL USING (
  trainer_profile_id IN (
    SELECT id FROM trainer_profiles WHERE user_id = auth.uid()
  )
);

-- ============================================
-- 4. Phase 66.5 Question Definitions (Reference)
-- ============================================
-- Note: These questions are stored in application code, not in database.
-- This section documents the Phase 66.5 question design for reference.

-- Client Questions (from Phase 66.5.2):
-- 1. "What are you hoping to get help with right now?" (Primary Goal)
-- 2. "What hasn't worked for you in the past?" (Past Friction)
-- 3. "How do you prefer to be supported or coached?" (Preferred Interaction Style)
-- 4. "Are there any limits or boundaries a trainer should respect?" (Constraints)
-- 5. "What level of commitment are you bringing right now?" (Readiness)

-- Trainer Questions (from Phase 66.5.3):
-- 1. "How do you typically help clients?" (Approach)
-- 2. "What kinds of clients do you work best with?" (Best-Fit Clients)
-- 3. "What types of situations or requests do you avoid?" (Boundaries)
-- 4. "How would clients describe your communication style?" (Communication Style)
-- 5. "What should a client expect from a paid consultation with you?" (Consultation Philosophy)

-- ============================================
-- 5. Migration complete
-- ============================================
-- These tables enable structured, explainable matching based on
-- Phase 66.5's intentional question design philosophy.
