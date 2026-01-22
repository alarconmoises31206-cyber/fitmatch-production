# Test Reengagement Service APIs
Write-Host "Testing Reengagement Service APIs..." -ForegroundColor Green

Write-Host "`n1. Testing stalled conversations API:" -ForegroundColor Cyan
try {
    $stalled = Invoke-RestMethod -Uri "http://localhost:3000/api/conversations/stalled?days=2" -Method Get
    $stalled | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Yellow
} catch { 
    Write-Host "Failed to get stalled conversations: $_" -ForegroundColor Red 
}

Write-Host "`n2. Getting real conversation for testing..." -ForegroundColor Cyan
try {
    # Try to get existing conversations
    $conversations = Invoke-RestMethod -Uri "http://localhost:3000/api/conversations" -Method Get -ErrorAction SilentlyContinue
    
    if ($conversations -and $conversations.data -and $conversations.data[0]) {
        $realConv = $conversations.data[0]
        $realConvId = $realConv.id
        Write-Host "Found real conversation ID: $realConvId" -ForegroundColor Green
        
        # Use a real user ID from your system
        $realUserId = "YOUR-REAL-USER-ID-HERE"  # Replace with actual user ID
        
        Write-Host "`n3. Creating test nudge for real conversation..." -ForegroundColor Cyan
        $createBody = @{
            conversationId = $realConvId
            userId = $realUserId
            userRole = "client"
            nudgeType = "reminder"
            message = "Test nudge from PowerShell"
        } | ConvertTo-Json
        
        $created = Invoke-RestMethod -Uri "http://localhost:3000/api/conversations/create-nudge" -Method Post -Body $createBody -ContentType "application/json"
        $created | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Yellow
        
        if ($created.data.id) {
            Write-Host "`n4. Checking nudge..." -ForegroundColor Cyan
            $check = Invoke-RestMethod -Uri "http://localhost:3000/api/conversations/nudge-check?conversationId=$realConvId&userId=$realUserId&userRole=client" -Method Get
            $check | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Yellow
            
            Write-Host "`n5. Dismissing nudge..." -ForegroundColor Cyan
            $dismissBody = @{nudgeId = $created.data.id} | ConvertTo-Json
            $dismissed = Invoke-RestMethod -Uri "http://localhost:3000/api/conversations/dismiss-nudge" -Method Post -Body $dismissBody -ContentType "application/json"
            $dismissed | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Yellow
            
            Write-Host "`n✅ All tests completed with real data!" -ForegroundColor Green
        }
    } else {
        Write-Host "No conversations found in database." -ForegroundColor Yellow
        Write-Host "You need to create a conversation first or use Option 2 below." -ForegroundColor Yellow
        
        # Show how to create a test conversation
        Write-Host "`nTo create a test conversation via SQL:" -ForegroundColor Cyan
        Write-Host @"
-- Run in Supabase SQL Editor:
INSERT INTO conversations (id, client_id, trainer_id, created_at) 
VALUES (
    gen_random_uuid(),
    'YOUR-CLIENT-ID-HERE',
    'YOUR-TRAINER-ID-HERE',
    NOW()
);
"@ -ForegroundColor Gray
    }
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
}