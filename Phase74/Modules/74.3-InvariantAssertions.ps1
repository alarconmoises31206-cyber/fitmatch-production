// Phase74/Modules/74.3-InvariantAssertions.ps1
# Invariant Assertion Layer for Phase 74
# Purpose: Prove system boundaries cannot be violated

class SystemInvariant {
    [string]
    [string]
    [scriptblock]
    [string]
    [bool]
    
    SystemInvariant([string], [string], [scriptblock], [string], [bool]) {
        .Name = 
        .Description = 
        .Assertion = 
        .FailureMessage = 
        .IsCritical = 
    }
    
    [hashtable] Test() {
         = Get-Date
        try {
             = & .Assertion 
             =  -eq True
            
            return @{
                Name = .Name
                Success = 
                Message = if () { "Invariant holds" } else { .FailureMessage }
                IsCritical = .IsCritical
                Duration = ((Get-Date) - ).TotalMilliseconds
                Timestamp = Get-Date
            }
        }
        catch {
            return @{
                Name = .Name
                Success = False
                Message = "Assertion error: "
                IsCritical = .IsCritical
                Duration = ((Get-Date) - ).TotalMilliseconds
                Timestamp = Get-Date
                Error = .Exception.ToString()
            }
        }
    }
}

class InvariantAssertionEngine {
    [System.Collections.Generic.List[SystemInvariant]]
    
    InvariantAssertionEngine() {
        .Invariants = [System.Collections.Generic.List[SystemInvariant]]::new()
        .RegisterCoreInvariants()
    }
    
    [void] RegisterInvariant([SystemInvariant]) {
        .Invariants.Add()
    }
    
    [void] RegisterCoreInvariants() {
        # 1. Hard filters always precede similarity
         = [SystemInvariant]::new(
            "HardFilterPrecedence",
            "Hard filters must be applied before similarity scoring",
            {
                param()
                if (-not .Steps) { return False }
                
                 = .Steps | Where-Object { .StepName -match "Hard Filter" } | Select-Object -First 1
                 = .Steps | Where-Object { .StepName -match "Score" } | Select-Object -First 1
                
                if (-not  -or -not ) { return False }
                
                 = [array]::IndexOf(.Steps, )
                 = [array]::IndexOf(.Steps, )
                
                return  -lt 
            },
            "Hard filters were not applied before similarity scoring",
            True
        )
        .RegisterInvariant()
        
        # 2. Weights cannot be overridden by embeddings
         = [SystemInvariant]::new(
            "WeightImmutable",
            "Scoring weights cannot be modified by embeddings or external factors",
            {
                param()
                if (-not .Configuration) { return False }
                
                 = .Configuration.ScoringWeights
                if (-not ) { return False }
                
                # Check if any step claims to modify weights
                foreach ( in .Steps) {
                    if (.StepName -match "weight.*modif|change.*weight|override.*weight") {
                        return False
                    }
                }
                
                return True
            },
            "Scoring weights were modified or overridden",
            True
        )
        .RegisterInvariant()
        
        # 3. Explanation cannot contradict ranking
         = [SystemInvariant]::new(
            "ExplanationConsistency",
            "Match explanations cannot contradict the ranking order",
            {
                param()
                if (-not .Results -or .Results.Count -lt 2) { return True }
                
                 = .Results | Sort-Object -Property Score -Descending
                
                # Check if sorted order matches actual order
                for ( = 0;  -lt .Count; ++) {
                    if ([].TrainerId -ne .Results[].TrainerId) {
                        return False
                    }
                }
                
                return True
            },
            "Match explanations contradict the ranking order",
            True
        )
        .RegisterInvariant()
        
        # 4. Confidence cannot exceed signal support
         = [SystemInvariant]::new(
            "ConfidenceBound",
            "Confidence scores cannot exceed the available signal support",
            {
                param()
                if (-not .Results) { return True }
                
                foreach ( in .Results) {
                    if (.Confidence -gt 1.0) {
                        return False
                    }
                    
                    # Confidence should be reasonable given score
                    if (.Score -lt 50 -and .Confidence -gt 0.8) {
                        return False
                    }
                }
                
                return True
            },
            "Confidence score exceeds reasonable bounds for given signal support",
            True
        )
        .RegisterInvariant()
        
        # 5. Language cannot imply learning or intelligence
         = [SystemInvariant]::new(
            "LanguageBoundary",
            "System language cannot imply AI learning or intelligence",
            {
                param()
                 = @(
                    "learn", "understand", "think", "decide", "choose",
                    "intelligent", "smart", "ai-powered", "neural",
                    "adapt", "evolve", "improve", "train"
                )
                
                # Check steps
                foreach ( in .Steps) {
                     = (.StepName + .Explanation + .RuleApplied) -join " "
                    foreach ( in ) {
                        if ( -match "\b\b") {
                            return False
                        }
                    }
                }
                
                # Check results
                foreach ( in .Results) {
                    if (.Explanation) {
                        foreach ( in ) {
                            if (.Explanation -match "\b\b") {
                                return False
                            }
                        }
                    }
                }
                
                return True
            },
            "System language implies AI learning or intelligence beyond deterministic rules",
            True
        )
        .RegisterInvariant()
        
        # 6. No ranking changes without input changes
         = [SystemInvariant]::new(
            "DeterministicRanking",
            "Identical inputs must produce identical rankings",
            {
                param()
                if (-not .ReplayResults) { return True }
                
                 = .Results | ForEach-Object { .TrainerId }
                 = .ReplayResults | ForEach-Object { .TrainerId }
                
                if (.Count -ne .Count) {
                    return False
                }
                
                for ( = 0;  -lt .Count; ++) {
                    if ([] -ne []) {
                        return False
                    }
                }
                
                return True
            },
            "Non-deterministic ranking detected",
            True
        )
        .RegisterInvariant()
    }
    
