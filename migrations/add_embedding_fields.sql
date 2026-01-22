-- Add Phase 28 embedding columns to client_profiles
ALTER TABLE client_profiles 
ADD COLUMN IF NOT EXISTS motivation_challenges TEXT,
ADD COLUMN IF NOT EXISTS past_struggles TEXT,
ADD COLUMN IF NOT EXISTS learning_preferences TEXT,
ADD COLUMN IF NOT EXISTS accountability_needs TEXT,
ADD COLUMN IF NOT EXISTS long_term_vision TEXT;

-- Add Phase 28 embedding columns to trainer_profiles  
ALTER TABLE trainer_profiles
ADD COLUMN IF NOT EXISTS coaching_philosophy TEXT,
ADD COLUMN IF NOT EXISTS motivation_approach TEXT,
ADD COLUMN IF NOT EXISTS client_psychology TEXT,
ADD COLUMN IF NOT EXISTS communication_tone TEXT,
ADD COLUMN IF NOT EXISTS population_focus TEXT;
