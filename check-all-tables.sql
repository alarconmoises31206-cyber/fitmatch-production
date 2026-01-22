-- Check all related tables
SELECT 'auth.users' as table, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'client_profiles', COUNT(*) FROM client_profiles
UNION ALL
SELECT 'trainer_profiles', COUNT(*) FROM trainer_profiles
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'conversation_nudges', COUNT(*) FROM conversation_nudges;