    [hashtable] AssertAllInvariants() {
         = @{
            TotalInvariants = .Invariants.Count
            CriticalInvariants = (.Invariants | Where-Object { .IsCritical }).Count
            TestResults = @()
            AllPassed = True
            CriticalPassed = True
            Failures = @()
            CriticalFailures = @()
        }
        
        foreach ( in .Invariants) {
             = .Test()
            .TestResults += 
            
            if (-not .Success) {
                .AllPassed = False
                 = @{
                    Name = .Name
                    Message = .Message
                    IsCritical = .IsCritical
                }
                .Failures += 
                
                if (.IsCritical) {
                    .CriticalPassed = False
                    .CriticalFailures += 
                }
            }
        }
        
        return 
    }
    
    [void] AssertInvariantsOrFail() {
         = .AssertAllInvariants()
        
        Write-Host "
=== INVARIANT ASSERTION LAYER ===" -ForegroundColor Magenta
        Write-Host "Testing  system invariants..." -ForegroundColor Cyan
        
        foreach ( in .TestResults) {
             = if (.Success) { "Green" } else { "Red" }
             = if (.Success) { "✓" } else { "✗" }
             = if (.IsCritical) { " [CRITICAL]" } else { "" }
            Write-Host "    : " -ForegroundColor 
        }
        
        if (-not .CriticalPassed) {
            Write-Host "
❌ CRITICAL INVARIANT VIOLATIONS DETECTED" -ForegroundColor Red
            Write-Host "System execution must stop." -ForegroundColor Red
            
            if (.CriticalFailures -and .CriticalFailures.Count -gt 0) {
                foreach ( in .CriticalFailures) {
                    Write-Host "  - : " -ForegroundColor Red
                }
                 = .CriticalFailures[0]
                throw "CRITICAL SYSTEM INVARIANT VIOLATION: "
            } else {
                throw "CRITICAL SYSTEM INVARIANT VIOLATION: Unknown error"
            }
        }
        
        if (-not .AllPassed) {
            Write-Host "
⚠ NON-CRITICAL INVARIANT VIOLATIONS DETECTED" -ForegroundColor Yellow
            Write-Host "System continues but audit flag raised." -ForegroundColor Yellow
        }
        
        if (.AllPassed) {
            Write-Host "
✅ ALL INVARIANTS PASSED" -ForegroundColor Green
            Write-Host "System boundaries are intact." -ForegroundColor Green
        }
        
        Write-Host ""
    }
}

function New-InvariantAssertionEngine {
    return [InvariantAssertionEngine]::new()
}

