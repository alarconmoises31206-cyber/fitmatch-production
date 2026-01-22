# phase75_master_execution.ps1
# Master execution script for Phase 75 - External Verification

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PHASE 75 MASTER EXECUTION WORKFLOW" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "External Verification (Non-Founder)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

function Show-Phase75Overview {
    Write-Host "OVERVIEW:" -ForegroundColor Yellow
    Write-Host "Phase 75 converts 'provable internally' → credible externally" -ForegroundColor White
    Write-Host "Goal: Independent reviewers reach same conclusions as founder" -ForegroundColor White
    Write-Host ""
    Write-Host "HARD CONSTRAINTS (LOCKED):" -ForegroundColor Red
    Write-Host "❌ No ranking changes" -ForegroundColor DarkRed
    Write-Host "❌ No weight changes" -ForegroundColor DarkRed
    Write-Host "❌ No language changes" -ForegroundColor DarkRed
    Write-Host "❌ No UI polish" -ForegroundColor DarkRed
    Write-Host "❌ No learning loops" -ForegroundColor DarkRed
    Write-Host "❌ No persuasion during review" -ForegroundColor DarkRed
    Write-Host ""
    Write-Host "Allowed:" -ForegroundColor Green
    Write-Host "✔ Observation" -ForegroundColor Green
    Write-Host "✔ Confusion logging" -ForegroundColor Green
    Write-Host "✔ Misinterpretation capture" -ForegroundColor Green
    Write-Host "✔ Trust delta measurement" -ForegroundColor Green
}

function Show-ExecutionSteps {
    Write-Host "`nEXECUTION STEPS:" -ForegroundColor Yellow
    Write-Host "1.  [DONE] Create reviewer profiles" -ForegroundColor Green
    Write-Host "2.  [DONE] Create blind review instructions" -ForegroundColor Green
    Write-Host "3.  [DONE] Create response template" -ForegroundColor Green
    Write-Host "4.  [DONE] Create analysis scripts" -ForegroundColor Green
    Write-Host "5.  [MANUAL] Select actual reviewers from profiles" -ForegroundColor Yellow
    Write-Host "6.  [MANUAL] Distribute materials to reviewers" -ForegroundColor Yellow
    Write-Host "7.  [MANUAL] Collect reviewer responses" -ForegroundColor Yellow
    Write-Host "8.  [AUTO] Run misalignment analysis" -ForegroundColor Cyan
    Write-Host "9.  [AUTO] Run trust delta scoring" -ForegroundColor Cyan
    Write-Host "10. [AUTO] Generate completion report" -ForegroundColor Cyan
    Write-Host "11. [DECISION] Proceed to Phase 76 or iterate" -ForegroundColor Magenta
}

function Invoke-Step5 {
    Write-Host "`n=== STEP 5: SELECT ACTUAL REVIEWERS ===" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "From reviewer_profiles.json, you need to select actual people:" -ForegroundColor White
    Write-Host ""
    
    # Load and display reviewer requirements
    if (Test-Path "reviewer_profiles.json") {
        $profiles = Get-Content -Path "reviewer_profiles.json" -Raw | ConvertFrom-Json
        $reviewers = $profiles.reviewers
        
        Write-Host "REQUIRED REVIEWER TYPES:" -ForegroundColor Cyan
        foreach ($reviewer in $reviewers) {
            Write-Host "  - $($reviewer.reviewer_id): $($reviewer.reviewer_type)" -ForegroundColor White
            Write-Host "    Criteria: $(Get-ReviewerCriteria $reviewer.reviewer_type)" -ForegroundColor Gray
        }
        
        Write-Host "`nACTION ITEMS:" -ForegroundColor Yellow
        Write-Host "1. Identify real people matching each profile" -ForegroundColor White
        Write-Host "2. Contact them for participation (20-30 min)" -ForegroundColor White
        Write-Host "3. Ensure they meet eligibility checks:" -ForegroundColor White
        Write-Host "   • Has not worked on FitMatch" -ForegroundColor Gray
        Write-Host "   • Has not received prior explanations" -ForegroundColor Gray
        Write-Host "   • Is not personally invested" -ForegroundColor Gray
        Write-Host "4. Schedule review sessions" -ForegroundColor White
        Write-Host ""
        Write-Host "Press any key when you have selected actual reviewers..." -ForegroundColor DarkYellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Host "ERROR: reviewer_profiles.json not found" -ForegroundColor Red
    }
}

function Get-ReviewerCriteria {
    param([string]$reviewerType)
    
    $criteria = @{
        "technical_skeptic" = "Engineer/data professional, skeptical of AI, detects fake intelligence"
        "domain_practitioner" = "Fitness/coaching professional, real-world intuition, safety-conscious"
        "critical_non_technical" = "Non-technical thinker, asks why, challenges authority"
    }
    
    return $criteria[$reviewerType]
}

