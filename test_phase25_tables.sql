-- Test 1: Verify Phase 25 Tables Exist
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('trainer_profiles', 'trainer_questionnaire_responses')
GROUP BY table_name
ORDER BY table_name;
