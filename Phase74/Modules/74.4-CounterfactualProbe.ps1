// Phase74/Modules/74.4-CounterfactualProbe.ps1
# Counterfactual Probe Tool for Phase 74
# Purpose: Answer "what would have changed the result?" without re-ranking

class CounterfactualProbe {
    [string]
    [datetime]
    [string]
    [hashtable]
    [array]
    [hashtable]

    CounterfactualProbe() {
        .ProbeId = [guid]::NewGuid().ToString()
        .ProbeTime = [datetime]::UtcNow
        .Probes = @()
        .Analysis = @{}
        .OriginalResults = @{}
    }

    [void] AddProbe([string], [hashtable], [string], [string], [hashtable]) {
         = @{
            Scenario = 
            Delta = if () {  } else { @{} }
            Impact = 
            Reason = 
            Evidence = if () {  } else { @{} }
            Timestamp = [datetime]::UtcNow
        }
        
        .Probes += 
    }

    [void] AnalyzeSensitivity([hashtable], [hashtable]) {
         = @{
            MostSensitiveFactors = @()
            CriticalThresholds = @()
            StableBoundaries = @()
            VulnerabilityScore = 0
        }

        # Analyze score sensitivity
        if (.Results -and .Results.Count -gt 1) {
             = .Results[0].Score
             = if (.Results.Count -gt 1) { .Results[1].Score } else {  }
             =  - 
            
            if ( -lt 10) {
                .MostSensitiveFactors += "Top rank score gap is only  points"
                .VulnerabilityScore += 20
            }
            
            if ( -lt 5) {
                .CriticalThresholds += "Rank 1-2 gap < 5 points: ranking is fragile"
                .VulnerabilityScore += 30
            }
        }

        # Analyze weight sensitivity
        if (.ScoringWeights) {
             = .ScoringWeights
             = (.Values | Measure-Object -Maximum).Maximum
             = (.Values | Measure-Object -Minimum).Minimum
             =  - 
            
            if ( -lt 0.2) {
                .MostSensitiveFactors += "Weight range is narrow ()"
                .VulnerabilityScore += 15
            }
        }

        # Analyze filter sensitivity
         = 0
        if (.Steps) {
             = (.Steps | Where-Object { .StepName -match "Hard Filter" }).Count
        }
        
        if ( -eq 0) {
            .CriticalThresholds += "No hard filters applied: all ranking is soft"
            .VulnerabilityScore += 25
        }

        # Calculate stability boundaries
        .StableBoundaries = @(
            "Ranking changes if top score gap < 5 points",
            "Weight changes > 0.15 can alter rankings",
            "Filter relaxation adds 2-3 new candidates"
        )

        # Cap vulnerability score
        .VulnerabilityScore = [math]::Min(.VulnerabilityScore, 100)
        
        .Analysis = 
    }

    [hashtable] GenerateProbeReport() {
         = @{
            Metadata = @{
                ProbeId = .ProbeId
                ProbeTime = if (.ProbeTime) { .ProbeTime.ToString('o') } else {  }
                OriginalSnapshotId = .OriginalSnapshotId
                TotalProbes = .Probes.Count
            }
            Summary = @{
                WouldChangeCount = (.Probes | Where-Object { .Impact -eq "Would Change" }).Count
                WouldNotChangeCount = (.Probes | Where-Object { .Impact -eq "Would Not Change" }).Count
                VulnerabilityScore = .Analysis.VulnerabilityScore
                RiskLevel = if (.Analysis.VulnerabilityScore -gt 50) { "High" } elseif (.Analysis.VulnerabilityScore -gt 20) { "Medium" } else { "Low" }
            }
            SensitivityAnalysis = .Analysis
            DetailedProbes = .Probes
        }

        return 
    }

