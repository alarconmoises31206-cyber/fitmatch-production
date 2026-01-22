# PHASE 73 COMPLETION SCRIPT
# To be run after founder provides verdicts

param(
    [ValidateSet("Baseline", "MajorShift", "BoundaryTest")]
    [string]$Scenario,
    [ValidateSet("Aligned", "Partial", "Misaligned")]
    [string]$Verdict,
    [string]$Notes = ""
)

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "PHASE 73 - UPDATING FOUNDER VERDICT" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Map verdict to symbols
$verdictSymbol = @{
    "Aligned" = "✅"
    "Partial" = "⚠️" 
    "Misaligned" = "❌"
}[$Verdict]

Write-Host "`n📝 Recording founder verdict:" -ForegroundColor Cyan
Write-Host "   Scenario: $Scenario" -ForegroundColor White
Write-Host "   Verdict: $verdictSymbol $Verdict" -ForegroundColor $(if ($Verdict -eq "Aligned") { "Green" } elseif ($Verdict -eq "Partial") { "Yellow" } else { "Red" })
if ($Notes) {
    Write-Host "   Notes: $Notes" -ForegroundColor Gray
}

# Update the log file
$logPath = ".\Phase73-Founder-Playtesting\phase73_intuition_log.md"
$logContent = Get-Content $logPath -Raw

# Find and update the appropriate row based on scenario
$scenarioPatterns = @{
    "Baseline" = "Baseline: Weight loss client, evening availability"
    "MajorShift" = "Changed to strength training, intermediate level, direct feedback" 
    "BoundaryTest" = "Changed availability to mornings"
}

$pattern = $scenarioPatterns[$Scenario]
if ($pattern) {
    # Create the updated row
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $updatedRow = "| $timestamp | $pattern | (see above) | (see above) | $verdictSymbol | Founder verdict: $Verdict$(if($Notes){' - ' + $Notes}) |"
    
    # Replace the row
    $logContent = $logContent -replace "\|.*$pattern.*\|.*\|.*\|.*\|.*\|.*\|", $updatedRow
    
    # Save updated log
    $logContent | Out-File -FilePath $logPath -Encoding UTF8 -Force
    Write-Host "   ✓ Log updated successfully" -ForegroundColor Green
} else {
    Write-Host "   ✗ Scenario pattern not found" -ForegroundColor Red
}

Write-Host "`n🔍 Checking Phase 73 completion status..." -ForegroundColor Cyan

# Count verdicts in log
$logLines = Get-Content $logPath
$alignedCount = ($logLines | Select-String "✅" | Measure-Object).Count
$partialCount = ($logLines | Select-String "⚠️" | Measure-Object).Count
$misalignedCount = ($logLines | Select-String "❌" | Measure-Object).Count
$pendingCount = ($logLines | Select-String "⚪" | Measure-Object).Count

Write-Host "   Current verdicts:" -ForegroundColor White
Write-Host "   ✅ Aligned: $alignedCount" -ForegroundColor Green
Write-Host "   ⚠️  Partial: $partialCount" -ForegroundColor Yellow
Write-Host "   ❌ Misaligned: $misalignedCount" -ForegroundColor Red
Write-Host "   ⚪ Pending: $pendingCount" -ForegroundColor Gray

Write-Host "`n🚦 Phase 73 completion criteria:" -ForegroundColor Magenta
if ($pendingCount -eq 0) {
    if ($misalignedCount -eq 0) {
        Write-Host "   ✅ READY FOR COMPLETION" -ForegroundColor Green
        Write-Host "   Founder has provided all verdicts" -ForegroundColor Gray
        Write-Host "   No logic defects identified" -ForegroundColor Gray
        Write-Host "   Proceed to Phase 74 preparation" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  LOGIC DEFECTS DETECTED" -ForegroundColor Red
        Write-Host "   Founder identified misaligned behavior" -ForegroundColor Gray
        Write-Host "   Requires surgical fix per Phase 73 rules" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⏳ AWAITING FOUNDER VERDICTS" -ForegroundColor Yellow
    Write-Host "   $pendingCount scenarios pending review" -ForegroundColor Gray
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "PHASE 73 VERDICT RECORDED" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
