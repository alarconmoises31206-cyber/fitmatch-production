-- supabase/migrations/20250122000000_phase81_user_agency_events.sql
-- PHASE 81: User Agency Instrumentation (UAI)
-- Stores observational data about how users interact with the compatibility system
-- IMPORTANT: This is write-only during Phase 81 - no reading for adaptation

-- ============================================
-- 1. Create user_agency_events table
-- ============================================
CREATE TABLE IF NOT EXISTS user_agency_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Core event structure (Phase 81 Section 1)
  event_type TEXT NOT NULL,
  user_mode TEXT NOT NULL CHECK (user_mode IN ('client', 'trainer')),
  context TEXT NOT NULL CHECK (context IN ('matches', 'profile', 'detail', 'transparency')),
  
  -- Metadata (no inference, no scoring, just facts)
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Technical metadata
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  session_id TEXT NOT NULL,
  user_id UUID, -- Optional, only for authenticated users
  page_url TEXT NOT NULL,
  
  -- System versioning
  phase_version TEXT NOT NULL DEFAULT 'phase81-v1',
  compatibility_signal_version TEXT,
  
  -- Indexes for analysis (but NO real-time queries during Phase 81)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE user_agency_events IS
'Phase 81: User Agency Instrumentation events. Write-only observational data about how users interact with compatibility signals. No inference, no scoring, just facts.';

COMMENT ON COLUMN user_agency_events.event_type IS
'Type of user agency event (e.g., signal_viewed, message_sent_with_signal_visible). Must pass ethics guardrail check.';

COMMENT ON COLUMN user_agency_events.metadata IS
'Event metadata. Sanitized to remove PII. No inference or scoring data allowed.';

COMMENT ON COLUMN user_agency_events.session_id IS
'Browser session identifier. Allows session-based analysis without personal identification.';

COMMENT ON COLUMN user_agency_events.phase_version IS
'Phase 81 version identifier. Ensures data can be properly interpreted if schema evolves.';

-- ============================================
-- 2. Create indexes (for future analysis only)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_agency_events_event_type 
ON user_agency_events(event_type);

