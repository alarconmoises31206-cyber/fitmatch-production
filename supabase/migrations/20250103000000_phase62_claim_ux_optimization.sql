-- supabase/migrations/20250103000000_phase62_claim_ux_optimization.sql
-- Phase 62: Trainer Claim UX + Incentive Optimization

-- ============================================
-- 1. Claim Sources Enum and Tracking
-- ============================================
CREATE TYPE claim_source AS ENUM (
  'email_link',
  'in_app_reply',
  'reminder_banner',
  'admin_invite',
  'direct_link'
);

ALTER TABLE external_claim_tokens 
ADD COLUMN IF NOT EXISTS claim_source claim_source DEFAULT 'email_link',
ADD COLUMN IF NOT EXISTS entry_point_data JSONB DEFAULT '{}';

-- ============================================
-- 2. Claim Landing Analytics
-- ============================================
CREATE TABLE IF NOT EXISTS claim_page_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  claim_token_id UUID REFERENCES external_claim_tokens(token) ON DELETE SET NULL,
  external_trainer_id UUID REFERENCES external_trainers(id) ON DELETE CASCADE,
  
  -- Page interaction
  page_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  time_on_page_seconds INTEGER,
  sections_viewed TEXT[], -- Which UI sections were viewed
  scroll_depth_percentage INTEGER,
  
  -- Device/browser info
  user_agent TEXT,
  screen_resolution VARCHAR(50),
  device_type VARCHAR(50),
  
  -- Exit behavior
  exit_intent_detected BOOLEAN DEFAULT FALSE,
  exit_reason VARCHAR(100), -- 'close', 'navigate', 'timeout'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_claim_page_analytics_token ON claim_page_analytics(claim_token_id);
CREATE INDEX IF NOT EXISTS idx_claim_page_analytics_viewed_at ON claim_page_analytics(page_viewed_at);

-- ============================================
-- 3. Post-Claim Boost System
-- ============================================
ALTER TABLE trainer_profiles 
ADD COLUMN IF NOT EXISTS claimed_boost_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS claim_boost_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS new_trainer_badge_until TIMESTAMP WITH TIME ZONE;

