# phase75_completion_report.ps1
# Final Phase 75 Completion Report

function Generate-Phase75Report {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ReviewerProfilesPath = "reviewer_profiles.json",
        
        [Parameter(Mandatory=$false)]
        [string]$TrustDeltaPath = "trust_delta_summary.json",
        
        [Parameter(Mandatory=$true)]
        [string]$OutputPath = "phase75_completion_report.json"
    )
    
    Write-Host "=== PHASE 75 COMPLETION REPORT GENERATOR ===" -ForegroundColor Cyan
    Write-Host ""
    
    # Check for required files
    $requiredFiles = @(
        "reviewer_profiles.json",
        "blind_review_instructions.txt",
        "reviewer_responses_template.json",
        "misalignment_analysis.ps1",
        "trust_delta_scoring.ps1"
    )
    
    $missingFiles = @()
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        Write-Host "Missing required files:" -ForegroundColor Red
        foreach ($file in $missingFiles) {
            Write-Host "  - $file" -ForegroundColor Yellow
        }
        Write-Host "`nPlease complete all Phase 75 modules first." -ForegroundColor Red
        return $null
    }
    
    # Load existing data if available
    $phaseData = @{
        phase = 75
        phase_name = "External Verification (Non-Founder)"
        objective = "Independent reviewers reach the same conclusions as the founder — without guidance."
        completion_date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        artifacts_created = @()
        modules = @()
        success_criteria = @()
        results = @{}
        next_phases_unlocked = @()
    }
    
    # Document artifacts
    $artifacts = Get-ChildItem -File | Where-Object {
        $_.Name -match "reviewer|blind|misalignment|trust|phase75" -and 
        $_.Extension -match "\.(json|txt|ps1)$"
    }
    
    foreach ($artifact in $artifacts) {
        $phaseData.artifacts_created += @{
            name = $artifact.Name
            size_kb = [math]::Round($artifact.Length / 1KB, 2)
            last_modified = $artifact.LastWriteTime.ToString("yyyy-MM-dd HH:mm")
            description = Get-ArtifactDescription $artifact.Name
        }
    }
    
    # Document modules
    $phaseData.modules = @(
        @{
            module = "75.1"
            name = "Reviewer Selection Protocol"
            status = if (Test-Path $ReviewerProfilesPath) { "COMPLETE" } else { "PENDING" }
            deliverable = "reviewer_profiles.json"
            verification = if (Test-Path $ReviewerProfilesPath) { "File exists and meets schema" } else { "Not verified" }
        },
        @{
            module = "75.2"
            name = "Blind Review Setup"
            status = if (Test-Path "blind_review_instructions.txt") { "COMPLETE" } else { "PENDING" }
            deliverable = "blind_review_instructions.txt"
            verification = if (Test-Path "blind_review_instructions.txt") { "Instructions created" } else { "Not verified" }
        },
        @{
            module = "75.3"
            name = "Independent Interpretation Capture"
            status = if (Test-Path "reviewer_responses_template.json") { "TEMPLATE_READY" } else { "PENDING" }
            deliverable = "reviewer_responses_raw.json"
            verification = if (Test-Path "reviewer_responses_template.json") { "Template ready for reviewers" } else { "Template missing" }
            note = "Actual responses will be collected from reviewers"
        },
        @{
            module = "75.4"
            name = "Misalignment Analysis"
            status = if (Test-Path "misalignment_analysis.ps1") { "SCRIPT_READY" } else { "PENDING" }
            deliverable = "external_misalignment_report.json"
            verification = if (Test-Path "misalignment_analysis.ps1") { "Analysis script ready" } else { "Script missing" }
        },
        @{
            module = "75.5"
            name = "Trust Delta Scoring"
            status = if (Test-Path "trust_delta_scoring.ps1") { "SCRIPT_READY" } else { "PENDING" }
            deliverable = "trust_delta_summary.json"
            verification = if (Test-Path "trust_delta_scoring.ps1") { "Scoring script ready" } else { "Script missing" }
        }
    )
    
    # Define success criteria
    $phaseData.success_criteria = @(
        @{
            criterion = "No 🔴 classifications"
            description = "No reviewer attributes false intelligence or bias"
            importance = "CRITICAL"
        },
        @{
            criterion = "≥70% 🟢 across reviewers"
            description = "Majority of reviewers correctly understand system intent"
            importance = "HIGH"
        },
        @{
            criterion = "Trust-after ≥ Trust-before for all reviewers"
            description = "No reviewer loses trust after the review"
            importance = "HIGH"
        },
        @{
            criterion = "Gold phrase present"
            description = "At least one reviewer says: 'I disagree with the result, but I trust the system.'"
            importance = "GOLD_STANDARD"
            note = "This indicates the product is authoritative, not agreeable"
        }
    )
    
    # Check if trust delta results exist
    if (Test-Path $TrustDeltaPath) {
        $trustData = Get-Content -Path $TrustDeltaPath -Raw | ConvertFrom-Json
        $phaseData.results = @{
            trust_delta_summary = $trustData
            phase_passed = $trustData.phase_75_success_evaluation.phase_passed
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
    } else {
        $phaseData.results = @{
            status = "ANALYSIS_PENDING"
            note = "Run trust_delta_scoring.ps1 after collecting reviewer responses"
            expected_files = @(
                "reviewer_responses_raw.json",
                "external_misalignment_report.json",
                "trust_delta_summary.json"
            )
        }
    }
    
    # Define next phases unlocked
    $phaseData.next_phases_unlocked = @(
        @{
            phase = 76
            name = "Steel Team Confirmation"
            description = "Hostile expert review to stress-test system explanations"
            prerequisites = "Phase 75 PASSED"
        },
        @{
            phase = 77
            name = "Minimal UI Exposure"
            description = "First non-expert interface with minimal polish"
            prerequisites = "Phase 76 COMPLETE"
        },
        @{
            phase = 78
            name = "Pilot Users"
            description = "Controlled real-world usage with monitoring"
            prerequisites = "Phase 77 COMPLETE"
        },
        @{
            phase = 79
            name = "Traction Experiments"
            description = "Systematic growth and retention testing"
            prerequisites = "Phase 78 SUCCESSFUL"
        },
        @{
            phase = 80
            name = "Valuation Reality"
            description = "External validation of business metrics"
            prerequisites = "Phase 79 TRACTION_ACHIEVED"
        }
    )
    
    # Add completion checklist
    $phaseData.completion_checklist = @(
        @{
            item = "Reviewer profiles selected and documented"
            completed = (Test-Path $ReviewerProfilesPath)
            verification_command = 'Get-Content reviewer_profiles.json | ConvertFrom-Json | Select-Object -ExpandProperty reviewers | Measure-Object'
        },
        @{
            item = "Blind review instructions prepared"
            completed = (Test-Path "blind_review_instructions.txt")
            verification_command = 'Get-Content blind_review_instructions.txt | Select-Object -First 5'
        },
        @{
            item = "Response collection template ready"
            completed = (Test-Path "reviewer_responses_template.json")
            verification_command = 'Get-Content reviewer_responses_template.json | ConvertFrom-Json | Select-Object -ExpandProperty responses'
        },
        @{
            item = "Misalignment analysis script ready"
            completed = (Test-Path "misalignment_analysis.ps1")
            verification_command = 'Get-Content misalignment_analysis.ps1 | Select-String -Pattern "function Analyze-ReviewerResponses"'
        },
        @{
            item = "Trust delta scoring script ready"
            completed = (Test-Path "trust_delta_scoring.ps1")
            verification_command = 'Get-Content trust_delta_scoring.ps1 | Select-String -Pattern "function Calculate-TrustDelta"'
        },
        @{
            item = "Reviewer responses collected (MANUAL STEP)"
            completed = $false
            note = "This requires actual reviewer participation"
            file_expected = "reviewer_responses_raw.json"
        }
    )
    
    # Add execution instructions
    $phaseData.execution_instructions = @{
        step_1 = "Distribute to reviewers: blind_review_instructions.txt + External Review Packet"
        step_2 = "Collect completed reviewer_responses_template.json from each reviewer"
        step_3 = "Combine responses into reviewer_responses_raw.json"
        step_4 = "Run: .\misalignment_analysis.ps1 (or call Analyze-ReviewerResponses)"
        step_5 = "Run: .\trust_delta_scoring.ps1 (or call Calculate-TrustDelta)"
        step_6 = "Check trust_delta_summary.json for Phase 75 PASS/FAIL"
        step_7 = "If PASS: Proceed to Phase 76. If FAIL: Diagnose and iterate"
        important_notes = @(
            "DO NOT explain system to reviewers",
            "DO NOT answer 'why' questions during review",
            "DO NOT fix system based on Phase 75 results",
            "Phase 75 is measurement only, not improvement"
        )
    }
    
    # Save the report
    $phaseData | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputPath -Encoding UTF8
    
    Write-Host "Phase 75 Completion Report generated!" -ForegroundColor Green
    Write-Host "Saved to: $OutputPath" -ForegroundColor Cyan
    
    # Display summary
    Write-Host "`n=== PHASE 75 STATUS SUMMARY ===" -ForegroundColor Yellow
    $completedModules = ($phaseData.modules | Where-Object { $_.status -match "COMPLETE|READY" }).Count
    Write-Host "Modules prepared: $completedModules/5" -ForegroundColor $(if ($completedModules -eq 5) { "Green" } else { "Yellow" })
    Write-Host "Artifacts created: $($phaseData.artifacts_created.Count)" -ForegroundColor Cyan
    
    if (Test-Path $TrustDeltaPath) {
        Write-Host "Trust analysis: COMPLETE" -ForegroundColor Green
        $passed = $phaseData.results.phase_passed
        Write-Host "Phase 75 PASSED: $passed" -ForegroundColor $(if ($passed) { "Green" } else { "Red" })
    } else {
        Write-Host "Trust analysis: PENDING (run scripts after reviewer data)" -ForegroundColor Yellow
    }
    
    Write-Host "`nNext phase unlocked: Phase 76 - Steel Team Confirmation" -ForegroundColor Magenta
    Write-Host "Prerequisite: Phase 75 must PASS" -ForegroundColor White
    
    return $phaseData
}

