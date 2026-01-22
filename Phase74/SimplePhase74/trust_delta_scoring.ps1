# trust_delta_scoring.ps1
# Phase 75.5 — Trust Delta Scoring

function Calculate-TrustDelta {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ResponsesPath,
        
        [Parameter(Mandatory=$true)]
        [string]$MisalignmentReportPath,
        
        [Parameter(Mandatory=$true)]
        [string]$OutputPath
    )
    
    # Load data
    if (-not (Test-Path $ResponsesPath)) {
        Write-Error "Responses file not found: $ResponsesPath"
        return
    }
    
    if (-not (Test-Path $MisalignmentReportPath)) {
        Write-Error "Misalignment report not found: $MisalignmentReportPath"
        return
    }
    
    $responses = Get-Content -Path $ResponsesPath -Raw | ConvertFrom-Json
    $misalignmentReport = Get-Content -Path $MisalignmentReportPath -Raw | ConvertFrom-Json
    
    # Process each reviewer
    $trustMetrics = @()
    
    foreach ($response in $responses) {
        $reviewerId = $response.review_session.reviewer_id
        $assessment = $response.overall_assessment
        
        # Find corresponding misalignment analysis
        $misalignment = $misalignmentReport.individual_analyses | Where-Object { $_.reviewer_id -eq $reviewerId } | Select-Object -First 1
        
        $metric = @{
            reviewer_id = $reviewerId
            trust_metrics = @{
                trust_before = $assessment.trust_before
                trust_after = $assessment.trust_after
                trust_delta = $assessment.trust_after - $assessment.trust_before
                trust_direction = if (($assessment.trust_after - $assessment.trust_before) -gt 0) { "increased" } 
                                 elseif (($assessment.trust_after - $assessment.trust_before) -lt 0) { "decreased" } 
                                 else { "unchanged" }
                confidence_in_explanations = $assessment.confidence_in_explanations
                willingness_to_rely = $assessment.willingness_to_rely
            }
            misalignment_impact = @{
                overall_classification = if ($misalignment) { $misalignment.overall_classification } else { "unknown" }
                classification_counts = if ($misalignment) { $misalignment.classification_counts } else { $null }
                trust_impact_rating = Calculate-TrustImpact -Classification $(if ($misalignment) { $misalignment.overall_classification } else { "unknown" }) -TrustDelta $($assessment.trust_after - $assessment.trust_before)
            }
            key_insights = @()
            phase_75_contribution = @{
                passed_gold_standard = if ($assessment.final_comments -match "disagree.*but.*trust") { $true } else { $false }
                gold_phrase_found = if ($assessment.final_comments -match "disagree.*but.*trust") { $true } else { $false }
            }
        }
        
        # Add insights based on metrics
        if ($metric.trust_metrics.trust_delta -ge 2) {
            $metric.key_insights += "Significant trust improvement (+$($metric.trust_metrics.trust_delta))"
        }
        elseif ($metric.trust_metrics.trust_delta -le -2) {
            $metric.key_insights += "Significant trust erosion ($($metric.trust_metrics.trust_delta))"
        }
        
        if ($metric.trust_metrics.willingness_to_rely -and $metric.misalignment_impact.overall_classification -eq "🟢") {
            $metric.key_insights += "High alignment: willing to rely and understands system"
        }
        
        if (-not $metric.trust_metrics.willingness_to_rely -and $metric.misalignment_impact.overall_classification -eq "🟢") {
            $metric.key_insights += "Understands but doesn't trust - investigate deeper"
        }
        
        $trustMetrics += $metric
    }
    
    # Calculate aggregate statistics
    $aggregates = @{
        average_trust_before = [math]::Round(($trustMetrics.trust_metrics.trust_before | Measure-Object -Average).Average, 2)
        average_trust_after = [math]::Round(($trustMetrics.trust_metrics.trust_after | Measure-Object -Average).Average, 2)
        average_trust_delta = [math]::Round(($trustMetrics.trust_metrics.trust_delta | Measure-Object -Average).Average, 2)
        trust_improved_count = ($trustMetrics | Where-Object { $_.trust_metrics.trust_delta -gt 0 }).Count
        trust_declined_count = ($trustMetrics | Where-Object { $_.trust_metrics.trust_delta -lt 0 }).Count
        trust_unchanged_count = ($trustMetrics | Where-Object { $_.trust_metrics.trust_delta -eq 0 }).Count
        willingness_to_rely_count = ($trustMetrics | Where-Object { $_.trust_metrics.willingness_to_rely }).Count
        willingness_to_rely_percentage = [math]::Round((($trustMetrics | Where-Object { $_.trust_metrics.willingness_to_rely }).Count / $trustMetrics.Count) * 100, 2)
        gold_phrase_count = ($trustMetrics | Where-Object { $_.phase_75_contribution.gold_phrase_found }).Count
    }
    
    # Create final summary
    $summary = @{
        report_date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        phase = "75.5 - Trust Delta Scoring"
        total_reviewers = $trustMetrics.Count
        aggregate_metrics = $aggregates
        individual_trust_metrics = $trustMetrics
        phase_75_success_evaluation = @{
            no_red_classifications = $misalignmentReport.phase_75_success_check.no_red_classifications
            green_percentage = $misalignmentReport.phase_75_success_check.green_percentage
            green_threshold_met = $misalignmentReport.phase_75_success_check.green_percentage -ge 70
            trust_improved_all = $aggregates.trust_declined_count -eq 0
            gold_phrase_exists = $aggregates.gold_phrase_count -gt 0
            phase_passed = ($misalignmentReport.phase_75_success_check.no_red_classifications -and 
                          ($misalignmentReport.phase_75_success_check.green_percentage -ge 70) -and 
                          ($aggregates.trust_declined_count -eq 0) -and 
                          ($aggregates.gold_phrase_count -gt 0))
        }
        next_steps = @{
            phase_75_complete = $false
            proceed_to_phase_76 = $false
            required_actions = @()
        }
    }
    
    # Determine next steps
    if ($summary.phase_75_success_evaluation.phase_passed) {
        $summary.next_steps.phase_75_complete = $true
        $summary.next_steps.proceed_to_phase_76 = $true
        $summary.next_steps.required_actions = @(
            "Generate Phase 75 completion report",
            "Prepare for Phase 76 — Steel Team Confirmation",
            "Document all findings for future reference"
        )
    } else {
        $summary.next_steps.phase_75_complete = $false
        $summary.next_steps.proceed_to_phase_76 = $false
        $summary.next_steps.required_actions = @(
            "DO NOT PROCEED - Phase 75 requirements not met",
            "Review failure points:",
            "  - Red classifications: $(if (-not $summary.phase_75_success_evaluation.no_red_classifications) { 'Found' } else { 'None' })",
            "  - Green percentage: $($summary.phase_75_success_evaluation.green_percentage)% (need ≥70%)",
            "  - Trust decline: $($aggregates.trust_declined_count) reviewers",
            "  - Gold phrase: $(if ($summary.phase_75_success_evaluation.gold_phrase_exists) { 'Found' } else { 'Not found' })",
            "Consider additional reviewers or review current responses"
        )
    }
    
    # Save summary
    $summary | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputPath -Encoding UTF8
    
    Write-Host "Trust delta scoring complete!" -ForegroundColor Green
    Write-Host "Summary saved to: $OutputPath" -ForegroundColor Cyan
    
    # Display key results
    Write-Host "`n=== TRUST DELTA SUMMARY ===" -ForegroundColor Yellow
    Write-Host "Average Trust Before: $($aggregates.average_trust_before)/5" -ForegroundColor White
    Write-Host "Average Trust After: $($aggregates.average_trust_after)/5" -ForegroundColor White
    Write-Host "Average Delta: $($aggregates.average_trust_delta)" -ForegroundColor $(if ($aggregates.average_trust_delta -gt 0) { "Green" } elseif ($aggregates.average_trust_delta -lt 0) { "Red" } else { "Yellow" })
    Write-Host "Trust Improved: $($aggregates.trust_improved_count) reviewers" -ForegroundColor Green
    Write-Host "Trust Declined: $($aggregates.trust_declined_count) reviewers" -ForegroundColor $(if ($aggregates.trust_declined_count -gt 0) { "Red" } else { "Green" })
    Write-Host "Willing to Rely: $($aggregates.willingness_to_rely_count)/$($trustMetrics.Count) ($($aggregates.willingness_to_rely_percentage)%)" -ForegroundColor Cyan
    Write-Host "Gold Phrase Found: $($aggregates.gold_phrase_count) reviewers" -ForegroundColor $(if ($aggregates.gold_phrase_count -gt 0) { "Green" } else { "Yellow" })
    Write-Host "`nPhase 75 PASSED: $($summary.phase_75_success_evaluation.phase_passed)" -ForegroundColor $(if ($summary.phase_75_success_evaluation.phase_passed) { "Green" } else { "Red" })
    
    return $summary
}

function Calculate-TrustImpact {
    param(
        [string]$Classification,
        [int]$TrustDelta
    )
    
    $impactMap = @{
        "🟢" = @{ High = "Positive alignment"; Medium = "Good alignment"; Low = "Minimal impact" }
        "🟡" = @{ High = "Confusion reduces trust"; Medium = "Mixed impact"; Low = "Slight concern" }
        "🟠" = @{ High = "Misunderstanding erodes trust"; Medium = "Negative impact"; Low = "Some concern" }
        "🔴" = @{ High = "Severe trust breakdown"; Medium = "Major concern"; Low = "Significant issue" }
        "unknown" = @{ High = "Unknown impact"; Medium = "Unclear"; Low = "Data missing" }
    }
    
    if ($TrustDelta -ge 2) { return $impactMap[$Classification].High }
    elseif ($TrustDelta -ge 0) { return $impactMap[$Classification].Medium }
    else { return $impactMap[$Classification].Low }
}

# Export functions
Export-ModuleMember -Function Calculate-TrustDelta, Calculate-TrustImpact