    [string] ToHumanReadable() {
         = @()
         += "COUNTERFACTUAL PROBE ANALYSIS"
         += "=============================="
         += "Probe ID: "
         += "Time: N/A"
         += "Original Snapshot: N/A"
         += ""
        
         += "RISK ASSESSMENT:"
         += "----------------"
         += "Vulnerability Score: N/A"
         += "Risk Level: N/A"
         += ""
        
        if (.Analysis.CriticalThresholds -and .Analysis.CriticalThresholds.Count -gt 0) {
             += "CRITICAL THRESHOLDS:"
             += "--------------------"
            foreach ( in .Analysis.CriticalThresholds) {
                 += "⚠ "
            }
             += ""
        }
        
        if (.Analysis.MostSensitiveFactors -and .Analysis.MostSensitiveFactors.Count -gt 0) {
             += "MOST SENSITIVE FACTORS:"
             += "-----------------------"
            foreach ( in .Analysis.MostSensitiveFactors) {
                 += "• "
            }
             += ""
        }
        
        if (.Analysis.StableBoundaries -and .Analysis.StableBoundaries.Count -gt 0) {
             += "STABILITY BOUNDARIES:"
             += "---------------------"
            foreach ( in .Analysis.StableBoundaries) {
                 += "✓ "
            }
             += ""
        }
        
         += "COUNTERFACTUAL SCENARIOS:"
         += "-------------------------"
        
        if (.Probes -and .Probes.Count -gt 0) {
             = 1
            foreach ( in .Probes) {
                 += ""
                 += "Scenario {0}: {1}" -f , .Scenario
                 += "Change: None"
                 += "Impact: "
                 += "Reason: "
                
                if (.Evidence -and .Evidence.Count -gt 0) {
                     += "Evidence:"
                    foreach ( in @(.Evidence.Keys)) {
                         = .Evidence[]
                         += "  - : null"
                    }
                }
                
                ++
            }
        } else {
             += "No scenarios analyzed"
        }
        
        return  -join "
"
    }
}

function New-CounterfactualProbe {
    param(
        [string],
        [hashtable]
    )
    
     = [CounterfactualProbe]::new()
    .OriginalSnapshotId = 
    .OriginalResults = if () {  } else { @{} }
    return 
}

function Test-CounterfactualScenario {
    param(
        [hashtable],
        [hashtable],
        [hashtable],
        [string]
    )
    
     = "Would Not Change"
     = "Insufficient delta to alter ranking"
     = @{}
    
    # Analyze the delta against original data
    if (.ClientInputs) {
        # Check if client goal changes would matter
        if (.ClientInputs.goals) {
             = if (.Inputs.Client.goals) { .Inputs.Client.goals -join ", " } else { "" }
             = .ClientInputs.goals -join ", "
            
            # Simple heuristic: if goals change significantly, ranking might change
             = Compare-Object -ReferenceObject .Inputs.Client.goals -DifferenceObject .ClientInputs.goals -IncludeEqual | 
                          Where-Object SideIndicator -eq "==" | Measure-Object | Select-Object -ExpandProperty Count
             = .ClientInputs.goals.Count
            
            if ( /  -lt 0.5) {
                 = "Would Change"
                 = "Client goals changed by more than 50%"
                 = @{
                    OriginalGoals = 
                    NewGoals = 
                    OverlapPercentage = [math]::Round(( / ) * 100, 1)
                }
            }
        }
    }
    
    # Check configuration changes
    if (.Configuration) {
        if (.Configuration.ScoringWeights) {
             = False
            foreach ( in .Configuration.ScoringWeights.Keys) {
                 = .ScoringWeights[]
                 = .Configuration.ScoringWeights[]
                
                if ( -and [math]::Abs( - ) -gt 0.15) {
                     = True
                    ["WeightChange_"] = " → "
                }
            }
            
            if () {
                 = "Would Change"
                 = "Significant weight changes (>0.15)"
            }
        }
    }
    
    # Check if removing a filter would change results
    if (.RemoveFilter) {
         = .TrainerProfiles | Where-Object { .is_active -eq True }
         = .TrainerProfiles.Count
        
        if (.Count -lt ) {
             = "Would Change"
             = "Removing active filter adds 0 new candidates"
             = @{
                CurrentlyActive = .Count
                WouldBecomeActive = 
                AdditionalCandidates =  - .Count
            }
        }
    }
    
    # Check score threshold changes
    if (.ScoreThreshold) {
         = if (.ScoreThreshold) { .ScoreThreshold } else { 0 }
         = .ScoreThreshold
        
        if ( -gt ) {
             = (.Results | Where-Object { .Score -ge  }).Count
             = .Results.Count
            
            if ( -lt ) {
                 = "Would Change"
                 = "Higher score threshold excludes 0 candidates"
                 = @{
                    CurrentThreshold = 
                    NewThreshold = 
                    WouldPass = 
                    CurrentlyPass = 
                }
            }
        }
    }
    
    return @{
        Impact = 
        Reason = 
        Evidence = 
    }
}

