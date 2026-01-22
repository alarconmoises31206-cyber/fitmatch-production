Write-Host "?? DIAGNOSTIC CHECK" -ForegroundColor Green
Write-Host "=" * 40

Write-Host "`nRun this SQL in Supabase to see what you have:" -ForegroundColor Cyan
Write-Host @"
-- Check existing data
SELECT 'client_profiles' as table, COUNT(*) as count FROM client_profiles
UNION ALL
SELECT 'trainer_profiles', COUNT(*) FROM trainer_profiles
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'conversation_nudges', COUNT(*) FROM conversation_nudges;
"@ -ForegroundColor Gray

Write-Host "`nBased on results:" -ForegroundColor Yellow
Write-Host "- If conversations > 0: You can use existing data" -ForegroundColor Gray
Write-Host "- If conversations = 0 but profiles > 0: Create conversation" -ForegroundColor Gray
Write-Host "- If profiles = 0: Need to create profiles first" -ForegroundColor Gray

Write-Host "`n?? QUICK FIX:" -ForegroundColor Green
Write-Host "Just tell me the counts from above and I'll give exact SQL." -ForegroundColor Gray
