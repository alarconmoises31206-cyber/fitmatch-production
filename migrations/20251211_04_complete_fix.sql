-- COMPLETE FIX for Phase 25 Database Issues
-- Run this entire script to fix both RLS policies and missing columns

-- ========== PART 1: FIX RLS POLICIES ==========
-- First, disable RLS to drop policies
ALTER TABLE trainer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_questionnaire_responses DISABLE ROW LEVEL SECURITY;

-- Now re-enable RLS (this will drop all policies)
ALTER TABLE trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Create correct policies for trainer_profiles
CREATE POLICY "Users can manage own trainer profile"
    ON trainer_profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create correct policies for trainer_questionnaire_responses
CREATE POLICY "Users can manage own questionnaire responses"
    ON trainer_questionnaire_responses
    FOR ALL
    USING (
        auth.uid() = (
            SELECT user_id 
            FROM trainer_profiles 
            WHERE id = trainer_profile_id
        )
    )
    WITH CHECK (
        auth.uid() = (
            SELECT user_id 
            FROM trainer_profiles 
            WHERE id = trainer_profile_id
        )
    );

-- ========== PART 2: ADD MISSING COLUMNS ==========
-- List of columns that should exist in trainer_profiles
DO $$ 
BEGIN
    -- Add bio column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'bio') THEN
        ALTER TABLE trainer_profiles ADD COLUMN bio TEXT;
    END IF;

    -- Add philosophy column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'philosophy') THEN
        ALTER TABLE trainer_profiles ADD COLUMN philosophy TEXT;
    END IF;

    -- Add communication_style column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'communication_style') THEN
        ALTER TABLE trainer_profiles ADD COLUMN communication_style TEXT;
    END IF;

    -- Add lived_experience column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'lived_experience') THEN
        ALTER TABLE trainer_profiles ADD COLUMN lived_experience TEXT;
    END IF;

    -- Add specialties column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'specialties') THEN
        ALTER TABLE trainer_profiles ADD COLUMN specialties TEXT[];
    END IF;

    -- Add timezone column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'timezone') THEN
        ALTER TABLE trainer_profiles ADD COLUMN timezone TEXT;
    END IF;

    -- Add training_modes column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'training_modes') THEN
        ALTER TABLE trainer_profiles ADD COLUMN training_modes TEXT[];
    END IF;

    -- Add availability_schedule column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'availability_schedule') THEN
        ALTER TABLE trainer_profiles ADD COLUMN availability_schedule JSONB;
    END IF;

    -- Add completed column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'completed') THEN
        ALTER TABLE trainer_profiles ADD COLUMN completed BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add vector_ready column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'vector_ready') THEN
        ALTER TABLE trainer_profiles ADD COLUMN vector_ready BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add updated_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE trainer_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

END $$;

-- ========== PART 3: CREATE/UPDATED_AT TRIGGER ==========
-- Create or replace the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_trainer_profiles_updated_at ON trainer_profiles;
CREATE TRIGGER update_trainer_profiles_updated_at
    BEFORE UPDATE ON trainer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========== PART 4: VERIFICATION ==========
-- Verify column counts
SELECT 
    'trainer_profiles' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'trainer_profiles'
UNION ALL
SELECT 
    'trainer_questionnaire_responses',
    COUNT(*)
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'trainer_questionnaire_responses';

-- Verify RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('trainer_profiles', 'trainer_questionnaire_responses')
ORDER BY tablename, policyname;
