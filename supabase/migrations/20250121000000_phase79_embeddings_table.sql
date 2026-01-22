-- supabase/migrations/20250121000000_phase79_embeddings_table.sql
-- Phase 79: AI-Assisted Compatibility Engine - Embeddings Storage
-- IMPORTANT: This table stores semantic embeddings for explainable similarity only

-- ============================================
-- 1. Create embeddings table
-- ============================================
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Entity reference
  entity_id UUID NOT NULL, -- client_id or trainer_id
  entity_type TEXT NOT NULL CHECK (entity_type IN ('client', 'trainer')),
  field_id TEXT NOT NULL, -- References truth-map field ID
  
  -- Embedding data
  embedding vector(1536) NOT NULL, -- text-embedding-3-small dimensions
  model_version TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  text_hash TEXT NOT NULL, -- SHA256 of source text for change detection
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Indexes
  CONSTRAINT embeddings_entity_field_unique UNIQUE(entity_id, entity_type, field_id)
);

COMMENT ON TABLE embeddings IS
'Stores semantic embeddings for open-ended profile fields. Used only for explainable similarity calculations, not recommendations.';

COMMENT ON COLUMN embeddings.embedding IS
'Vector embedding of text field. Used for cosine similarity calculations.';

COMMENT ON COLUMN embeddings.text_hash IS
'SHA256 hash of source text. Used to detect changes and determine if regeneration is needed.';

COMMENT ON COLUMN embeddings.model_version IS
'Embedding model version. Allows future model upgrades without breaking existing data.';

-- ============================================
-- 2. Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_embeddings_entity 
ON embeddings(entity_id, entity_type);

CREATE INDEX IF NOT EXISTS idx_embeddings_entity_type_field 
ON embeddings(entity_type, field_id);

CREATE INDEX IF NOT EXISTS idx_embeddings_created_at 
ON embeddings(created_at DESC);

-- For vector similarity searches (if needed in future)
CREATE INDEX IF NOT EXISTS idx_embeddings_vector 
ON embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================
-- 3. Create compatibility scores table (computed, not cached forever)
-- ============================================
CREATE TABLE IF NOT EXISTS compatibility_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Match reference
  client_id UUID NOT NULL REFERENCES client_profiles(user_id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES trainer_profiles(user_id) ON DELETE CASCADE,
  
  -- Compatibility signal
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  label TEXT NOT NULL DEFAULT 'Compatibility Signal',
  explanation TEXT NOT NULL,
  
  -- Computation metadata
  model_version TEXT NOT NULL DEFAULT 'phase79-v1',
  field_mappings_used JSONB NOT NULL DEFAULT '[]',
  
  -- Audit trail
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days') NOT NULL,
  
  -- Indexes
  CONSTRAINT compatibility_scores_unique_match UNIQUE(client_id, trainer_id, computed_at)
);

COMMENT ON TABLE compatibility_scores IS
'Temporary store for computed compatibility scores. Scores expire after 30 days and are recomputed as needed. Not a permanent recommendation store.';

COMMENT ON COLUMN compatibility_scores.score IS
'Compatibility signal score (0-100). Not a quality score, not a ranking, not a prediction.';

COMMENT ON COLUMN compatibility_scores.explanation IS
'Human-readable explanation of the compatibility signal. Must not contain "AI thinks" or psychological claims.';

COMMENT ON COLUMN compatibility_scores.expires_at IS
'Score expiration timestamp. Ensures signals are regularly recomputed and not treated as permanent truths.';

-- ============================================
-- 4. Create indexes for compatibility scores
-- ============================================
CREATE INDEX IF NOT EXISTS idx_compatibility_scores_client 
ON compatibility_scores(client_id, computed_at DESC);

CREATE INDEX IF NOT EXISTS idx_compatibility_scores_trainer 
ON compatibility_scores(trainer_id, computed_at DESC);

CREATE INDEX IF NOT EXISTS idx_compatibility_scores_expires 
ON compatibility_scores(expires_at);

-- ============================================
-- 5. Create function to clean up expired scores
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_compatibility_scores()
RETURNS void AS UTF8
BEGIN
  DELETE FROM compatibility_scores 
  WHERE expires_at < NOW();
END;
UTF8 LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_compatibility_scores() IS
'Removes compatibility scores older than their expiration date. Ensures signals are regularly recomputed.';

-- ============================================
-- 6. Create trigger for automatic cleanup (optional)
-- ============================================
-- Note: Could be run as a scheduled job instead
-- CREATE OR REPLACE FUNCTION trigger_cleanup_expired_scores()
-- RETURNS trigger AS UTF8
-- BEGIN
--   PERFORM cleanup_expired_compatibility_scores();
--   RETURN NEW;
-- END;
-- UTF8 LANGUAGE plpgsql;

-- ============================================
-- 7. Migration complete notice
-- ============================================
-- This migration creates infrastructure for Phase 79 AI-Assisted Compatibility Engine.
-- Key principles:
-- 1. Embeddings are versioned and never mutated
-- 2. Compatibility scores are temporary and expire
-- 3. All data supports explainability and auditability
-- 4. No permanent "recommendation" storage
