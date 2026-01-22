Write-Host "?? FINAL TEST" -ForegroundColor Green
Write-Host "=" * 40 -ForegroundColor Gray

# Test 1: Stalled conversations with real data
Write-Host "`n1. Testing stalled conversations (threshold: 2 days)..." -ForegroundColor Cyan
try {
    $stalled = Invoke-RestMethod -Uri "http://localhost:3000/api/conversations/stalled?days=2" -Method Get
    Write-Host "? Found $($stalled.data.count) stalled conversations" -ForegroundColor Green
    if ($stalled.data.count -gt 0) {
        $stalled.data.conversations | ForEach-Object {
            Write-Host "   - $($_.conversation_id)" -ForegroundColor Gray
        }
    }
} catch { Write-Host "? Error: $_" -ForegroundColor Red }

# Test 2: Create a nudge (you'll need to get a real conversation ID from the test data)
Write-Host "`n2. To test nudge creation:" -ForegroundColor Cyan
Write-Host "   Get a conversation ID from your test data, then run:" -ForegroundColor Gray
Write-Host '   $testNudge = @{' -ForegroundColor Gray
Write-Host '       conversationId = "22222222-2222-2222-2222-222222222222"' -ForegroundColor Gray
Write-Host '       userId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"' -ForegroundColor Gray
Write-Host '       userRole = "client"' -ForegroundColor Gray
Write-Host '       nudgeType = "test"' -ForegroundColor Gray
Write-Host '       message = "API test nudge"' -ForegroundColor Gray
Write-Host '   } | ConvertTo-Json' -ForegroundColor Gray
Write-Host '   Invoke-RestMethod -Uri "http://localhost:3000/api/conversations/create-nudge" -Method Post -Body $testNudge -ContentType "application/json"' -ForegroundColor Gray

Write-Host "`n" + "=" * 40 -ForegroundColor Gray
Write-Host "?? After creating test data, you should see:" -ForegroundColor Green
Write-Host "- 3 conversations in the database" -ForegroundColor Gray
Write-Host "- 6 messages" -ForegroundColor Gray
Write-Host "- 2 nudges (1 active, 1 dismissed)" -ForegroundColor Gray
Write-Host "- Stalled endpoint should return 2 stalled conversations" -ForegroundColor Gray
