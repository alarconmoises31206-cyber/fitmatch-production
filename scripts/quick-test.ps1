Write-Host "=== PHASE 31 QUICK TEST ===" -ForegroundColor Cyan

# Test 1: Check if files exist
Write-Host "`n1. Checking component files..." -ForegroundColor Yellow
$files = @(
    "pages/api/conversations/compute-health.ts",
    "pages/api/users/trust-signals.ts",
    "src/components/Phase31/ConversationHeaderExtension.tsx",
    "src/components/Phase31/InboxHealthIndicator.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✓ $($file.Split('/')[-1])" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $($file.Split('/')[-1])" -ForegroundColor Red
    }
}

# Test 2: Check database status (based on your earlier results)
Write-Host "`n2. Database Status (from earlier):" -ForegroundColor Yellow
Write-Host "   ✓ conversation_health table exists" -ForegroundColor Green
Write-Host "   ✓ trust_signals table exists" -ForegroundColor Green
Write-Host "   ✓ RLS is enabled for both tables" -ForegroundColor Green
Write-Host "   ? Need to check if functions exist" -ForegroundColor Yellow

# Test 3: Check if server is running
Write-Host "`n3. Checking dev server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3
    Write-Host "   ✓ Server is running" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Server not running" -ForegroundColor Red
    Write-Host "     Run: npm run dev" -ForegroundColor White
}

Write-Host "`n=== NEXT ACTION ===" -ForegroundColor Cyan
Write-Host "Run this SQL in Supabase:" -ForegroundColor White
Write-Host "SELECT routine_name FROM information_schema.routines" -ForegroundColor Gray
Write-Host "WHERE routine_name IN ('compute_conversation_health', 'compute_user_trust_signals');" -ForegroundColor Gray
Write-Host "`nThen share the results!" -ForegroundColor Yellow