CREATE INDEX IF NOT EXISTS idx_user_agency_events_timestamp 
ON user_agency_events(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_user_agency_events_session 
ON user_agency_events(session_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_user_agency_events_user_mode 
ON user_agency_events(user_mode, timestamp);

-- ============================================
-- 3. Create validation function for ethics guardrail
-- ============================================
CREATE OR REPLACE FUNCTION validate_event_type_ethics(event_type_text TEXT)
RETURNS BOOLEAN AS ✅ Updated CompatibilitySignal component with Phase 81 instrumentation
BEGIN
  -- Phase 81 Section 4: Ethics Guardrail
  -- Check for manipulative or inferential language
  IF LOWER(event_type_text) LIKE ANY(ARRAY[
    '%manipulat%', '%influence%', '%nudge%', '%steer%', '%persuade%',
    '%optimize%', '%convert%', '%engage%', '%retain%', '%trigger%',
    '%prompt%', '%suggest%', '%recommend%', '%prefer%', '%like%',
    '%thought%', '%felt%', '%believed%', '%wanted%', '%intended%'
  ]) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
✅ Updated CompatibilitySignal component with Phase 81 instrumentation LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_event_type_ethics IS
'Phase 81 ethics guardrail check. Ensures event types are neutral and non-manipulative.';

-- ============================================
-- 4. Create trigger to enforce ethics guardrail (optional)
-- ============================================
-- Note: This is commented out because ethics validation happens in application code
-- but could be added as an additional safeguard
/*
CREATE OR REPLACE FUNCTION check_event_type_ethics()
RETURNS TRIGGER AS ✅ Updated CompatibilitySignal component with Phase 81 instrumentation
BEGIN
  IF NOT validate_event_type_ethics(NEW.event_type) THEN
    RAISE EXCEPTION 'Event type "%" failed Phase 81 ethics guardrail check.', NEW.event_type;
  END IF;
  RETURN NEW;
END;
✅ Updated CompatibilitySignal component with Phase 81 instrumentation LANGUAGE plpgsql;

CREATE TRIGGER enforce_ethics_guardrail
  BEFORE INSERT ON user_agency_events
  FOR EACH ROW
  EXECUTE FUNCTION check_event_type_ethics();
*/

-- ============================================
-- 5. Create view for Phase 81 review (read-only, for analysis phase)
-- ============================================
CREATE OR REPLACE VIEW phase81_agency_review AS
SELECT 
  -- Date grouping
  DATE(timestamp) as event_date,
  
  -- Event type analysis
  event_type,
  COUNT(*) as event_count,
  
  -- User mode distribution
  user_mode,
  
  -- Context distribution
  context,
  
  -- Session analysis
  COUNT(DISTINCT session_id) as unique_sessions,
  
  -- User engagement (if available)
  COUNT(DISTINCT user_id) as unique_users
  
FROM user_agency_events
WHERE phase_version = 'phase81-v1'
GROUP BY 
  DATE(timestamp),
  event_type,
  user_mode,
  context;

COMMENT ON VIEW phase81_agency_review IS
'Phase 81 review view. Provides aggregated data for the Phase 81 Review Artifact. No inference, just counts and ratios.';

-- ============================================
-- 6. Create helper function for common queries
-- ============================================
CREATE OR REPLACE FUNCTION get_phase81_event_summary(
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE(
  total_events BIGINT,
  unique_sessions BIGINT,
  unique_users BIGINT,
  days_observed BIGINT
) AS ✅ Updated CompatibilitySignal component with Phase 81 instrumentation
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_events,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT DATE(timestamp)) as days_observed
  FROM user_agency_events
  WHERE phase_version = 'phase81-v1'
    AND (start_date IS NULL OR DATE(timestamp) >= start_date)
    AND (end_date IS NULL OR DATE(timestamp) <= end_date);
END;
✅ Updated CompatibilitySignal component with Phase 81 instrumentation LANGUAGE plpgsql;

COMMENT ON FUNCTION get_phase81_event_summary IS
'Provides basic summary statistics for Phase 81 review. No behavioral inference.';

-- ============================================
-- 7. Create event-specific summary functions
-- ============================================

-- Signal interaction summary
CREATE OR REPLACE FUNCTION get_signal_interaction_summary()
RETURNS TABLE(
  event_type TEXT,
  event_count BIGINT,
  percentage_of_total NUMERIC
) AS ✅ Updated CompatibilitySignal component with Phase 81 instrumentation
DECLARE
  total_events BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_events 
  FROM user_agency_events 
  WHERE phase_version = 'phase81-v1';
  
  RETURN QUERY
  SELECT 
    e.event_type,
    COUNT(*) as event_count,
    ROUND((COUNT(*) * 100.0 / NULLIF(total_events, 0)), 2) as percentage_of_total
  FROM user_agency_events e
  WHERE e.phase_version = 'phase81-v1'
    AND e.event_type IN (
      'signal_viewed',
      'signal_hidden',
      'signal_shown',
      'signal_tooltip_opened',
      'signal_modal_opened'
    )
  GROUP BY e.event_type
  ORDER BY event_count DESC;
END;
✅ Updated CompatibilitySignal component with Phase 81 instrumentation LANGUAGE plpgsql;

-- Decision independence summary
CREATE OR REPLACE FUNCTION get_decision_independence_summary()
RETURNS TABLE(
  message_type TEXT,
  event_count BIGINT,
  with_signal_visible BIGINT,
  with_signal_hidden BIGINT
) AS ✅ Updated CompatibilitySignal component with Phase 81 instrumentation
BEGIN
  RETURN QUERY
  SELECT 
    'message_sent' as message_type,
    COUNT(*) as event_count,
    COUNT(CASE WHEN event_type = 'message_sent_with_signal_visible' THEN 1 END) as with_signal_visible,
    COUNT(CASE WHEN event_type = 'message_sent_with_signal_hidden' THEN 1 END) as with_signal_hidden
  FROM user_agency_events
  WHERE phase_version = 'phase81-v1'
    AND event_type IN (
      'message_sent_with_signal_visible',
      'message_sent_with_signal_hidden',
      'message_sent_low_signal',
      'message_sent_high_signal'
    );
END;
✅ Updated CompatibilitySignal component with Phase 81 instrumentation LANGUAGE plpgsql;

-- ============================================
-- 8. Migration complete notice
-- ============================================
-- This migration creates the infrastructure for Phase 81 User Agency Instrumentation.
-- Key principles:
-- 1. Write-only during Phase 81 (no real-time reading)
-- 2. No inference or scoring in metadata
-- 3. Ethics guardrail enforced
-- 4. Privacy preserved (session-based, optional user IDs)
-- 5. Versioned for future interpretation
