# Start dev server script
Write-Host "Starting Next.js dev server..." -ForegroundColor Green
Write-Host "If successful, open:" -ForegroundColor Yellow
Write-Host "1. http://localhost:3000/minimal-test" -ForegroundColor White
Write-Host "2. http://localhost:3000/test-phase29" -ForegroundColor White
Write-Host "3. http://localhost:3000/matches" -ForegroundColor White
Write-Host ""
Write-Host "Note: First startup may take a moment." -ForegroundColor Cyan

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules missing. Run: npm install" -ForegroundColor Red
    exit 1
}

# Start dev server
try {
    npm run dev
} catch {
    Write-Host "❌ Failed to start dev server" -ForegroundColor Red
    Write-Host "Try running: npm run dev" -ForegroundColor Yellow
}
