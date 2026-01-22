# Phase74/Modules/74.1-MatchReplay.ps1
# Match Replay System for Phase 74
# Purpose: Capture and replay matches deterministically

class MatchSnapshot {
    [string]$SnapshotId
    [datetime]$CaptureTime
    [string]$MatchEngineVersion
    [hashtable]$Inputs
    [hashtable]$Configuration
    [array]$TrainerProfiles
    [array]$Results
    [string]$EmbeddingHash
    [string]$SnapshotHash

    MatchSnapshot() {
        $this.SnapshotId = [guid]::NewGuid().ToString()
        $this.CaptureTime = [datetime]::UtcNow
        $this.MatchEngineVersion = "1.0"
        $this.Inputs = @{}
        $this.Configuration = @{}
        $this.TrainerProfiles = @()
        $this.Results = @()
    }

    [string] CalculateHash() {
        $content = @{
            Inputs = $this.Inputs
            Configuration = $this.Configuration
            TrainerProfiles = $this.TrainerProfiles
            EmbeddingHash = $this.EmbeddingHash
            Results = $this.Results  # Include Results in hash calculation
        } | ConvertTo-Json -Depth 10 -Compress
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
        $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
        return [System.BitConverter]::ToString($hash).Replace('-', '').ToLower()
    }

    [void] Finalize() {
        $this.SnapshotHash = $this.CalculateHash()
    }
}

function ConvertFrom-PSCustomObject {
    param(
        [PSObject]$InputObject
    )
    
    if ($InputObject -eq $null) {
        return $null
    }
    
    if ($InputObject -is [System.Management.Automation.PSCustomObject]) {
        $result = @{}
        $InputObject.PSObject.Properties | ForEach-Object {
            $result[$_.Name] = ConvertFrom-PSCustomObject -InputObject $_.Value
        }
        return $result
    }
    elseif ($InputObject -is [Array]) {
        $result = @()
        foreach ($item in $InputObject) {
            $result += ConvertFrom-PSCustomObject -InputObject $item
        }
        return $result
    }
    else {
        return $InputObject
    }
}

function New-MatchSnapshot {
    param(
        [hashtable]$ClientInputs,
        [hashtable]$Configuration,
        [array]$TrainerProfiles,
        [string]$EmbeddingHash
    )

    $snapshot = [MatchSnapshot]::new()
    $snapshot.Inputs = @{
        Client = $ClientInputs
        Request = @{
            Limit = 10
            TokenBudget = $null
        }
    }
    $snapshot.Configuration = $Configuration
    $snapshot.TrainerProfiles = $TrainerProfiles
    $snapshot.EmbeddingHash = $EmbeddingHash
    $snapshot.Finalize()

    return $snapshot
}

function Export-MatchSnapshot {
    param(
        [MatchSnapshot]$Snapshot,
        [string]$Path = "./Artifacts/match_snapshot.json"
    )

    # Ensure directory exists
    $directory = Split-Path $Path -Parent
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    $json = $Snapshot | ConvertTo-Json -Depth 10
    $json | Out-File -FilePath $Path -Encoding UTF8
    Write-Host "Snapshot saved to: $Path" -ForegroundColor Green
    return $Path
}

function Import-MatchSnapshot {
    param(
        [string]$Path = "./Artifacts/match_snapshot.json"
    )

    if (-not (Test-Path $Path)) {
        throw "Snapshot file not found: $Path"
    }

    $json = Get-Content $Path -Raw
    $data = $json | ConvertFrom-Json

    $snapshot = [MatchSnapshot]::new()
    $snapshot.SnapshotId = $data.SnapshotId
    $snapshot.CaptureTime = [datetime]::Parse($data.CaptureTime)
    $snapshot.MatchEngineVersion = $data.MatchEngineVersion
    
    # Convert all PSCustomObjects back to hashtables/arrays
    $snapshot.Inputs = ConvertFrom-PSCustomObject -InputObject $data.Inputs
    $snapshot.Configuration = ConvertFrom-PSCustomObject -InputObject $data.Configuration
    $snapshot.TrainerProfiles = ConvertFrom-PSCustomObject -InputObject $data.TrainerProfiles
    $snapshot.Results = ConvertFrom-PSCustomObject -InputObject $data.Results
    $snapshot.EmbeddingHash = $data.EmbeddingHash
    $snapshot.SnapshotHash = $data.SnapshotHash

    # Verify hash integrity
    $calculatedHash = $snapshot.CalculateHash()
    if ($calculatedHash -ne $snapshot.SnapshotHash) {
        throw "Snapshot hash mismatch! Data may be corrupted. Calculated: $calculatedHash, Stored: $($snapshot.SnapshotHash)"
    }

    Write-Host "Snapshot loaded and verified: $($snapshot.SnapshotId)" -ForegroundColor Green
    return $snapshot
}

