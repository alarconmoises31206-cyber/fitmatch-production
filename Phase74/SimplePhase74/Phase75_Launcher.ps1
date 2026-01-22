# Phase75_Launcher.ps1
# Safe launcher for Phase 75 execution

Write-Host "=== PHASE 75 SAFE LAUNCHER ===" -ForegroundColor Cyan
Write-Host ""

# List available Phase 75 files
$phase75Files = Get-ChildItem -File | Where-Object { 
    $_.Name -match "phase75|reviewer|blind|misalignment|trust" 
}

if ($phase75Files.Count -eq 0) {
    Write-Host "No Phase 75 files found in current directory." -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found $($phase75Files.Count) Phase 75 files:" -ForegroundColor Green
foreach ($file in $phase75Files) {
    Write-Host "  • $($file.Name)" -ForegroundColor White
}

Write-Host ""
Write-Host "RECOMMENDED EXECUTION ORDER:" -ForegroundColor Yellow
Write-Host "1. .\reviewer_profiles_generator.ps1 (creates reviewer profiles)" -ForegroundColor White
Write-Host "2. Select actual reviewers from profiles (MANUAL - 2-3 days)" -ForegroundColor White
Write-Host "3. Distribute Phase 74 artifacts + blind instructions" -ForegroundColor White
Write-Host "4. Wait 3-7 days for independent reviews" -ForegroundColor White
Write-Host "5. Collect responses into reviewer_responses_raw.json" -ForegroundColor White
Write-Host "6. .\misalignment_analysis.ps1 (analyzes understanding)" -ForegroundColor White
Write-Host "7. .\trust_delta_scoring.ps1 (calculates trust metrics)" -ForegroundColor White
Write-Host "8. .\phase75_completion_report.ps1 (generates final report)" -ForegroundColor White

Write-Host ""
Write-Host "Do you have Phase 74 External Review Packet ready?" -ForegroundColor Cyan
$ready = Read-Host "(y/N)"

if ($ready -ne 'y') {
    Write-Host "Cannot proceed without Phase 74 artifacts." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Ready to begin Phase 75?" -ForegroundColor Yellow
Write-Host "This is a 2-week verification process." -ForegroundColor White
Write-Host ""
Write-Host "Key constraints:" -ForegroundColor Red
Write-Host "• NO system explanations to reviewers" -ForegroundColor DarkRed
Write-Host "• NO answering 'why' questions" -ForegroundColor DarkRed
Write-Host "• Measurement only, no changes to system" -ForegroundColor DarkRed

$begin = Read-Host "`nBegin Phase 75 execution? (y/N)"
if ($begin -ne 'y') {
    Write-Host "Execution pending. Run when ready." -ForegroundColor Yellow
    exit 0
}

# Execute step by step
Write-Host ""
Write-Host "Starting Phase 75 execution..." -ForegroundColor Green

try {
    # Step 1: Generate profiles if needed
    if (Test-Path "reviewer_profiles_generator.ps1" -and -not (Test-Path "reviewer_profiles.json")) {
        Write-Host "Step 1: Generating reviewer profiles..." -ForegroundColor Yellow
        .\reviewer_profiles_generator.ps1
    }
    
    Write-Host ""
    Write-Host "=== MANUAL STEPS REQUIRED ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Select 3-5 actual reviewers from reviewer_profiles.json" -ForegroundColor White
    Write-Host "2. Distribute Phase 74 artifacts + blind_review_instructions.txt" -ForegroundColor White
    Write-Host "3. Wait 3-7 days for independent review" -ForegroundColor White
    Write-Host "4. Collect responses into reviewer_responses_raw.json" -ForegroundColor White
    Write-Host ""
    Write-Host "After completing manual steps, run:" -ForegroundColor Yellow
    Write-Host "  .\misalignment_analysis.ps1" -ForegroundColor Cyan
    Write-Host "  .\trust_delta_scoring.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Phase 75 execution framework ready." -ForegroundColor Green
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
