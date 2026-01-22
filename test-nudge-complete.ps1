Write-Host "🚀 COMPLETE NUDGE SYSTEM TEST" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray

# Step 1: Check API endpoints
Write-Host "`n1️⃣ Checking API Endpoints..." -ForegroundColor Cyan
$endpoints = @(
    @{Name="Stalled Conversations"; URL="/api/conversations/stalled?days=2"; Method="GET"},
    @{Name="Create Nudge"; URL="/api/conversations/create-nudge"; Method="POST"},
    @{Name="Dismiss Nudge"; URL="/api/conversations/dismiss-nudge"; Method="POST"},
    @{Name="Nudge Check"; URL="/api/conversations/nudge-check?conversationId=test&userId=test&userRole=client"; Method="GET"}
)

foreach ($endpoint in $endpoints) {
    try {
        $test = Invoke-WebRequest -Uri "http://localhost:3000$($endpoint.URL)" -Method $endpoint.Method -ErrorAction SilentlyContinue
        Write-Host "   ✅ $($endpoint.Name)" -ForegroundColor Green
    } catch [System.Net.WebException] {
        if ($_.Exception.Response.StatusCode -eq 405) {
            Write-Host "   ✅ $($endpoint.Name) (exists, wrong method)" -ForegroundColor Green
        } elseif ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "   ✅ $($endpoint.Name) (exists, bad request)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $($endpoint.Name) ($($_.Exception.Response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❓ $($endpoint.Name) (error)" -ForegroundColor Yellow
    }
}

# Step 2: Test with real data if available
Write-Host "`n2️⃣ Testing with sample data..." -ForegroundColor Cyan
Write-Host "   First, get real data from your database:" -ForegroundColor Gray
Write-Host "   Run in Supabase:" -ForegroundColor Yellow
Write-Host @"
-- Get a real conversation ID:
SELECT id, client_id, trainer_id, created_at 
FROM conversations 
LIMIT 1;

-- Get a real user ID:
SELECT id, email 
FROM auth.users 
LIMIT 1;
"@ -ForegroundColor Gray

Write-Host "`n3️⃣ Once you have real IDs:" -ForegroundColor Cyan
Write-Host "   Update and run this test:" -ForegroundColor Gray
Write-Host '   $realTest = @{' -ForegroundColor Gray
Write-Host '       conversationId = "REAL_CONVERSATION_ID_HERE"' -ForegroundColor Gray
Write-Host '       userId = "REAL_USER_ID_HERE"' -ForegroundColor Gray
Write-Host '       userRole = "client"' -ForegroundColor Gray
Write-Host '       nudgeType = "reminder"' -ForegroundColor Gray
Write-Host '       message = "Test via PowerShell"' -ForegroundColor Gray
Write-Host '   } | ConvertTo-Json' -ForegroundColor Gray
Write-Host '   ' -ForegroundColor Gray
Write-Host '   try {' -ForegroundColor Gray
Write-Host '       $result = Invoke-RestMethod -Uri "http://localhost:3000/api/conversations/create-nudge" -Method Post -Body $realTest -ContentType "application/json"' -ForegroundColor Gray
Write-Host '       Write-Host "✅ Nudge created: $($result.data.id)" -ForegroundColor Green' -ForegroundColor Gray
Write-Host '   } catch {' -ForegroundColor Gray
Write-Host '       Write-Host "❌ Error: $_" -ForegroundColor Red' -ForegroundColor Gray
Write-Host '   }' -ForegroundColor Gray

Write-Host "`n" + "=" * 50 -ForegroundColor Gray
Write-Host "📊 CURRENT STATUS:" -ForegroundColor Green
Write-Host "- API endpoints: Checked above" -ForegroundColor Gray
Write-Host "- Database: Need to check with SQL" -ForegroundColor Gray
Write-Host "- Test data: May need to be created" -ForegroundColor Gray