function Test-SystemInvariants {
    Write-Host "
=== PHASE 74.3 INVARIANT ASSERTION SYSTEM TEST ===" -ForegroundColor Magenta
    
     = New-InvariantAssertionEngine
    
    # Test 1: Valid match data (should pass)
    Write-Host "
Test 1: Valid Match Data" -ForegroundColor Cyan
     = @{
        Steps = @(
            @{
                StepName = "Hard Filter: Active Status"
                StepNumber = 1
            },
            @{
                StepName = "Hard Filter: Verification"
                StepNumber = 2
            },
            @{
                StepName = "Score Calculation"
                StepNumber = 3
            }
        )
        Configuration = @{
            ScoringWeights = @{
                Goals = 0.3
                Experience = 0.25
            }
        }
        Results = @(
            @{ TrainerId = "T1"; Score = 95; Confidence = 0.9; Explanation = "Good match based on goals" },
            @{ TrainerId = "T2"; Score = 85; Confidence = 0.8; Explanation = "Compatible experience" }
        )
    }
    
    try {
        .AssertInvariantsOrFail()
        Write-Host "✓ Test 1 PASSED: Valid data accepted" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Test 1 FAILED: Valid data rejected" -ForegroundColor Red
        Write-Host "  Error: " -ForegroundColor Red
    }
    
    # Test 2: Invalid order (hard filters after scoring)
    Write-Host "
Test 2: Invalid Step Order" -ForegroundColor Cyan
     = @{
        Steps = @(
            @{
                StepName = "Score Calculation"
                StepNumber = 1
            },
            @{
                StepName = "Hard Filter: Active Status"
                StepNumber = 2
            }
        )
        Configuration = @{
            ScoringWeights = @{
                Goals = 0.3
                Experience = 0.25
            }
        }
        Results = @(
            @{ TrainerId = "T1"; Score = 95; Confidence = 0.9; Explanation = "Good match" }
        )
    }
    
    try {
        .AssertInvariantsOrFail()
        Write-Host "✗ Test 2 FAILED: Should have caught invalid order" -ForegroundColor Red
    }
    catch {
        Write-Host "✓ Test 2 PASSED: Correctly caught invalid step order" -ForegroundColor Green
    }
    
    # Test 3: Confidence exceeds bounds
    Write-Host "
Test 3: Confidence Bound Violation" -ForegroundColor Cyan
     = @{
        Steps = @(
            @{
                StepName = "Hard Filter: Active Status"
                StepNumber = 1
            },
            @{
                StepName = "Score Calculation"
                StepNumber = 2
            }
        )
        Configuration = @{
            ScoringWeights = @{
                Goals = 0.3
                Experience = 0.25
            }
        }
        Results = @(
            @{ TrainerId = "T1"; Score = 30; Confidence = 0.95; Explanation = "Low score but high confidence" }
        )
    }
    
    try {
        .AssertInvariantsOrFail()
        Write-Host "✗ Test 3 FAILED: Should have caught confidence violation" -ForegroundColor Red
    }
    catch {
        Write-Host "✓ Test 3 PASSED: Correctly caught confidence bound violation" -ForegroundColor Green
    }
    
    # Test 4: Forbidden AI language
    Write-Host "
Test 4: Forbidden Language Detection" -ForegroundColor Cyan
     = @{
        Steps = @(
            @{
                StepName = "Hard Filter"
                StepNumber = 1
                Explanation = "The AI learned to filter inactive users"
                RuleApplied = "AI decision"
            }
        )
        Configuration = @{
            ScoringWeights = @{
                Goals = 0.3
            }
        }
        Results = @(
            @{ TrainerId = "T1"; Score = 80; Confidence = 0.7; Explanation = "AI thinks this is a good match" }
        )
    }
    
    try {
        .AssertInvariantsOrFail()
        Write-Host "✗ Test 4 FAILED: Should have caught AI language" -ForegroundColor Red
    }
    catch {
        Write-Host "✓ Test 4 PASSED: Correctly caught forbidden AI language" -ForegroundColor Green
    }
    
    # Test 5: Contradictory explanations
    Write-Host "
Test 5: Explanation Consistency" -ForegroundColor Cyan
     = @{
        Steps = @(
            @{
                StepName = "Hard Filter"
                StepNumber = 1
            },
            @{
                StepName = "Score Calculation"
                StepNumber = 2
            }
        )
        Configuration = @{
            ScoringWeights = @{
                Goals = 0.3
            }
        }
        Results = @(
            @{ TrainerId = "T2"; Score = 85; Confidence = 0.8; Explanation = "Second best" },
            @{ TrainerId = "T1"; Score = 95; Confidence = 0.9; Explanation = "Best match" }
        )
    }
    
    try {
        .AssertInvariantsOrFail()
        Write-Host "✗ Test 5 FAILED: Should have caught ranking contradiction" -ForegroundColor Red
    }
    catch {
        Write-Host "✓ Test 5 PASSED: Correctly caught ranking contradiction" -ForegroundColor Green
    }
    
    Write-Host "
=== INVARIANT TESTING COMPLETE ===" -ForegroundColor Magenta
    
    return @{
        Engine = 
        TestsRun = 5
    }
}

# Export functions
Export-ModuleMember -Function New-InvariantAssertionEngine, Test-SystemInvariants