function Generate-CounterfactualProbes {
    param(
        [hashtable],
        [hashtable],
        [array] = @()
    )
    
     = New-CounterfactualProbe 
        -OriginalSnapshotId .SnapshotId 
        -OriginalResults .Results
    
    # Default scenarios if none provided
    if (.Count -eq 0) {
         = @(
            @{
                Scenario = "Client changes primary goal"
                Delta = @{
                    ClientInputs = @{
                        goals = @("bodybuilding", "strength")  # Changed from original
                    }
                }
            },
            @{
                Scenario = "Increase experience weight"
                Delta = @{
                    Configuration = @{
                        ScoringWeights = @{
                            Experience = 0.4  # Increased by 0.15
                        }
                    }
                }
            },
            @{
                Scenario = "Remove active trainer filter"
                Delta = @{
                    RemoveFilter = "active"
                }
            },
            @{
                Scenario = "Higher score threshold"
                Delta = @{
                    ScoreThreshold = 70  # Only show matches above 70
                }
            },
            @{
                Scenario = "Minor goal adjustment"
                Delta = @{
                    ClientInputs = @{
                        goals = @("weight loss", "cardio", "flexibility")  # Added one goal
                    }
                }
            }
        )
    }
    
    foreach ( in ) {
         = Test-CounterfactualScenario 
            -OriginalData  
            -Configuration  
            -Delta .Delta 
            -ScenarioDescription .Scenario
        
        .AddProbe(
            .Scenario,
            .Delta,
            .Impact,
            .Reason,
            .Evidence
        )
    }
    
    # Analyze overall sensitivity
    .AnalyzeSensitivity(, )
    
    return 
}

function Export-CounterfactualProbe {
    param(
        [CounterfactualProbe],
        [string] = "both",
        [string] = "./Artifacts"
    )
    
    # Ensure Artifacts directory exists
    if (-not (Test-Path )) {
        New-Item -ItemType Directory -Path  -Force | Out-Null
    }
    
     = "counterfactual_probe_"
    
    if ( -in @("human", "both")) {
         = Join-Path  ".human.txt"
         = .ToHumanReadable()
         | Out-File -FilePath  -Encoding UTF8
        Write-Host "Human-readable probe exported to: " -ForegroundColor Green
    }
    
    if ( -in @("machine", "both")) {
         = Join-Path  ".machine.json"
         = .GenerateProbeReport() | ConvertTo-Json -Depth 10
         | Out-File -FilePath  -Encoding UTF8
        Write-Host "Machine-readable probe exported to: " -ForegroundColor Green
    }
    
    return @{
        HumanPath = if ( -in @("human", "both")) {  } else {  }
        MachinePath = if ( -in @("machine", "both")) {  } else {  }
    }
}