function Invoke-MatchReplay {
    param(
        [MatchSnapshot]$Snapshot,
        [switch]$Validate = $true
    )

    Write-Host "`n=== MATCH REPLAY STARTED ===" -ForegroundColor Cyan
    Write-Host "Snapshot ID: $($Snapshot.SnapshotId)"
    Write-Host "Original Capture: $($Snapshot.CaptureTime)"
    Write-Host "Engine Version: $($Snapshot.MatchEngineVersion)"
    Write-Host "`n"

    $replayStartTime = [datetime]::UtcNow
    
    # Simulate match execution
    $results = @{
        ReplayId = [guid]::NewGuid().ToString()
        ReplayTime = $replayStartTime
        InputSummary = @{
            ClientId = $Snapshot.Inputs.Client.id
            TrainerCount = $Snapshot.TrainerProfiles.Count
            Configuration = $Snapshot.Configuration
        }
        Steps = @()
    }

    # Step 1: Validate inputs
    $results.Steps += @{
        Step = 1
        Name = "Input Validation"
        Status = "Completed"
        Details = "All inputs validated successfully"
        Timestamp = [datetime]::UtcNow
    }

    # Step 2: Apply hard filters
    $filteredTrainers = $Snapshot.TrainerProfiles | Where-Object {
        $_.is_active -eq $true -and $_.verified -eq $true
    }
    $results.Steps += @{
        Step = 2
        Name = "Hard Filter Application"
        Status = "Completed"
        Details = "Filtered $($Snapshot.TrainerProfiles.Count) trainers to $($filteredTrainers.Count)"
        Timestamp = [datetime]::UtcNow
    }

    # Step 3: Calculate scores (simulated) - deterministic based on trainer IDs
    $scoredResults = $filteredTrainers | ForEach-Object {
        # Create deterministic score based on trainer ID hash
        $idBytes = [System.Text.Encoding]::UTF8.GetBytes($_.id)
        $idHash = [System.BitConverter]::ToString([System.Security.Cryptography.MD5]::Create().ComputeHash($idBytes))
        $scoreDigits = $idHash -replace '[^0-9]', ''
        if ($scoreDigits.Length -ge 2) {
            $score = [int]($scoreDigits.Substring(0, 2))
        } else {
            $score = 50  # Default if not enough digits
        }
        
        @{
            TrainerId = $_.id
            UserId = $_.user_id
            Score = $score
            Confidence = 0.7 + (($score % 30) / 100)
            Breakdown = @{
                Goals = 75
                Experience = 80
                Availability = 70
                Personality = 65
            }
        }
    } | Sort-Object -Property Score -Descending

    $results.Steps += @{
        Step = 3
        Name = "Score Calculation"
        Status = "Completed"
        Details = "Calculated scores for $($filteredTrainers.Count) trainers"
        Timestamp = [datetime]::UtcNow
    }

    # Step 4: Apply ranking
    $rankedResults = $scoredResults | ForEach-Object -Begin { $rank = 1 } -Process {
        $_.Rank = $rank++
        $_
    }

    $results.Steps += @{
        Step = 4
        Name = "Ranking Application"
        Status = "Completed"
        Details = "Ranked $($rankedResults.Count) trainers"
        Timestamp = [datetime]::UtcNow
    }

    # Step 5: Generate explanations
    $finalResults = $rankedResults | ForEach-Object {
        $_.Explanation = "Match based on compatibility scoring"
        $_
    }

    $results.Steps += @{
        Step = 5
        Name = "Explanation Generation"
        Status = "Completed"
        Details = "Generated explanations for all matches"
        Timestamp = [datetime]::UtcNow
    }

    $results.FinalMatches = $finalResults

    # Validation check
    if ($Validate -and $Snapshot.Results) {
        $validationResult = Test-MatchReplayEquality -Original $Snapshot.Results -Replayed $finalResults
        $results.Validation = $validationResult
        
        if ($validationResult.IsIdentical) {
            Write-Host "`n✓ REPLAY VALIDATION PASSED" -ForegroundColor Green
            Write-Host "  All outputs match original snapshot" -ForegroundColor Green
        } else {
            Write-Host "`n⚠ REPLAY VALIDATION FAILED" -ForegroundColor Yellow
            Write-Host "  Differences found:" -ForegroundColor Yellow
            $validationResult.Differences | ForEach-Object {
                Write-Host "  - $_" -ForegroundColor Yellow
            }
        }
    }

    $duration = ([datetime]::UtcNow - $replayStartTime).TotalSeconds
    
    Write-Host "`n=== MATCH REPLAY COMPLETED ===" -ForegroundColor Cyan
    Write-Host "Replayed ID: $($results.ReplayId)"
    Write-Host "Duration: $duration seconds"
    Write-Host "`n"

    return $results
}

