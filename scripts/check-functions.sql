-- Check if Phase 31 functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('compute_conversation_health', 'compute_user_trust_signals')
ORDER BY routine_name;

-- Check if there's any data in the tables
SELECT 'conversation_health' as table_name, COUNT(*) as row_count FROM conversation_health
UNION ALL
SELECT 'trust_signals' as table_name, COUNT(*) as row_count FROM trust_signals;

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('conversation_health', 'trust_signals');
