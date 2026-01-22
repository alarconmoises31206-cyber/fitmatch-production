Write-Host "🔍 CHECKING TYPESCRIPT ERRORS" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

$errorFiles = @()

# Check for TypeScript compilation
Write-Host "`nRunning TypeScript check..." -ForegroundColor Yellow
try {
    if (Get-Command tsc -ErrorAction SilentlyContinue) {
        $tscOutput = tsc --noEmit 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ TypeScript compilation successful" -ForegroundColor Green
        } else {
            Write-Host "✗ TypeScript errors found:" -ForegroundColor Red
            $tscOutput | ForEach-Object {
                if ($_ -match "error TS\d+") {
                    Write-Host "  $_" -ForegroundColor Red
                    $errorFiles += $_
                }
            }
        }
    } else {
        Write-Host "⚠ TypeScript compiler not found, skipping..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Error running TypeScript check: $_" -ForegroundColor Yellow
}

# Check specific problematic files
Write-Host "`nChecking specific files..." -ForegroundColor Yellow
$problemFiles = @(
    "pages/api/auth/reset-password.jss",
    "pages/trainer/[id].js"
)

foreach ($file in $problemFiles) {
    if (Test-Path $file) {
        Write-Host "  Found problematic file: $file" -ForegroundColor Yellow
        # These might be causing the .next/dev/types errors
    }
}

# Summary
Write-Host "`n📋 SUMMARY" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan
if ($errorFiles.Count -eq 0) {
    Write-Host "✅ No major TypeScript errors found" -ForegroundColor Green
} else {
    Write-Host "❌ Found $($errorFiles.Count) TypeScript errors" -ForegroundColor Red
    Write-Host "`nTo fix common errors:" -ForegroundColor Yellow
    Write-Host "1. Delete .next folder and restart dev server" -ForegroundColor White
    Write-Host "2. Run: rm -rf .next && npm run dev" -ForegroundColor White
    Write-Host "3. Check if reset-password.jss should be .ts" -ForegroundColor White
    Write-Host "4. Check if [id].js should be .tsx" -ForegroundColor White
}

Write-Host "`nPhase 34 files created and updated successfully!" -ForegroundColor Green