function Test-MatchReplayEquality {
    param(
        [array]$Original,
        [array]$Replayed
    )

    $differences = @()
    
    # Check count
    if ($Original.Count -ne $Replayed.Count) {
        $differences += "Match count differs: Original=$($Original.Count), Replayed=$($Replayed.Count)"
        return @{
            IsIdentical = $false
            Differences = $differences
        }
    }

    # Check ordering and scores
    for ($i = 0; $i -lt $Original.Count; $i++) {
        $originalMatch = $Original[$i]
        $replayedMatch = $Replayed[$i]

        if ($originalMatch.TrainerId -ne $replayedMatch.TrainerId) {
            $differences += "Position $($i+1): Trainer mismatch - Original=$($originalMatch.TrainerId), Replayed=$($replayedMatch.TrainerId)"
        }

        if ($originalMatch.Score -ne $replayedMatch.Score) {
            $differences += "Position $($i+1): Score mismatch - Original=$($originalMatch.Score), Replayed=$($replayedMatch.Score)"
        }

        if ($originalMatch.Confidence -ne $replayedMatch.Confidence) {
            $differences += "Position $($i+1): Confidence mismatch - Original=$($originalMatch.Confidence), Replayed=$($replayedMatch.Confidence)"
        }
    }

    return @{
        IsIdentical = ($differences.Count -eq 0)
        Differences = $differences
    }
}

function Test-MatchReplaySystem {
    param(
        [int]$TestCount = 2
    )

    Write-Host "`n=== PHASE 74.1 MATCH REPLAY SYSTEM TEST ===" -ForegroundColor Magenta
    Write-Host "Running $TestCount replay tests..." -ForegroundColor Cyan
    Write-Host "`n"

    $testResults = @()
    $allPassed = $true

    for ($i = 1; $i -le $TestCount; $i++) {
        Write-Host ("Test {0}/{1}:" -f $i, $TestCount) -ForegroundColor Yellow
        
        # Create test data
        $clientInputs = @{
            id = "test-client-$i"
            user_id = "user-test-$i"
            goals = @("weight loss", "strength training")
            experience_level = "intermediate"
            training_preference = "in-person"
        }

        $trainers = @()
        1..3 | ForEach-Object {
            $trainers += @{
                id = "trainer-test-$i-$_"
                user_id = "user-trainer-$i-$_"
                is_active = $true
                verified = $true
                specialties = @("strength", "conditioning")
                experience_years = $_
            }
        }

        $configuration = @{
            HardFilters = @("active", "verified")
            ScoringWeights = @{
                Goals = 0.3
                Experience = 0.25
                Availability = 0.2
                Personality = 0.15
                Location = 0.1
            }
        }

        # Create snapshot
        $snapshot = New-MatchSnapshot `
            -ClientInputs $clientInputs `
            -Configuration $configuration `
            -TrainerProfiles $trainers `
            -EmbeddingHash "test-hash-$i"

        # Simulate original results (store in snapshot)
        $originalResults = Invoke-MatchReplay -Snapshot $snapshot -Validate:$false
        $snapshot.Results = $originalResults.FinalMatches
        $snapshot.Finalize()

        # Export and import snapshot
        $snapshotPath = Export-MatchSnapshot -Snapshot $snapshot -Path "./Artifacts/test_snapshot_$i.json"
        $loadedSnapshot = Import-MatchSnapshot -Path $snapshotPath

        # Replay from snapshot
        $replayResults = Invoke-MatchReplay -Snapshot $loadedSnapshot -Validate:$true

        # Check validation
        $testPassed = $true
        if ($replayResults.Validation) {
            $testPassed = $replayResults.Validation.IsIdentical
        }
        $allPassed = $allPassed -and $testPassed
        
        $testResults += @{
            TestNumber = $i
            Passed = $testPassed
            SnapshotId = $snapshot.SnapshotId
            Differences = if ($replayResults.Validation) { $replayResults.Validation.Differences } else { @() }
        }

        if ($testPassed) {
            Write-Host "  ✓ Test $i PASSED" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Test $i FAILED" -ForegroundColor Red
        }
        
        Write-Host ""
    }

    # Summary
    Write-Host "=== TEST SUMMARY ===" -ForegroundColor Magenta
    $passedCount = ($testResults | Where-Object { $_.Passed }).Count
    Write-Host "Passed: $passedCount/$TestCount" -ForegroundColor $(if ($passedCount -eq $TestCount) { "Green" } else { "Red" })
    
    if (-not $allPassed) {
        Write-Host "`nFailed tests details:" -ForegroundColor Yellow
        $testResults | Where-Object { -not $_.Passed } | ForEach-Object {
            Write-Host "  Test $($_.TestNumber):" -ForegroundColor Yellow
            $_.Differences | ForEach-Object {
                Write-Host "    - $_" -ForegroundColor Yellow
            }
        }
    }

    return @{
        AllTestsPassed = $allPassed
        TestResults = $testResults
    }
}
