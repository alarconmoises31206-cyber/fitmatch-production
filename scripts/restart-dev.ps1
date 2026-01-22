# Restart Dev Server Script
Write-Host "🔄 Restarting Development Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Stop any running Next.js process
Write-Host "`n1. Stopping existing dev server..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -match "next" } | 
    Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# Clear cache
Write-Host "`n2. Clearing cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ Cleared .next cache" -ForegroundColor Green
}

# Install dependencies if needed
Write-Host "`n3. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✓ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Running npm install..." -ForegroundColor Yellow
    npm install
}

# Start dev server
Write-Host "`n4. Starting dev server..." -ForegroundColor Yellow
Write-Host "   Starting: npm run dev" -ForegroundColor White
Write-Host "   This will run in the background..." -ForegroundColor Gray

# Start in background
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

Write-Host "`n✅ Dev server restart initiated!" -ForegroundColor Green
Write-Host "   Check http://localhost:3000 in a few seconds" -ForegroundColor Yellow
Write-Host "   To stop: Get-Job | Stop-Job | Remove-Job" -ForegroundColor Gray
