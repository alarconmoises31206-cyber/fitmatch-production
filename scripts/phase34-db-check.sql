-- scripts/phase34-db-check.sql
-- Check Phase 34 database setup

-- 1. Check if tables exist
SELECT 
    table_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = table_name) as exists
FROM (VALUES 
    ('conversation_nudges'),
    ('stalled_conversations')
) AS required_tables(table_name);

-- 2. Check stalled_conversations view data
SELECT 
    COUNT(*) as total_stalled,
    AVG(days_since_last_message) as avg_days_stalled,
    MIN(days_since_last_message) as min_days_stalled,
    MAX(days_since_last_message) as max_days_stalled
FROM stalled_conversations;

-- 3. Check opt-out columns
SELECT 
    'clients' as table_name,
    COUNT(*) as rows_with_opt_out
FROM clients 
WHERE reengagement_opt_out = TRUE
UNION ALL
SELECT 
    'trainers' as table_name,
    COUNT(*) as rows_with_opt_out
FROM trainers 
WHERE reengagement_opt_out = TRUE;

-- 4. Sample stalled conversations
SELECT 
    conversation_id,
    client_id,
    trainer_id,
    ROUND(days_since_last_message, 2) as days_stalled,
    message_count,
    last_message_at
FROM stalled_conversations
ORDER BY days_since_last_message DESC
LIMIT 5;

-- 5. Recent nudges
SELECT 
    cn.id,
    cn.conversation_id,
    cn.user_role,
    cn.nudge_type,
    cn.dismissed,
    cn.created_at
FROM conversation_nudges cn
ORDER BY cn.created_at DESC
LIMIT 5;
