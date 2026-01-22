Creating Phase 82 Interpretability Events migration...
-- supabase/migrations/20250123000000_phase82_interpretability_events.sql
-- PHASE 82: Interpretability Audit (IA)
-- Stores user interpretation data about compatibility signal understanding
-- IMPORTANT: This is read-only analytics - no real-time adaptation

-- ============================================
-- 1. Create interpretability_events table
-- ============================================
CREATE TABLE IF NOT EXISTS interpretability_events (
event_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
session_id TEXT NOT NULL,
signal_visibility_state TEXT NOT NULL CHECK (signal_visibility_state IN ('visible', 'hidden', 'unknown')),
prompt_variant_id TEXT NOT NULL,
selected_response TEXT NOT NULL,
timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE interpretability_events IS
'Phase 82: Interpretability Audit events. Stores user responses to interpretation prompts. Aggregate-only access.';


-- ============================================
-- 2. Create indexes (for aggregate analysis only)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_interpretability_events_session
ON interpretability_events(session_id);

CREATE INDEX IF NOT EXISTS idx_interpretability_events_timestamp
ON interpretability_events(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_interpretability_events_prompt
ON interpretability_events(prompt_variant_id);

CREATE INDEX IF NOT EXISTS idx_interpretability_events_response
ON interpretability_events(selected_response);

-- ============================================
-- 3. Create view for Phase 82 audit analysis
-- ============================================
CREATE OR REPLACE VIEW phase82_interpretability_audit AS
SELECT
-- Date grouping
DATE(timestamp) as event_date,

-- Prompt variant analysis
prompt_variant_id,

-- Response distribution
selected_response,
COUNT(*) as response_count,

-- Signal visibility context
signal_visibility_state,

-- Session analysis
COUNT(DISTINCT session_id) as unique_sessions

FROM interpretability_events
GROUP BY
DATE(timestamp),
prompt_variant_id,
selected_response,
signal_visibility_state;

COMMENT ON VIEW phase82_interpretability_audit IS
'Phase 82 audit view. Provides aggregated interpretation data for the Interpretability Audit Report. No user-level joins allowed.';


-- ============================================
-- 4. Create helper functions for analysis
-- ============================================
CREATE OR REPLACE FUNCTION get_interpretability_summary(
start_date DATE DEFAULT NULL,
end_date DATE DEFAULT NULL
)
RETURNS TABLE(
total_responses BIGINT,
unique_sessions BIGINT,
days_observed BIGINT,
prompt_variants_count BIGINT
) AS ✅ Updated CompatibilitySignal component with Phase 81 instrumentation
BEGIN
RETURN QUERY
SELECT
COUNT(*) as total_responses,
COUNT(DISTINCT session_id) as unique_sessions,
COUNT(DISTINCT DATE(timestamp)) as days_observed,
COUNT(DISTINCT prompt_variant_id) as prompt_variants_count
FROM interpretability_events
WHERE (start_date IS NULL OR DATE(timestamp) >= start_date)
AND (end_date IS NULL OR DATE(timestamp) <= end_date);
END;
✅ Updated CompatibilitySignal component with Phase 81 instrumentation LANGUAGE plpgsql;

COMMENT ON FUNCTION get_interpretability_summary IS
'Provides basic summary statistics for Phase 82 audit.';

-- Authority vs Exploration interpretation summary
CREATE OR REPLACE FUNCTION get_interpretation_pattern_summary()
RETURNS TABLE(
interpretation_pattern TEXT,
response_count BIGINT,
percentage NUMERIC
) AS ✅ Updated CompatibilitySignal component with Phase 81 instrumentation
DECLARE
total_responses BIGINT;
BEGIN
SELECT COUNT(*) INTO total_responses
FROM interpretability_events;

RETURN QUERY
WITH pattern_categories AS (
SELECT
CASE
WHEN LOWER(selected_response) LIKE '%recommendation%' OR
LOWER(selected_response) LIKE '%ranking%' OR
LOWER(selected_response) LIKE '%advice%' OR
selected_response IN ('A recommendation', 'A ranking of who''s best', 'Advice I should probably follow')
THEN 'authority_interpretation'
WHEN LOWER(selected_response) LIKE '%suggestion%' OR
LOWER(selected_response) LIKE '%explore%' OR
selected_response IN ('A suggestion to explore')
THEN 'exploration_interpretation'
WHEN LOWER(selected_response) LIKE '%not sure%' OR
selected_response IN ('I''m not sure')
THEN 'uncertain'
WHEN selected_response IN ('Not at all', 'A little', 'Somewhat', 'A lot')
THEN 'influence_self_report'
ELSE 'other'
END as pattern_category,
selected_response
FROM interpretability_events
)
SELECT
pattern_category as interpretation_pattern,
COUNT() as response_count,
ROUND((COUNT() * 100.0 / NULLIF(total_responses, 0)), 2) as percentage
FROM pattern_categories
GROUP BY pattern_category
ORDER BY response_count DESC;
END;
✅ Updated CompatibilitySignal component with Phase 81 instrumentation LANGUAGE plpgsql;

COMMENT ON FUNCTION get_interpretation_pattern_summary IS
'Categorizes interpretation patterns for Phase 82 audit report.';

-- ============================================
-- 5. Create function to check audit readiness
-- ============================================
CREATE OR REPLACE FUNCTION is_phase82_ready_for_audit()
RETURNS BOOLEAN AS ✅ Updated CompatibilitySignal component with Phase 81 instrumentation
DECLARE
min_responses INTEGER := 100; -- Minimum responses needed for valid audit
response_count BIGINT;
BEGIN
SELECT COUNT(*) INTO response_count
FROM interpretability_events;

RETURN response_count >= min_responses;
END;
✅ Updated CompatibilitySignal component with Phase 81 instrumentation LANGUAGE plpgsql;

COMMENT ON FUNCTION is_phase82_ready_for_audit IS
'Checks if Phase 82 has collected enough data for audit analysis.';

-- ============================================
-- 6. Migration complete notice
-- ============================================
-- This migration creates the infrastructure for Phase 82 Interpretability Audit.
-- Key principles:
-- 1. Aggregate-only access (no user-level joins)
-- 2. No real-time adaptation
-- 3. Stores interpretation, not opinion
-- 4. Separate from UAI events as required
-- 5. Ready for Phase 82 Audit Report generation

