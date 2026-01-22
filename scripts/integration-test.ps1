# Phase 31 Integration Test Script
Write-Host "🧪 Phase 31 Integration Testing" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Test 1: Check API endpoints are accessible
Write-Host "`n🔍 Testing API Endpoints..." -ForegroundColor Yellow

$endpoints = @(
    @{Url = "http://localhost:3000/api/conversations/compute-health"; Method = "POST"},
    @{Url = "http://localhost:3000/api/users/trust-signals"; Method = "GET"}
)

foreach ($endpoint in $endpoints) {
    try {
        if ($endpoint.Method -eq "POST") {
            $testBody = @{ conversationId = "test-id" } | ConvertTo-Json
            $response = Invoke-RestMethod -Uri $endpoint.Url -Method POST -Body $testBody -ContentType "application/json" -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $endpoint.Url -Method GET -ErrorAction Stop
        }
        Write-Host "  ✅ $($endpoint.Method) $($endpoint.Url)" -ForegroundColor Green
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 400 -or $statusCode -eq 405) {
            Write-Host "  ✅ $($endpoint.Method) $($endpoint.Url) (Endpoint exists)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($endpoint.Method) $($endpoint.Url) - Error: $statusCode" -ForegroundColor Red
        }
    }
}

# Test 2: Check UI components exist
Write-Host "`n🎨 Checking UI Components..." -ForegroundColor Yellow

$components = @(
    "src/components/Phase31/ConversationHeaderExtension.tsx",
    "src/components/Phase31/InboxHealthIndicator.tsx",
    "src/components/Phase31/PrivateTrustSignals.tsx",
    "src/components/Phase31/StalledConversationAssist.tsx"
)

foreach ($component in $components) {
    if (Test-Path $component) {
        Write-Host "  ✅ $component" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $component (MISSING)" -ForegroundColor Red
    }
}

# Test 3: Verify send-phase30.ts was updated
Write-Host "`n🔄 Checking send-phase30.ts update..." -ForegroundColor Yellow
$sendPhase30Path = "pages/api/messages/send-phase30.ts"
if (Test-Path $sendPhase30Path) {
    $content = Get-Content $sendPhase30Path -Raw
    if ($content -match "compute-health") {
        Write-Host "  ✅ send-phase30.ts includes health computation" -ForegroundColor Green
    } else {
        Write-Host "  ❌ send-phase30.ts missing health computation" -ForegroundColor Red
        Write-Host "     See PATCH_send-phase30.txt for instructions" -ForegroundColor Yellow
    }
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run the safe migration script in Supabase" -ForegroundColor White
Write-Host "2. Backfill existing conversations" -ForegroundColor White
Write-Host "3. Test the updated send-phase30.ts endpoint" -ForegroundColor White
Write-Host "4. Integrate UI components into existing pages" -ForegroundColor White

Write-Host "`n✅ Integration test complete!" -ForegroundColor Green
