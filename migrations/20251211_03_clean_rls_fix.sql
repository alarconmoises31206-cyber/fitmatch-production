-- Clean RLS Fix for Phase 25
-- Drops all existing policies and creates correct ones

-- 1. Drop ALL existing policies on both tables
DROP POLICY IF EXISTS "Anyone can view trainer profiles" ON trainer_profiles;
DROP POLICY IF EXISTS "Trainers can manage own profile" ON trainer_profiles;
DROP POLICY IF EXISTS "Users can manage own trainer profile" ON trainer_profiles;
DROP POLICY IF EXISTS "Users can manage own questionnaire responses" ON trainer_questionnaire_responses;

-- 2. Enable RLS (in case it was disabled)
ALTER TABLE trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- 3. Create correct policies for trainer_profiles
CREATE POLICY "Users can manage own trainer profile"
    ON trainer_profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Create correct policies for trainer_questionnaire_responses
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

-- 5. Verify the fix
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
