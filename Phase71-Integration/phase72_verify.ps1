# PHASE 72 VERIFICATION SCRIPT
# Founder & Steel Verification - Complete Test Suite

param(
    [switch]$RunTests,
    [switch]$GenerateReport,
    [string]$OutputPath = ".\phase72-verification-results.txt"
)

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n$(Get-Date -Format 'HH:mm:ss') - $Message" -ForegroundColor $Color
}

function Write-Result {
    param([string]$Message, [bool]$Success)
    $symbol = if ($Success) { "✓" } else { "✗" }
    $color = if ($Success) { "Green" } else { "Red" }
    Write-Host "   $symbol $Message" -ForegroundColor $color
    return $Success
}

# Initialize results
$results = @{
    StartTime = Get-Date
    Tests = @()
    SuccessCount = 0
    TotalTests = 0
}

function Add-TestResult {
    param([string]$TestName, [bool]$Success, [string]$Details)
    $result = @{
        TestName = $TestName
        Success = $Success
        Details = $Details
        Timestamp = Get-Date
    }
    $results.Tests += $result
    $results.TotalTests++
    if ($Success) { $results.SuccessCount++ }
    
    Write-Result -Message $TestName -Success $Success
    if (-not $Success -and $Details) {
        Write-Host "      Details: $Details" -ForegroundColor Yellow
    }
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "PHASE 72 - FOUNDER & STEEL VERIFICATION" -ForegroundColor Green
Write-Host "Start Time: $($results.StartTime)" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# 1. ENVIRONMENT CHECK
Write-Step "1. ENVIRONMENT CHECK"
Add-TestResult -TestName "PowerShell Version" -Success ($PSVersionTable.PSVersion.Major -ge 5) -Details "PS Version: $($PSVersionTable.PSVersion)"
Add-TestResult -TestName "Node.js Installed" -Success ($null -ne (Get-Command node -ErrorAction SilentlyContinue)) -Details "Check if Node.js is in PATH"
Add-TestResult -TestName "npm Installed" -Success ($null -ne (Get-Command npm -ErrorAction SilentlyContinue)) -Details "Check if npm is in PATH"

if ((Get-Command node -ErrorAction SilentlyContinue)) {
    $nodeVersion = node --version
    Add-TestResult -TestName "Node Version Check" -Success ($nodeVersion -match "^v\d") -Details "Node version: $nodeVersion"
}

# 2. PROJECT STRUCTURE VERIFICATION
Write-Step "2. PROJECT STRUCTURE VERIFICATION"
Add-TestResult -TestName "Phase 71 Directory Exists" -Success (Test-Path ".") -Details "Current directory: $(Get-Location)"
Add-TestResult -TestName "Source Code Exists" -Success (Test-Path ".\src\phase71_integration.ts") -Details "Main integration file check"
Add-TestResult -TestName "Package.json Exists" -Success (Test-Path ".\package.json") -Details "Project configuration file"
Add-TestResult -TestName "Scripts Directory" -Success (Test-Path ".\scripts\") -Details "Verification scripts location"

# 3. DEPENDENCY CHECK
Write-Step "3. DEPENDENCY CHECK"
Add-TestResult -TestName "Node Modules" -Success (Test-Path ".\node_modules") -Details "Dependencies installed"
Add-TestResult -TestName "TypeScript Installed" -Success ((Test-Path ".\node_modules\typescript") -or (Get-Command tsc -ErrorAction SilentlyContinue)) -Details "TypeScript compiler check"

# 4. BUILD STATUS
Write-Step "4. BUILD STATUS"
Add-TestResult -TestName "TypeScript Config" -Success (Test-Path ".\tsconfig.json") -Details "TypeScript configuration"
Add-TestResult -TestName "Distribution Directory" -Success (Test-Path ".\dist") -Details "Build output directory"
Add-TestResult -TestName "Phase 71 Built" -Success (Test-Path ".\dist\phase71_integration.js") -Details "Compiled integration module"

# 5. PHASE INTEGRATION CHECK
Write-Step "5. PHASE INTEGRATION CHECK"
$phase69Path = "$((Get-Item .).Parent.FullName)\Phase69-Ranking"
Add-TestResult -TestName "Phase 69 Exists" -Success (Test-Path $phase69Path) -Details "Path: $phase69Path"

if (Test-Path $phase69Path) {
    Add-TestResult -TestName "Phase 69 Source" -Success (Test-Path "$phase69Path\src\rankingEngine.ts") -Details "Ranking engine source"
    Add-TestResult -TestName "Phase 69 Built" -Success (Test-Path "$phase69Path\dist\rankingEngine.js") -Details "Compiled ranking engine"
    
    Add-TestResult -TestName "Phase 70 Exists" -Success (Test-Path "$phase69Path\Phase70-Disclosure") -Details "Disclosure module location"
}

# Generate summary
Write-Step "VERIFICATION SUMMARY" -Color "Magenta"
$successRate = if ($results.TotalTests -gt 0) { [math]::Round(($results.SuccessCount / $results.TotalTests) * 100, 2) } else { 0 }
Write-Host "   Tests Run: $($results.TotalTests)" -ForegroundColor White
Write-Host "   Passed: $($results.SuccessCount)" -ForegroundColor Green
Write-Host "   Failed: $($results.TotalTests - $results.SuccessCount)" -ForegroundColor Red
Write-Host "   Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

# Save report if requested
if ($GenerateReport) {
    $report = @"
PHASE 72 VERIFICATION REPORT
============================
Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Duration: $((Get-Date) - $results.StartTime)
Success Rate: $successRate% ($($results.SuccessCount)/$($results.TotalTests))

DETAILED RESULTS:
$(($results.Tests | ForEach-Object { 
    "$(if ($_.Success) {'[PASS]'} else {'[FAIL]'}) $($_.TestName)"
    if (-not $_.Success -and $_.Details) { "    Details: $($_.Details)" }
    ""
}) -join "`n")

RECOMMENDATIONS:
$(if ($results.SuccessCount -eq $results.TotalTests) {
    "All checks passed. Proceed with deterministic testing phase."
} else {
    "Address failed checks before proceeding with full verification."
})
"@
    
    $report | Out-File -FilePath $OutputPath -Encoding UTF8
    Write-Step "Report saved to: $OutputPath" -Color "Green"
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "VERIFICATION COMPLETE" -ForegroundColor Green
Write-Host "End Time: $(Get-Date)" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Return exit code based on success
exit $(if ($results.SuccessCount -eq $results.TotalTests) { 0 } else { 1 })
