-- Test 2: Check RLS Policies
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
