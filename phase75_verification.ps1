# phase75_verification.ps1
# Final verification of Phase 75 setup

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PHASE 75 SETUP VERIFICATION" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "Pre-flight checklist before execution" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

function Test-Phase75Setup {
    $results = @()
    $allPassed = $true
    
    Write-Host "CHECKING REQUIRED FILES..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check 1: Required files exist
    $requiredFiles = @(
        @{ Name = "reviewer_profiles.json"; Description = "Reviewer selection protocol (75.1)"; Critical = $true },
        @{ Name = "blind_review_instructions.txt"; Description = "Blind review setup (75.2)"; Critical = $true },
        @{ Name = "reviewer_responses_template.json"; Description = "Response template (75.3)"; Critical = $true },
        @{ Name = "misalignment_analysis.ps1"; Description = "Analysis script (75.4)"; Critical = $true },
        @{ Name = "trust_delta_scoring.ps1"; Description = "Trust scoring script (75.5)"; Critical = $true },
        @{ Name = "phase75_completion_report.ps1"; Description = "Completion report generator"; Critical = $false },
        @{ Name = "phase75_master_execution.ps1"; Description = "Master execution workflow"; Critical = $false }
    )
    
    foreach ($file in $requiredFiles) {
        $exists = Test-Path $file.Name
        $status = if ($exists) { "✓" } else { "✗" }
        $color = if ($exists) { "Green" } else { "Red" }
        
        if (-not $exists -and $file.Critical) {
            $allPassed = $false
        }
        
        Write-Host "  $status $($file.Name)" -ForegroundColor $color
        Write-Host "    $($file.Description)" -ForegroundColor Gray
        
        $results += @{
            File = $file.Name
            Exists = $exists
            Critical = $file.Critical
            Description = $file.Description
        }
    }
    
    Write-Host ""
    Write-Host "CHECKING FILE CONTENTS..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check 2: reviewer_profiles.json structure
    if (Test-Path "reviewer_profiles.json") {
        try {
            $profiles = Get-Content -Path "reviewer_profiles.json" -Raw | ConvertFrom-Json
            $reviewerCount = $profiles.reviewers.Count
            $reviewerTypes = $profiles.reviewers.reviewer_type
            
            Write-Host "  ✓ reviewer_profiles.json structure valid" -ForegroundColor Green
            Write-Host "    Reviewers: $reviewerCount" -ForegroundColor Gray
            Write-Host "    Types: $($reviewerTypes -join ', ')" -ForegroundColor Gray
            
            # Check for required reviewer types
            $requiredTypes = @("technical_skeptic", "domain_practitioner", "critical_non_technical")
            $missingTypes = $requiredTypes | Where-Object { $_ -notin $reviewerTypes }
            
            if ($missingTypes.Count -eq 0) {
                Write-Host "    All required reviewer types present" -ForegroundColor Green
            } else {
                Write-Host "    Missing types: $($missingTypes -join ', ')" -ForegroundColor Red
                $allPassed = $false
            }
        } catch {
            Write-Host "  ✗ reviewer_profiles.json invalid JSON" -ForegroundColor Red
            $allPassed = $false
        }
    }
    
    # Check 3: Script functionality
    Write-Host ""
    Write-Host "CHECKING SCRIPT FUNCTIONALITY..." -ForegroundColor Yellow
    Write-Host ""
    
    $scripts = @(
        @{ Name = "misalignment_analysis.ps1"; Function = "Analyze-ReviewerResponses" },
        @{ Name = "trust_delta_scoring.ps1"; Function = "Calculate-TrustDelta" },
        @{ Name = "phase75_completion_report.ps1"; Function = "Generate-Phase75Report" }
    )
    
    foreach ($script in $scripts) {
        if (Test-Path $script.Name) {
            $content = Get-Content -Path $script.Name -Raw
            if ($content -match "function $($script.Function)") {
                Write-Host "  ✓ $($script.Name) contains $($script.Function)" -ForegroundColor Green
            } else {
                Write-Host "  ✗ $($script.Name) missing $($script.Function)" -ForegroundColor Yellow
            }
        }
    }
    
    # Check 4: Instructions file non-empty
    if (Test-Path "blind_review_instructions.txt") {
        $size = (Get-Item "blind_review_instructions.txt").Length
        if ($size -gt 100) {
            Write-Host "  ✓ blind_review_instructions.txt has content ($size bytes)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ blind_review_instructions.txt may be too small ($size bytes)" -ForegroundColor Yellow
        }
    }
    
    # Check 5: Template file structure
    if (Test-Path "reviewer_responses_template.json") {
        try {
            $template = Get-Content -Path "reviewer_responses_template.json" -Raw | ConvertFrom-Json
            $hasQuestions = $template.responses -ne $null
            $hasAssessment = $template.overall_assessment -ne $null
            
            if ($hasQuestions -and $hasAssessment) {
                Write-Host "  ✓ reviewer_responses_template.json has required structure" -ForegroundColor Green
            } else {
                Write-Host "  ⚠ reviewer_responses_template.json missing sections" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ✗ reviewer_responses_template.json invalid JSON" -ForegroundColor Red
        }
    }
    
    # Summary
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "VERIFICATION SUMMARY" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $criticalFiles = $results | Where-Object { $_.Critical }
    $criticalPassed = ($criticalFiles | Where-Object { $_.Exists }).Count
    $totalCritical = $criticalFiles.Count
    
    Write-Host "Critical files: $criticalPassed/$totalCritical" -ForegroundColor $(if ($criticalPassed -eq $totalCritical) { "Green" } else { "Red" })
    Write-Host "Overall status: $(if ($allPassed) { 'READY FOR EXECUTION' } else { 'SETUP INCOMPLETE' })" -ForegroundColor $(if ($allPassed) { "Green" } else { "Red" })
    
    if (-not $allPassed) {
        Write-Host ""
        Write-Host "MISSING OR INVALID FILES:" -ForegroundColor Yellow
        foreach ($result in $results | Where-Object { -not $_.Exists -and $_.Critical }) {
            Write-Host "  • $($result.File): $($result.Description)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "NEXT ACTIONS:" -ForegroundColor Cyan
    if ($allPassed) {
        Write-Host "1. Run: .\phase75_master_execution.ps1" -ForegroundColor Green
        Write-Host "2. Follow the step-by-step workflow" -ForegroundColor White
        Write-Host "3. Proceed with reviewer selection and distribution" -ForegroundColor White
    } else {
        Write-Host "1. Fix missing or invalid files above" -ForegroundColor Red
        Write-Host "2. Re-run this verification script" -ForegroundColor White
        Write-Host "3. Only proceed when all checks pass" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "REMINDER - Phase 75 Constraints:" -ForegroundColor Magenta
    Write-Host "• NO ranking changes" -ForegroundColor DarkMagenta
    Write-Host "• NO weight changes" -ForegroundColor DarkMagenta
    Write-Host "• NO language changes" -ForegroundColor DarkMagenta
    Write-Host "• NO persuasion during review" -ForegroundColor DarkMagenta
    Write-Host "• Measurement only, not improvement" -ForegroundColor DarkMagenta
    
    return @{
        AllPassed = $allPassed
        Results = $results
        CriticalFilesPassed = $criticalPassed
        TotalCriticalFiles = $totalCritical
    }
}

# Execute verification
Test-Phase75Setup

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Verification complete at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Cyan