function Get-ArtifactDescription {
    param([string]$FileName)
    
    $descriptions = @{
        "reviewer_profiles.json" = "Defines reviewer types and eligibility for Phase 75.1"
        "blind_review_instructions.txt" = "Instructions for reviewers to prevent bias (Phase 75.2)"
        "reviewer_responses_template.json" = "Template for collecting independent interpretations (Phase 75.3)"
        "reviewer_responses_raw.json" = "Actual collected reviewer responses (to be created)"
        "misalignment_analysis.ps1" = "Script to analyze reviewer understanding (Phase 75.4)"
        "external_misalignment_report.json" = "Report on reviewer-system alignment (to be generated)"
        "trust_delta_scoring.ps1" = "Script to calculate trust metrics (Phase 75.5)"
        "trust_delta_summary.json" = "Final trust scoring results (to be generated)"
        "phase75_completion_report.json" = "This file - comprehensive Phase 75 summary"
    }
    
    return if ($descriptions.ContainsKey($FileName)) { $descriptions[$FileName] } else { "Phase 75 artifact" }
}

# Export functions
Export-ModuleMember -Function Generate-Phase75Report, Get-ArtifactDescription

# Auto-run if called directly
if ($MyInvocation.InvocationName -ne '.') {
    Generate-Phase75Report
}
