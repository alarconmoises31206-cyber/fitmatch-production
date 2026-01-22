Write-Host "🧪 Testing Nudge System" -ForegroundColor Green

# Just test what we know works
Write-Host "`nTesting stalled endpoint..." -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/conversations/stalled?days=7" -Method Get
    Write-Host "✅ Stalled endpoint works!" -ForegroundColor Green
    Write-Host "   Found $($result.data.count) stalled conversations" -ForegroundColor Gray
} catch {
    Write-Host "❌ Stalled endpoint failed: $_" -ForegroundColor Red
}

Write-Host "`nTo test further:" -ForegroundColor Yellow
Write-Host "1. Check for existing conversations in Supabase" -ForegroundColor Gray
Write-Host "2. Use a real conversation ID in your tests" -ForegroundColor Gray
Write-Host "`nQuick check: SELECT id FROM conversations LIMIT 1;" -ForegroundColor Cyan