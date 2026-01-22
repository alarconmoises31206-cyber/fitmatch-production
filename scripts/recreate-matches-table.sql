-- COMPLETE matches TABLE RECREATION
-- Run this in Supabase SQL Editor

-- First, drop the table if it exists (safe since it's empty)
DROP TABLE IF EXISTS matches CASCADE;

-- Create the table with all required columns
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES trainer_profiles(id) ON DELETE CASCADE,
  fitmatch_score INTEGER NOT NULL CHECK (fitmatch_score >= 0 AND fitmatch_score <= 100),
  match_type TEXT NOT NULL CHECK (match_type IN ('basic', 'deep')),
  score_confidence TEXT NOT NULL CHECK (score_confidence IN ('low', 'medium', 'high')),
  embedding_used BOOLEAN DEFAULT FALSE,
  explanation_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one match record per client-trainer pair
  UNIQUE(client_id, trainer_id)
);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
CREATE POLICY "Allow all operations for development" ON matches
  FOR ALL USING (true);

-- Verify the table was created
SELECT 
  'matches table created successfully' as status,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'matches' 
AND table_schema = 'public';

-- Show the schema
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'matches' 
AND table_schema = 'public'
ORDER BY ordinal_position;
