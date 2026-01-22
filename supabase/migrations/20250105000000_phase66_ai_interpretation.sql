-- supabase/migrations/20250105000000_phase66_ai_interpretation.sql
-- Phase 66: AI Interpretation & Explainability - Database Updates
-- NON-AUTHORITATIVE: AI summaries are read-only interpretations only

-- ============================================
-- 1. Add AI summary column to client_profiles
-- ============================================
ALTER TABLE client_profiles 
ADD COLUMN IF NOT EXISTS ai_summary JSONB DEFAULT NULL;

COMMENT ON COLUMN client_profiles.ai_summary IS 
'Non-authoritative AI interpretation of client profile. Used for explainability only. Does not affect matching, pricing, or system authority.';

-- ============================================
-- 2. Add AI summary column to trainer_profiles
-- ============================================
ALTER TABLE trainer_profiles 
ADD COLUMN IF NOT EXISTS ai_summary JSONB DEFAULT NULL;

COMMENT ON COLUMN trainer_profiles.ai_summary IS 
'Non-authoritative AI interpretation of trainer profile. Used for explainability only. Does not affect matching, pricing, or system authority.';

-- ============================================
-- 3. Create function to safely update AI summary
-- ============================================
CREATE OR REPLACE FUNCTION safe_update_ai_summary(
  profile_type TEXT,
  profile_user_id UUID,
  new_ai_summary JSONB
)
RETURNS VOID AS $$
BEGIN
  -- Validate profile_type
  IF profile_type NOT IN ('client', 'trainer') THEN
    RAISE EXCEPTION 'Invalid profile_type. Must be "client" or "trainer"';
  END IF;

  -- Update the appropriate table
  IF profile_type = 'client' THEN
    UPDATE client_profiles 
    SET ai_summary = new_ai_summary,
        updated_at = NOW()
    WHERE user_id = profile_user_id;
  ELSE
    UPDATE trainer_profiles 
    SET ai_summary = new_ai_summary,
        updated_at = NOW()
    WHERE user_id = profile_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

COMMENT ON FUNCTION safe_update_ai_summary IS 
'Safely updates AI summary for profiles. This function ensures AI data remains non-authoritative.';

-- ============================================
-- 4. Create index for performance (optional)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_client_profiles_ai_summary 
ON client_profiles USING gin(ai_summary);

CREATE INDEX IF NOT EXISTS idx_trainer_profiles_ai_summary 
ON trainer_profiles USING gin(ai_summary);

-- ============================================
-- 5. Migration complete notice
-- ============================================
-- This migration adds AI interpretation support while maintaining:
-- 1. Non-authoritative data (does not affect system rules)
-- 2. Graceful degradation (system works without AI)
-- 3. Clear boundaries (AI cannot modify economic rules)
