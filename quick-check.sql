-- SIMPLE DATABASE CHECK
-- 1. Check if tables exist and have data
SELECT 
    'conversations' as table_name,
    (SELECT COUNT(*) FROM conversations) as row_count,
    (SELECT COUNT(*) > 0 FROM conversations) as has_data
UNION ALL
SELECT 
    'messages',
    (SELECT COUNT(*) FROM messages),
    (SELECT COUNT(*) > 0 FROM messages)
UNION ALL
SELECT 
    'conversation_nudges',
    (SELECT COUNT(*) FROM conversation_nudges),
    (SELECT COUNT(*) > 0 FROM conversation_nudges);

-- 2. Get sample user IDs if you need them
SELECT 'user_ids' as info, id, email FROM auth.users LIMIT 3;
