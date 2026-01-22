-- Check conversations table
SELECT COUNT(*) as total_conversations, 
       MIN(created_at) as oldest, 
       MAX(created_at) as newest 
FROM conversations;

-- Check messages table  
SELECT COUNT(*) as total_messages,
       MIN(created_at) as oldest_message,
       MAX(created_at) as newest_message
FROM messages;

-- Check conversation_nudges table
SELECT COUNT(*) as total_nudges,
       SUM(CASE WHEN dismissed THEN 1 ELSE 0 END) as dismissed_nudges
FROM conversation_nudges;

-- Sample data (first 3 rows)
SELECT 'conversations' as table_name, id, client_id, trainer_id, created_at 
FROM conversations 
ORDER BY created_at DESC 
LIMIT 3;