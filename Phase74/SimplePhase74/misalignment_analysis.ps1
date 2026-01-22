# misalignment_analysis.ps1
# Phase 75.4 — Misalignment Analysis

function Analyze-ReviewerResponses {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ResponsesPath,
        
        [Parameter(Mandatory=$true)]
        [string]$OutputPath
    )
    
    # Load reviewer responses
    if (-not (Test-Path $ResponsesPath)) {
        Write-Error "Responses file not found: $ResponsesPath"
        return
    }
    
    $responses = Get-Content -Path $ResponsesPath -Raw | ConvertFrom-Json
    
    # Classification definitions
    $classifications = @{
        "correct_understanding" = @{
            code = "🟢"
            description = "Reviewer correctly understands system intent and reasoning"
            criteria = @(
                "Matches system's stated logic",
                "Identifies correct tradeoffs",
                "No misinterpretation"
            )
        }
        "understands_after_reading" = @{
            code = "🟡"
            description = "Reviewer understands only after careful reading of explanation"
            criteria = @(
                "Initial confusion resolved by explanation",
                "Required re-reading",
                "Understanding achieved but not immediate"
            )
        }
        "misunderstands_intent" = @{
            code = "🟠"
            description = "Reviewer misunderstands what the system was trying to do"
            criteria = @(
                "Attributes wrong objective to system",
                "Misinterprets ranking criteria",
                "Confuses system priorities"
            )
        }
        "false_intelligence_bias" = @{
            code = "🔴"
            description = "Reviewer attributes false intelligence or bias to system"
            criteria = @(
                "Sees non-existent patterns",
                "Attributes human-like reasoning errors",
                "Assumes bias without evidence",
                "Claims system is 'cheating' or 'hiding' things"
            )
        }
    }
    
    # Analyze each response
    $analysisResults = @()
    
    foreach ($response in $responses) {
        $analysis = @{
            reviewer_id = $response.review_session.reviewer_id
            classifications = @()
            question_analysis = @()
            overall_classification = ""
            trust_delta = $response.overall_assessment.trust_after - $response.overall_assessment.trust_before
            red_flags = @()
            notes = @()
        }
        
        # Analyze each question response
        $questionClassifications = @()
        
        foreach ($questionKey in $response.responses.PSObject.Properties.Name) {
            $question = $response.responses.$questionKey
            $answer = $question.answer
            
            # Simple heuristic classification (in real implementation, this would use NLP or more complex logic)
            $classification = "🟡"  # Default to yellow
            
            # Heuristic rules for classification
            if ($answer -match "don't understand|confused|unclear") {
                $classification = "🟡"
                $analysis.notes += "Confusion detected in $questionKey"
            }
            elseif ($answer -match "bias|unfair|discriminat|prejudice") {
                $classification = "🔴"
                $analysis.red_flags += "Bias attribution in $questionKey"
            }
            elseif ($answer -match "system seems|appears to|might be") {
                $classification = "🟠"
                $analysis.notes += "Tentative/uncertain attribution in $questionKey"
            }
            elseif ($question.confidence -ge 4) {
                $classification = "🟢"
            }
            
            $questionClassifications += $classification
            
            $analysis.question_analysis += @{
                question = $questionKey
                answer_preview = if ($answer.Length -gt 50) { $answer.Substring(0, 50) + "..." } else { $answer }
                classification = $classification
                confidence = $question.confidence
            }
        }
        
        # Determine overall classification
        if ($analysis.red_flags.Count -gt 0) {
            $analysis.overall_classification = "🔴"
        } elseif ($questionClassifications -contains "🔴") {
            $analysis.overall_classification = "🔴"
        } elseif ($questionClassifications -contains "🟠") {
            $analysis.overall_classification = "🟠"
        } elseif ($questionClassifications -contains "🟡") {
            $analysis.overall_classification = "🟡"
        } else {
            $analysis.overall_classification = "🟢"
        }
        
        # Calculate classification counts
        $analysis.classification_counts = @{
            green = ($questionClassifications | Where-Object { $_ -eq "🟢" }).Count
            yellow = ($questionClassifications | Where-Object { $_ -eq "🟡" }).Count
            orange = ($questionClassifications | Where-Object { $_ -eq "🟠" }).Count
            red = ($questionClassifications | Where-Object { $_ -eq "🔴" }).Count
        }
        
        $analysisResults += $analysis
    }
    
    # Create final report
    $report = @{
        analysis_date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        total_reviewers = $analysisResults.Count
        classification_summary = @{
            green_reviewers = ($analysisResults | Where-Object { $_.overall_classification -eq "🟢" }).Count
            yellow_reviewers = ($analysisResults | Where-Object { $_.overall_classification -eq "🟡" }).Count
            orange_reviewers = ($analysisResults | Where-Object { $_.overall_classification -eq "🟠" }).Count
            red_reviewers = ($analysisResults | Where-Object { $_.overall_classification -eq "🔴" }).Count
        }
        individual_analyses = $analysisResults
        phase_75_success_check = @{
            no_red_classifications = (($analysisResults | Where-Object { $_.overall_classification -eq "🔴" }).Count -eq 0)
            green_percentage = [math]::Round((($analysisResults | Where-Object { $_.overall_classification -eq "🟢" }).Count / $analysisResults.Count) * 100, 2)
            trust_improved_all = ($analysisResults | Where-Object { $_.trust_delta -ge 0 }).Count -eq $analysisResults.Count
            gold_phrase_found = $false  # This would check for "I disagree with the result, but I trust the system."
        }
        recommendations = @(
            "DO NOT FIX ANYTHING YET",
            "Proceed to Phase 75.5 for trust delta scoring",
            "Document all misalignments for future phases"
        )
    }
    
    # Save report
    $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputPath -Encoding UTF8
    
    Write-Host "Misalignment analysis complete!" -ForegroundColor Green
    Write-Host "Report saved to: $OutputPath" -ForegroundColor Cyan
    
    # Display summary
    Write-Host "`n=== ANALYSIS SUMMARY ===" -ForegroundColor Yellow
    Write-Host "Total reviewers analyzed: $($report.total_reviewers)" -ForegroundColor White
    Write-Host "Green (🟢): $($report.classification_summary.green_reviewers)" -ForegroundColor Green
    Write-Host "Yellow (🟡): $($report.classification_summary.yellow_reviewers)" -ForegroundColor Yellow
    Write-Host "Orange (🟠): $($report.classification_summary.orange_reviewers)" -ForegroundColor DarkYellow
    Write-Host "Red (🔴): $($report.classification_summary.red_reviewers)" -ForegroundColor Red
    
    return $report
}

# Export the function for use
Export-ModuleMember -Function Analyze-ReviewerResponses