-- Boost eligibility table
CREATE TABLE IF NOT EXISTS trainer_boosts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trainer_id UUID REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  boost_type VARCHAR(50) NOT NULL CHECK (boost_type IN ('post_claim', 'performance', 'promotional')),
  boost_factor DECIMAL(3,2) NOT NULL DEFAULT 1.2, -- 20% boost
  applies_to VARCHAR(50) NOT NULL DEFAULT 'match_score' CHECK (applies_to IN ('match_score', 'visibility', 'ranking')),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_trainer_boosts_trainer ON trainer_boosts(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_boosts_active ON trainer_boosts(is_active, valid_until);

-- ============================================
-- 4. Free Tier Quota Tracking
-- ============================================
CREATE TABLE IF NOT EXISTS free_tier_quotas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trainer_id UUID REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  
  -- Weekly limits (reset every Monday)
  week_start_date DATE NOT NULL,
  matches_shown INTEGER DEFAULT 0,
  matches_shown_limit INTEGER DEFAULT 10,
  consultations_responded INTEGER DEFAULT 0,
  consultations_limit INTEGER DEFAULT 3,
  tokens_earned INTEGER DEFAULT 0,
  tokens_earned_limit INTEGER DEFAULT 50, -- Tokens earned but locked
  
  -- Monthly limits
  month_start_date DATE NOT NULL,
  total_contacts INTEGER DEFAULT 0,
  total_contacts_limit INTEGER DEFAULT 20,
  
  -- Usage alerts
  last_alert_sent_at TIMESTAMP WITH TIME ZONE,
  alerts_sent INTEGER DEFAULT 0,
  
  -- Reset tracking
  last_reset_at TIMESTAMP WITH TIME ZONE,
  auto_reset_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  UNIQUE(trainer_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS idx_free_tier_quotas_trainer ON free_tier_quotas(trainer_id);
CREATE INDEX IF NOT EXISTS idx_free_tier_quotas_week ON free_tier_quotas(week_start_date);

-- ============================================
-- 5. Upgrade Intent Tracking
-- ============================================
CREATE TABLE IF NOT EXISTS upgrade_intents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trainer_id UUID REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  
  intent_source VARCHAR(50) NOT NULL CHECK (intent_source IN (
    'quota_exhausted',
    'earnings_preview',
    'comparison_table',
    'manual_cta',
    'admin_prompt'
  )),
  
  -- Context data
  context_data JSONB NOT NULL DEFAULT '{}',
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- User response
  user_action VARCHAR(50) CHECK (user_action IN (
    'viewed',
    'dismissed',
    'clicked',
    'started_checkout',
    'completed_upgrade'
  )),
  action_taken_at TIMESTAMP WITH TIME ZONE,
  
  -- Conversion tracking
  converted_to_paid BOOLEAN DEFAULT FALSE,
  conversion_days INTEGER, -- Days from intent to conversion
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_upgrade_intents_trainer ON upgrade_intents(trainer_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_intents_shown_at ON upgrade_intents(shown_at);
CREATE INDEX IF NOT EXISTS idx_upgrade_intents_converted ON upgrade_intents(converted_to_paid);

-- ============================================
-- 6. Earnings Preview System
-- ============================================
CREATE TABLE IF NOT EXISTS trainer_earnings_previews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trainer_id UUID REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  
  -- Current earnings (locked in free tier)
  tokens_earned INTEGER DEFAULT 0,
  tokens_locked INTEGER DEFAULT 0,
  tokens_available INTEGER DEFAULT 0,
  
  -- Projections
  weekly_earnings_projection INTEGER,
  projection_confidence VARCHAR(20) DEFAULT 'conservative' CHECK (projection_confidence IN ('conservative', 'moderate', 'optimistic')),
  
  -- Withdrawal info
  withdrawal_available BOOLEAN DEFAULT FALSE,
  minimum_withdrawal INTEGER DEFAULT 100,
  
  -- Preview shown
  last_preview_shown_at TIMESTAMP WITH TIME ZONE,
  previews_shown INTEGER DEFAULT 0,
  
  -- User interaction
  user_clicked_withdraw BOOLEAN DEFAULT FALSE,
  user_clicked_upgrade BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_earnings_previews_trainer ON trainer_earnings_previews(trainer_id);

-- ============================================
-- 7. Copy Optimization A/B Testing
-- ============================================
CREATE TABLE IF NOT EXISTS copy_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  variant_name VARCHAR(100) NOT NULL,
  variant_key VARCHAR(50) NOT NULL, -- e.g., 'claim_hero_headline'
  copy_text TEXT NOT NULL,
  tone VARCHAR(50) CHECK (tone IN ('professional', 'calm', 'urgent', 'friendly')),
  
  -- Testing info
  is_active BOOLEAN DEFAULT TRUE,
  test_group VARCHAR(50), -- 'A', 'B', 'control'
  weight INTEGER DEFAULT 1, -- For weighted distribution
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS copy_performance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  variant_id UUID REFERENCES copy_variants(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES trainer_profiles(id) ON DELETE SET NULL,
  
  -- Engagement metrics
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  time_engaged_seconds INTEGER,
  clicked_cta BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_copy_variants_key ON copy_variants(variant_key, is_active);
CREATE INDEX IF NOT EXISTS idx_copy_performance_variant ON copy_performance(variant_id);

-- ============================================
-- 8. Functions and Triggers
-- ============================================

-- Function to apply post-claim boost
CREATE OR REPLACE FUNCTION apply_post_claim_boost()
RETURNS TRIGGER AS $$
BEGIN
  -- When a trainer profile is created from an external claim
  IF NEW.subscription_status = 'free' AND TG_OP = 'INSERT' THEN
    -- Set boost period (72 hours)
    NEW.claimed_boost_until = TIMEZONE('utc', NOW()) + INTERVAL '72 hours';
    NEW.new_trainer_badge_until = TIMEZONE('utc', NOW()) + INTERVAL '7 days';
    
    -- Create boost record
    INSERT INTO trainer_boosts (
      trainer_id,
      boost_type,
      boost_factor,
      applies_to,
      valid_from,
      valid_until
    ) VALUES (
      NEW.id,
      'post_claim',
      1.25, -- 25% boost for new claims
      'match_score',
      TIMEZONE('utc', NOW()),
      TIMEZONE('utc', NOW()) + INTERVAL '72 hours'
    );
    
    -- Initialize free tier quota
    INSERT INTO free_tier_quotas (
      trainer_id,
      week_start_date,
      month_start_date
    ) VALUES (
      NEW.id,
      DATE_TRUNC('week', TIMEZONE('utc', NOW())),
      DATE_TRUNC('month', TIMEZONE('utc', NOW()))
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new trainer profiles
DROP TRIGGER IF EXISTS trigger_apply_post_claim_boost ON trainer_profiles;
CREATE TRIGGER trigger_apply_post_claim_boost
  BEFORE INSERT ON trainer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION apply_post_claim_boost();

-- Function to reset weekly quotas
CREATE OR REPLACE FUNCTION reset_weekly_quotas()
RETURNS void AS $$
BEGIN
  UPDATE free_tier_quotas
  SET 
    matches_shown = 0,
    consultations_responded = 0,
    last_reset_at = TIMEZONE('utc', NOW()),
    week_start_date = DATE_TRUNC('week', TIMEZONE('utc', NOW()))
  WHERE week_start_date < DATE_TRUNC('week', TIMEZONE('utc', NOW()));
END;
$$ LANGUAGE plpgsql;

-- Function to check and record upgrade intent
CREATE OR REPLACE FUNCTION check_upgrade_intent()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if quota is 80% used
  IF TG_TABLE_NAME = 'free_tier_quotas' THEN
    IF (NEW.matches_shown >= NEW.matches_shown_limit * 0.8) OR
       (NEW.consultations_responded >= NEW.consultations_limit * 0.8) THEN
      
      INSERT INTO upgrade_intents (
        trainer_id,
        intent_source,
        context_data,
        shown_at,
        user_action
      ) VALUES (
        NEW.trainer_id,
        'quota_exhausted',
        jsonb_build_object(
          'matches_shown', NEW.matches_shown,
          'matches_limit', NEW.matches_shown_limit,
          'consultations', NEW.consultations_responded,
          'consultations_limit', NEW.consultations_limit
        ),
        TIMEZONE('utc', NOW()),
        'viewed'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for quota updates
DROP TRIGGER IF EXISTS trigger_check_upgrade_intent ON free_tier_quotas;
CREATE TRIGGER trigger_check_upgrade_intent
  AFTER UPDATE ON free_tier_quotas
  FOR EACH ROW
  EXECUTE FUNCTION check_upgrade_intent();

-- ============================================
-- 9. RLS Policies
-- ============================================

-- Claim page analytics: trainers can see their own
ALTER TABLE claim_page_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trainers can view own claim analytics" ON claim_page_analytics
  FOR SELECT USING (
    auth.uid() IN (
      SELECT claimed_by_user_id 
      FROM external_trainers et
      JOIN external_claim_tokens ect ON et.id = ect.external_trainer_id
      WHERE ect.token = claim_token_id
    )
  );

-- Free tier quotas: trainers can see their own
ALTER TABLE free_tier_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trainers can view own quotas" ON free_tier_quotas
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM trainer_profiles WHERE id = trainer_id
  ));

-- Upgrade intents: trainers can see their own
ALTER TABLE upgrade_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trainers can view own upgrade intents" ON upgrade_intents
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM trainer_profiles WHERE id = trainer_id
  ));

-- Earnings previews: trainers can see their own
ALTER TABLE trainer_earnings_previews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trainers can view own earnings previews" ON trainer_earnings_previews
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM trainer_profiles WHERE id = trainer_id
  ));

