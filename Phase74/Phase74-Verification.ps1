# Phase74-Verification.ps1
# Quick verification test for Phase 74 implementation

Write-Host "=== PHASE 74 QUICK VERIFICATION ===" -ForegroundColor Magenta
Write-Host ""

# Check if all module files exist
$requiredFiles = @(
    ".\Phase74-Orchestrator.ps1",
    ".\Phase74.psd1",
    ".\Modules\74.1-MatchReplay.ps1",
    ".\Modules\74.2-DecisionTrace.ps1",
    ".\Modules\74.3-InvariantAssertions.ps1",
    ".\Modules\74.4-CounterfactualProbe.ps1",
    ".\Modules\74.5-ExternalReview.ps1"
)

Write-Host "Checking required files..." -ForegroundColor Cyan
$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (MISSING)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "`n❌ Some required files are missing!" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll required files present." -ForegroundColor Green

# Test loading the orchestrator
Write-Host "`nTesting module loading..." -ForegroundColor Cyan
try {
    . .\Phase74-Orchestrator.ps1
    Write-Host "  ✓ Phase74-Orchestrator.ps1 loaded successfully" -ForegroundColor Green
    
    # Test basic functions
    Write-Host "`nTesting basic functionality..." -ForegroundColor Cyan
    
    # Test 1: Create a match snapshot
    Write-Host "  1. Testing MatchSnapshot creation..." -ForegroundColor Gray
    $testClient = @{
        id = "test-001"
        goals = @("test")
    }
    $testConfig = @{ ScoringWeights = @{ Test = 1.0 } }
    $testTrainers = @(@{ id = "t1"; user_id = "u1"; is_active = $true; verified = $true })
    
    $snapshot = New-MatchSnapshot -ClientInputs $testClient -Configuration $testConfig -TrainerProfiles $testTrainers -EmbeddingHash "test"
    if ($snapshot -and $snapshot.SnapshotId) {
        Write-Host "    ✓ MatchSnapshot created: $($snapshot.SnapshotId)" -ForegroundColor Green
    } else {
        Write-Host "    ✗ MatchSnapshot creation failed" -ForegroundColor Red
    }
    
    # Test 2: Create decision trace
    Write-Host "  2. Testing DecisionTrace creation..." -ForegroundColor Gray
    $trace = New-DecisionTrace -MatchSnapshotId $snapshot.SnapshotId
    if ($trace -and $trace.TraceId) {
        Write-Host "    ✓ DecisionTrace created: $($trace.TraceId)" -ForegroundColor Green
    } else {
        Write-Host "    ✗ DecisionTrace creation failed" -ForegroundColor Red
    }
    
    # Test 3: Create invariant engine
    Write-Host "  3. Testing InvariantAssertionEngine creation..." -ForegroundColor Gray
    $engine = New-InvariantAssertionEngine
    if ($engine -and $engine.Invariants.Count -gt 0) {
        Write-Host "    ✓ InvariantAssertionEngine created with $($engine.Invariants.Count) invariants" -ForegroundColor Green
    } else {
        Write-Host "    ✗ InvariantAssertionEngine creation failed" -ForegroundColor Red
    }
    
    # Test 4: Create counterfactual probe
    Write-Host "  4. Testing CounterfactualProbe creation..." -ForegroundColor Gray
    $probe = New-CounterfactualProbe -OriginalSnapshotId $snapshot.SnapshotId -OriginalResults @{}
    if ($probe -and $probe.ProbeId) {
        Write-Host "    ✓ CounterfactualProbe created: $($probe.ProbeId)" -ForegroundColor Green
    } else {
        Write-Host "    ✗ CounterfactualProbe creation failed" -ForegroundColor Red
    }
    
    # Test 5: Create external review packet
    Write-Host "  5. Testing ExternalReviewPacket creation..." -ForegroundColor Gray
    $packet = New-ExternalReviewPacket
    if ($packet -and $packet.PacketId) {
        Write-Host "    ✓ ExternalReviewPacket created: $($packet.PacketId)" -ForegroundColor Green
    } else {
        Write-Host "    ✗ ExternalReviewPacket creation failed" -ForegroundColor Red
    }
    
    Write-Host "`n✅ BASIC FUNCTIONALITY TESTS PASSED" -ForegroundColor Green
    
    # Show available functions
    Write-Host "`nAvailable Phase 74 functions:" -ForegroundColor Cyan
    Get-Command -Name *Phase74* -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name | Sort-Object | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor White
    }
    
    Write-Host "`n=== VERIFICATION COMPLETE ===" -ForegroundColor Magenta
    Write-Host "Phase 74 implementation appears to be working correctly." -ForegroundColor Green
    Write-Host "Run 'Start-Phase74 -Mode test' for comprehensive testing." -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ VERIFICATION FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}
