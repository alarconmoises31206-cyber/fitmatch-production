-- FIX matches TABLE SCHEMA
-- Run this in Supabase SQL Editor

-- Option 1: Add missing column if table exists
DO $$ 
BEGIN
  -- Check if embedding_used column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'embedding_used'
  ) THEN
    ALTER TABLE matches ADD COLUMN embedding_used BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added embedding_used column to matches table';
  ELSE
    RAISE NOTICE 'embedding_used column already exists';
  END IF;
END $$;

-- Also make sure other columns exist
DO $$ 
BEGIN
  -- Check for other potentially missing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'score_confidence'
  ) THEN
    ALTER TABLE matches ADD COLUMN score_confidence TEXT 
      CHECK (score_confidence IN ('low', 'medium', 'high'));
    RAISE NOTICE 'Added score_confidence column to matches table';
  END IF;
END $$;

-- Verify the table structure
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'matches' 
AND table_schema = 'public'
ORDER BY ordinal_position;
