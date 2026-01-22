-- Migration: Fix Phase 25 Table Structure & RLS Policies
-- Created: 2025-12-11
-- Purpose: Add missing columns and fix RLS policies

-- 1. Add missing columns to trainer_profiles
DO $$ 
BEGIN
    -- Check and add bio column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'bio') THEN
        ALTER TABLE trainer_profiles ADD COLUMN bio TEXT;
    END IF;

    -- Check and add philosophy column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'philosophy') THEN
        ALTER TABLE trainer_profiles ADD COLUMN philosophy TEXT;
    END IF;

    -- Check and add communication_style column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'communication_style') THEN
        ALTER TABLE trainer_profiles ADD COLUMN communication_style TEXT;
    END IF;

    -- Check and add lived_experience column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'lived_experience') THEN
        ALTER TABLE trainer_profiles ADD COLUMN lived_experience TEXT;
    END IF;

    -- Check and add specialties column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'specialties') THEN
        ALTER TABLE trainer_profiles ADD COLUMN specialties TEXT[];
    END IF;

    -- Check and add timezone column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'timezone') THEN
        ALTER TABLE trainer_profiles ADD COLUMN timezone TEXT;
    END IF;

    -- Check and add training_modes column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'training_modes') THEN
        ALTER TABLE trainer_profiles ADD COLUMN training_modes TEXT[];
    END IF;

    -- Check and add availability_schedule column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'availability_schedule') THEN
        ALTER TABLE trainer_profiles ADD COLUMN availability_schedule JSONB;
    END IF;

    -- Check and add completed column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'completed') THEN
        ALTER TABLE trainer_profiles ADD COLUMN completed BOOLEAN DEFAULT FALSE;
    END IF;

    -- Check and add vector_ready column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'vector_ready') THEN
        ALTER TABLE trainer_profiles ADD COLUMN vector_ready BOOLEAN DEFAULT FALSE;
    END IF;

    -- Check and add updated_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainer_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE trainer_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

END $$;

-- 2. Drop incorrect RLS policies
DROP POLICY IF EXISTS "Anyone can view trainer profiles" ON trainer_profiles;
DROP POLICY IF EXISTS "Trainers can manage own profile" ON trainer_profiles;

-- Also drop any policies on questionnaire_responses that might be wrong
DROP POLICY IF EXISTS "Users can manage own questionnaire responses" ON trainer_questionnaire_responses;

-- 3. Create correct RLS policies
-- For trainer_profiles
CREATE POLICY "Users can manage own trainer profile"
    ON trainer_profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- For trainer_questionnaire_responses  
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

-- 4. Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_trainer_profiles_updated_at ON trainer_profiles;
CREATE TRIGGER update_trainer_profiles_updated_at
    BEFORE UPDATE ON trainer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Verify the fix
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