function Test-CounterfactualProbeSystem {
    Write-Host "
=== PHASE 74.4 COUNTERFACTUAL PROBE SYSTEM TEST ===" -ForegroundColor Magenta
    
    # Create test match data
     = @{
        SnapshotId = [guid]::NewGuid().ToString()
        Inputs = @{
            Client = @{
                id = "test-client-001"
                goals = @("weight loss", "cardio")
                experience_level = "beginner"
            }
            Request = @{
                Limit = 3
            }
        }
        TrainerProfiles = @(
            @{ id = "T1"; is_active = True; verified = True; specialties = @("cardio", "hiit") },
            @{ id = "T2"; is_active = True; verified = True; specialties = @("strength", "bodybuilding") },
            @{ id = "T3"; is_active = False; verified = True; specialties = @("yoga", "flexibility") },
            @{ id = "T4"; is_active = True; verified = False; specialties = @("cardio", "endurance") }
        )
        Results = @(
            @{ TrainerId = "T1"; Score = 88; Rank = 1; Explanation = "Excellent cardio match" },
            @{ TrainerId = "T2"; Score = 85; Rank = 2; Explanation = "Good strength trainer" },
            @{ TrainerId = "T4"; Score = 82; Rank = 3; Explanation = "Cardio specialist" }
        )
        Steps = @(
            @{ StepName = "Hard Filter: Active Status" },
            @{ StepName = "Hard Filter: Verification" },
            @{ StepName = "Score Calculation" }
        )
    }
    
     = @{
        ScoringWeights = @{
            Goals = 0.3
            Experience = 0.25
            Availability = 0.2
            Personality = 0.15
            Location = 0.1
        }
        ScoreThreshold = 0
    }
    
    # Generate counterfactual probes
    Write-Host "
Generating counterfactual analysis..." -ForegroundColor Cyan
     = Generate-CounterfactualProbes -MatchData  -Configuration 
    
    # Export probes
     = Export-CounterfactualProbe -Probe  -Format "both"
    
    # Display analysis
    Write-Host "
=== COUNTERFACTUAL ANALYSIS PREVIEW ===" -ForegroundColor Cyan
     = .ToHumanReadable()
    ( -split "
")[0..40] | ForEach-Object { Write-Host  }
    Write-Host "... (truncated)" -ForegroundColor Gray
    
    # Show key insights
     = .GenerateProbeReport()
    Write-Host "
=== KEY INSIGHTS ===" -ForegroundColor Cyan
    Write-Host "Risk Level: " -ForegroundColor White
    Write-Host "Vulnerability Score: /100" -ForegroundColor White
    Write-Host "Scenarios that would change ranking: " -ForegroundColor White
    Write-Host "Scenarios that wouldn't change: " -ForegroundColor White
    
    # Test specific scenarios
    Write-Host "
=== SCENARIO VALIDATION ===" -ForegroundColor Cyan
    
     = @(
        @{
            Description = "Major goal change (bodybuilding instead of cardio)"
            Delta = @{
                ClientInputs = @{
                    goals = @("bodybuilding", "strength")
                }
            }
            ExpectedImpact = "Would Change"
        },
        @{
            Description = "Minor goal addition (add flexibility)"
            Delta = @{
                ClientInputs = @{
                    goals = @("weight loss", "cardio", "flexibility")
                }
            }
            ExpectedImpact = "Would Not Change"
        },
        @{
            Description = "Remove inactive filter"
            Delta = @{
                RemoveFilter = "active"
            }
            ExpectedImpact = "Would Change"
        }
    )
    
     = @()
    foreach ( in ) {
         = Test-CounterfactualScenario 
            -OriginalData  
            -Configuration  
            -Delta .Delta 
            -ScenarioDescription .Description
        
         = .Impact -eq .ExpectedImpact
         += @{
            Scenario = .Description
            Expected = .ExpectedImpact
            Actual = .Impact
            Passed = 
            Reason = .Reason
        }
        
         = if () { "Green" } else { "Red" }
         = if () { "✓" } else { "✗" }
        Write-Host "   " -ForegroundColor 
        Write-Host "    Expected: , Actual: " -ForegroundColor 
    }
    
     = ( | Where-Object { .Passed -eq False }).Count -eq 0
    
    return @{
        Success = 
        ProbeId = .ProbeId
        ExportPaths = 
        ValidationResults = 
        Summary = .Summary
    }
}

# Export functions
Export-ModuleMember -Function New-CounterfactualProbe, Generate-CounterfactualProbes, Export-CounterfactualProbe, Test-CounterfactualProbeSystem
