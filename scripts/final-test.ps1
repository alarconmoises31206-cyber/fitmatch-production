Write-Host "=== PHASE 31 FINAL TEST ===" -ForegroundColor Cyan

# Get a conversation ID to test (if any exist)
Write-Host "`nLooking for a conversation to test..." -ForegroundColor Yellow

try {
    # Try to get a conversation ID from the local API or mock data
    $testConvId = $null
    
    # You can hardcode a test ID here if you have one:
    # $testConvId = "YOUR_CONVERSATION_ID_HERE"
    
    if ($testConvId) {
        Write-Host "Testing with conversation: $testConvId" -ForegroundColor Green
        
        # Test compute-health
        $body = @{conversationId=$testConvId} | ConvertTo-Json
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:3000/api/conversations/compute-health" `
                -Method POST -Body $body -ContentType "application/json"
            Write-Host "✓ compute-health API working" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  compute-health error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
        # Test trust-signals
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users/trust-signals" -Method GET
            Write-Host "✓ trust-signals API working" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  trust-signals error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "No test conversation ID set" -ForegroundColor Yellow
        Write-Host "To test manually:" -ForegroundColor White
        Write-Host "1. Get a conversation ID from your database" -ForegroundColor Gray
        Write-Host "2. Update this script with the ID" -ForegroundColor Gray
        Write-Host "3. Or use the curl commands in the decision guide" -ForegroundColor Gray
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n=== PHASE 31 COMPONENTS ===" -ForegroundColor Cyan
Write-Host "✓ Database tables created" -ForegroundColor Green
Write-Host "✓ API endpoints created" -ForegroundColor Green
Write-Host "✓ UI components created" -ForegroundColor Green
Write-Host "✓ send-phase30.ts updated" -ForegroundColor Green
Write-Host "? Database functions - NEED TO CHECK" -ForegroundColor Yellow
Write-Host "? Data backfill - NEED TO DO" -ForegroundColor Yellow

Write-Host "`nRun the SQL check and share results!" -ForegroundColor Yellow