function Invoke-Step6 {
    Write-Host "`n=== STEP 6: DISTRIBUTE MATERIALS ===" -ForegroundColor Yellow
    Write-Host ""
    
    $materials = @(
        @{ Name = "External Review Packet"; Source = "From Phase 74"; Note = "Pre-generated match artifacts" },
        @{ Name = "blind_review_instructions.txt"; Source = "Current directory"; Note = "Critical: give verbatim" },
        @{ Name = "reviewer_responses_template.json"; Source = "Current directory"; Note = "Each reviewer gets copy" }
    )
    
    Write-Host "MATERIALS TO DISTRIBUTE:" -ForegroundColor Cyan
    foreach ($material in $materials) {
        Write-Host "  • $($material.Name)" -ForegroundColor White
        Write-Host "    Source: $($material.Source)" -ForegroundColor Gray
        Write-Host "    Note: $($material.Note)" -ForegroundColor DarkGray
    }
    
    Write-Host "`nDISTRIBUTION RULES:" -ForegroundColor Red
    Write-Host "❌ DO NOT explain the system" -ForegroundColor DarkRed
    Write-Host "❌ DO NOT answer 'why' questions" -ForegroundColor DarkRed
    Write-Host "❌ DO NOT provide additional context" -ForegroundColor DarkRed
    Write-Host "✅ DO provide all materials at once" -ForegroundColor Green
    Write-Host "✅ DO emphasize independent review" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press any key when materials are distributed..." -ForegroundColor DarkYellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Invoke-Step7 {
    Write-Host "`n=== STEP 7: COLLECT RESPONSES ===" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "EXPECTED FILES FROM EACH REVIEWER:" -ForegroundColor Cyan
    Write-Host "1. Completed reviewer_responses_template.json" -ForegroundColor White
    Write-Host "   (Renamed to: reviewer_[ID]_responses.json)" -ForegroundColor Gray
    Write-Host "2. Any handwritten notes (scanned)" -ForegroundColor White
    Write-Host "3. blind_review_instructions.txt with margin notes" -ForegroundColor White
    
    Write-Host "`nCOLLECTION PROCESS:" -ForegroundColor White
    Write-Host "1. Receive files from each reviewer" -ForegroundColor Gray
    Write-Host "2. Combine into single reviewer_responses_raw.json" -ForegroundColor Gray
    Write-Host "3. Verify no modifications to responses" -ForegroundColor Gray
    Write-Host "4. Store original files for audit trail" -ForegroundColor Gray
    
    Write-Host "`nCOMBINATION SCRIPT (run after collection):" -ForegroundColor Yellow
    Write-Host 'Get-ChildItem -Filter "reviewer_*_responses.json" | ForEach-Object { $responses += (Get-Content $_ | ConvertFrom-Json) }' -ForegroundColor Cyan
    Write-Host '$responses | ConvertTo-Json -Depth 10 | Out-File reviewer_responses_raw.json' -ForegroundColor Cyan
    
    Write-Host "`nPress any key when responses are collected and combined..." -ForegroundColor DarkYellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Invoke-Step8 {
    Write-Host "`n=== STEP 8: RUN MISALIGNMENT ANALYSIS ===" -ForegroundColor Yellow
    Write-Host ""
    
    if (-not (Test-Path "reviewer_responses_raw.json")) {
        Write-Host "ERROR: reviewer_responses_raw.json not found" -ForegroundColor Red
        Write-Host "Please complete Step 7 first" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Executing misalignment analysis..." -ForegroundColor White
    
    # Import and run the analysis function
    . .\misalignment_analysis.ps1
    
    if (Get-Command -Name Analyze-ReviewerResponses -ErrorAction SilentlyContinue) {
        $result = Analyze-ReviewerResponses -ResponsesPath "reviewer_responses_raw.json" -OutputPath "external_misalignment_report.json"
        
        if ($result) {
            Write-Host "`nAnalysis complete! Key metrics:" -ForegroundColor Green
            Write-Host "• Total reviewers: $($result.total_reviewers)" -ForegroundColor White
            Write-Host "• Green classifications: $($result.classification_summary.green_reviewers)" -ForegroundColor Green
            Write-Host "• Red classifications: $($result.classification_summary.red_reviewers)" -ForegroundColor $(if ($result.classification_summary.red_reviewers -gt 0) { "Red" } else { "Green" })
            Write-Host "• Report saved: external_misalignment_report.json" -ForegroundColor Cyan
        }
    } else {
        Write-Host "ERROR: Analyze-ReviewerResponses function not found" -ForegroundColor Red
    }
}

function Invoke-Step9 {
    Write-Host "`n=== STEP 9: RUN TRUST DELTA SCORING ===" -ForegroundColor Yellow
    Write-Host ""
    
    if (-not (Test-Path "external_misalignment_report.json")) {
        Write-Host "ERROR: external_misalignment_report.json not found" -ForegroundColor Red
        Write-Host "Please complete Step 8 first" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Executing trust delta scoring..." -ForegroundColor White
    
    # Import and run the trust function
    . .\trust_delta_scoring.ps1
    
    if (Get-Command -Name Calculate-TrustDelta -ErrorAction SilentlyContinue) {
        $result = Calculate-TrustDelta -ResponsesPath "reviewer_responses_raw.json" -MisalignmentReportPath "external_misalignment_report.json" -OutputPath "trust_delta_summary.json"
        
        if ($result) {
            Write-Host "`nScoring complete! Phase 75 status:" -ForegroundColor Green
            $passed = $result.phase_75_success_evaluation.phase_passed
            Write-Host "• PHASE 75 PASSED: $passed" -ForegroundColor $(if ($passed) { "Green" } else { "Red" })
            Write-Host "• Summary saved: trust_delta_summary.json" -ForegroundColor Cyan
        }
    } else {
        Write-Host "ERROR: Calculate-TrustDelta function not found" -ForegroundColor Red
    }
}

function Invoke-Step10 {
    Write-Host "`n=== STEP 10: GENERATE COMPLETION REPORT ===" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Generating Phase 75 completion report..." -ForegroundColor White
    
    . .\phase75_completion_report.ps1
    
    if (Get-Command -Name Generate-Phase75Report -ErrorAction SilentlyContinue) {
        $report = Generate-Phase75Report
        
        if ($report) {
            Write-Host "`nCompletion report generated!" -ForegroundColor Green
            Write-Host "File: phase75_completion_report.json" -ForegroundColor Cyan
            
            # Show quick summary
            $passed = $report.results.phase_passed
            if ($passed -ne $null) {
                Write-Host "`nFINAL VERDICT: Phase 75 $(if ($passed) { 'PASSED' } else { 'FAILED' })" -ForegroundColor $(if ($passed) { "Green" } else { "Red" })
            }
        }
    }
}

function Show-NextSteps {
    Write-Host "`n=== STEP 11: NEXT STEPS ===" -ForegroundColor Magenta
    Write-Host ""
    
    if (Test-Path "trust_delta_summary.json") {
        $trustData = Get-Content -Path "trust_delta_summary.json" -Raw | ConvertFrom-Json
        $passed = $trustData.phase_75_success_evaluation.phase_passed
        
        if ($passed) {
            Write-Host "🎉 PHASE 75 PASSED SUCCESSFULLY!" -ForegroundColor Green -BackgroundColor DarkGreen
            Write-Host ""
            Write-Host "You have unlocked:" -ForegroundColor Yellow
            Write-Host "• Phase 76 — Steel Team Confirmation" -ForegroundColor White
            Write-Host "• Phase 77 — Minimal UI Exposure" -ForegroundColor White
            Write-Host "• Phase 78 — Pilot Users" -ForegroundColor White
            Write-Host "• Phase 79 — Traction Experiments" -ForegroundColor White
            Write-Host "• Phase 80+ — Valuation Reality" -ForegroundColor White
            Write-Host ""
            Write-Host "RECOMMENDATION: Proceed to Phase 76 immediately" -ForegroundColor Cyan
            Write-Host "You are officially past the 'internal system' stage." -ForegroundColor White
        } else {
            Write-Host "⚠️ PHASE 75 FAILED" -ForegroundColor Red -BackgroundColor DarkRed
            Write-Host ""
            Write-Host "Failed criteria:" -ForegroundColor Yellow
            $checks = $trustData.phase_75_success_evaluation
            if (-not $checks.no_red_classifications) { Write-Host "• Has 🔴 classifications" -ForegroundColor Red }
            if (-not $checks.green_threshold_met) { Write-Host "• Green percentage < 70%" -ForegroundColor Yellow }
            if (-not $checks.trust_improved_all) { Write-Host "• Trust declined for some reviewers" -ForegroundColor Red }
            if (-not $checks.gold_phrase_exists) { Write-Host "• Gold phrase not found" -ForegroundColor Yellow }
            Write-Host ""
            Write-Host "RECOMMENDATION:" -ForegroundColor Cyan
            Write-Host "1. Review external_misalignment_report.json" -ForegroundColor White
            Write-Host "2. Consider adding more reviewers" -ForegroundColor White
            Write-Host "3. Iterate on Phase 75 (but DO NOT change system)" -ForegroundColor White
            Write-Host "4. Retry until all criteria pass" -ForegroundColor White
        }
    } else {
        Write-Host "Status unknown - complete all steps first" -ForegroundColor Yellow
    }
}

# Main execution flow
Clear-Host
Show-Phase75Overview
Show-ExecutionSteps

Write-Host "`nReady to execute Phase 75?" -ForegroundColor Yellow
$choice = Read-Host "Enter 'Y' to proceed or 'N' to exit"

if ($choice -eq 'Y') {
    # Execute steps in sequence
    Invoke-Step5
    Invoke-Step6
    Invoke-Step7
    Invoke-Step8
    Invoke-Step9
    Invoke-Step10
    Show-NextSteps
} else {
    Write-Host "Execution cancelled." -ForegroundColor Yellow
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "PHASE 75 MASTER EXECUTION COMPLETE" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "=========================================" -ForegroundColor Cyan