-- ============================================
-- 10. Comments
-- ============================================
COMMENT ON TABLE claim_page_analytics IS 'Analytics for claim landing page (Phase 62)';
COMMENT ON TABLE trainer_boosts IS 'Temporary boosts for trainer visibility and ranking';
COMMENT ON TABLE free_tier_quotas IS 'Free tier usage tracking with limits';
COMMENT ON TABLE upgrade_intents IS 'Tracked upgrade prompts and conversions';
COMMENT ON TABLE trainer_earnings_previews IS 'Earnings projections for free tier trainers';
COMMENT ON TABLE copy_variants IS 'A/B testing for copy optimization';
COMMENT ON TABLE copy_performance IS 'Performance metrics for copy variants';

-- ============================================
-- 11. Sample Data for Copy Variants
-- ============================================
INSERT INTO copy_variants (variant_name, variant_key, copy_text, tone, test_group) VALUES
-- Claim page hero headlines
('Professional Headline', 'claim_hero_headline', 'You already matched with a real client', 'professional', 'A'),
('Benefit Headline', 'claim_hero_headline', 'Start earning from matches immediately', 'professional', 'B'),
('Simple Headline', 'claim_hero_headline', 'Welcome to FitMatch', 'calm', 'C'),

-- Tier comparison
('Clear Limits', 'tier_comparison_free', 'Free: 10 matches/week, respond to 3 consultations', 'professional', 'A'),
('Benefit Focus', 'tier_comparison_free', 'Free: Start earning tokens today', 'friendly', 'B'),

-- Upgrade prompt
('Earnings Focus', 'upgrade_prompt', 'Unlock your $X in earned tokens', 'professional', 'A'),
('Limit Focus', 'upgrade_prompt', 'Remove weekly limits to earn more', 'calm', 'B')
ON CONFLICT DO NOTHING;
