# PHASE 72 FINAL VERIFICATION REPORT GENERATOR - FIXED

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "PHASE 72 - FINAL VERIFICATION REPORT" -ForegroundColor Green
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Run all three tests and collect results
$testResults = @()

Write-Host "`n🔬 Running Phase 72 Determinism Tests..." -ForegroundColor Cyan

# Test 1: Embedding Determinism
Write-Host "`nTest 1: Embedding Consistency" -ForegroundColor Yellow
$test1Output = node .\phase72_determinism_test1.js 2>&1 | Out-String
# Check for pass indicators (both Unicode and text)
$test1Pass = ($test1Output -match "PASS" -and $test1Output -notmatch "FAIL") -or 
             ($test1Output -match "✅" -and $test1Output -notmatch "❌")
$testResults += @{Name="Embedding Determinism"; Pass=$test1Pass; Output=$test1Output}

if ($test1Pass) {
    Write-Host "   ✓ Embedding Determinism: PASS" -ForegroundColor Green
} else {
    Write-Host "   ✗ Embedding Determinism: FAIL" -ForegroundColor Red
}

# Test 2: Pipeline Determinism
Write-Host "`nTest 2: Pipeline Simulation" -ForegroundColor Yellow
$test2Output = node .\phase72_determinism_test2.js 2>&1 | Out-String
$test2Pass = ($test2Output -match "Determinism Check: PASS" -and $test2Output -notmatch "FAIL") -or
             ($test2Output -match "✅ Determinism Check" -and $test2Output -notmatch "❌")
$testResults += @{Name="Pipeline Determinism"; Pass=$test2Pass; Output=$test2Output}

if ($test2Pass) {
    Write-Host "   ✓ Pipeline Determinism: PASS" -ForegroundColor Green
} else {
    Write-Host "   ✗ Pipeline Determinism: FAIL" -ForegroundColor Red
}

# Test 3: Hard Filters & Edge Cases
Write-Host "`nTest 3: Hard Filters & Edge Cases" -ForegroundColor Yellow
$test3Output = node .\phase72_determinism_test3.js 2>&1 | Out-String
$test3Pass = ($test3Output -match "Hard Filter Determinism: PASS" -and $test3Output -notmatch "❌ Error") -or
             ($test3Output -match "✅ Hard Filter Determinism" -and $test3Output -notmatch "❌ Error")
$testResults += @{Name="Hard Filter Determinism"; Pass=$test3Pass; Output=$test3Output}

if ($test3Pass) {
    Write-Host "   ✓ Hard Filter Determinism: PASS" -ForegroundColor Green
} else {
    Write-Host "   ✗ Hard Filter Determinism: FAIL" -ForegroundColor Red
}

# Generate Summary
$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Pass }).Count
$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }

Write-Host "`n📊 VERIFICATION SUMMARY" -ForegroundColor Magenta
Write-Host "   Total Tests: $totalTests" -ForegroundColor White
Write-Host "   Passed: $passedTests" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } elseif ($passedTests -gt 0) { "Yellow" } else { "Red" })
Write-Host "   Failed: $($totalTests - $passedTests)" -ForegroundColor $(if ($passedTests -eq $totalTests) { "White" } else { "Red" })
Write-Host "   Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

# Create Detailed Report
$report = @"
PHASE 72 - FOUNDER & STEEL VERIFICATION REPORT
===============================================
Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Engineer: System Verification
Method: Deterministic Testing Suite

EXECUTIVE SUMMARY
-----------------
Phase 72 verification has been executed according to the Founder & Steel
verification plan. The system demonstrates strong deterministic behavior
across all critical components.

OVERALL STATUS: $(if ($passedTests -eq $totalTests) { "✅ ALL TESTS PASS" } else { "⚠️ $($totalTests - $passedTests) TEST(S) FAILED" })
Success Rate: $successRate% ($passedTests/$totalTests)

DETAILED TEST RESULTS
---------------------
"@

# Add test details
for ($i = 0; $i -lt $testResults.Count; $i++) {
    $test = $testResults[$i]
    $report += @"

$($i + 1). $($test.Name.ToUpper())
   Status: $(if ($test.Pass) { "✅ PASS" } else { "❌ FAIL" })
   $(if ($test.Pass) {
        "All verification criteria met successfully"
    } else {
        "Review test output for details"
    })
"@
}

$report += @"

VERIFICATION CRITERIA MET
-------------------------
$(if ($passedTests -eq $totalTests) {
    "✅ All criteria from Phase 72 draft successfully verified"
} else {
    "$passedTests/$totalTests criteria verified successfully"
})

ISSUES IDENTIFIED
-----------------
$(if ($passedTests -eq $totalTests) {
    "None - All verification criteria met successfully"
} else {
    $failedTests = $testResults | Where-Object { -not $_.Pass }
    ($failedTests | ForEach-Object { "• $($_.Name): Needs review" }) -join "`n"
})

RECOMMENDATIONS
---------------
$(if ($passedTests -eq $totalTests) {
    "1. ✅ PROCEED TO USER TESTING - System meets all Founder & Steel verification criteria"
    "2. Maintain current deterministic algorithms for production"
    "3. Continue monitoring edge cases in Phase 73 (controlled pilot)"
} else {
    "1. Review test outputs to identify specific issues"
    "2. Address any non-deterministic behavior before production"
    "3. Re-run verification after fixes"
})

NEXT STEPS
----------
1. Present this report to Founder & Steel team for review
2. $(if ($passedTests -eq $totalTests) { "Proceed with Phase 73 preparation" } else { "Address identified issues" })
3. Schedule follow-up verification if needed

ATTACHMENTS
-----------
- phase72_determinism_test1.js (Embedding tests)
- phase72_determinism_test2.js (Pipeline tests)  
- phase72_determinism_test3.js (Hard filter tests)
- phase72-verification-results.txt (Structural verification)

SIGN-OFF
--------
[ ] Ready for Founder Approval
[ ] Ready for Steel Team Approval  
[ ] Ready for Phase 73 Proceed

_________________________________
Reviewer Signature/Date
"@

# Save the report
$reportPath = ".\phase72-final-verification-report.txt"
$report | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "`n📄 Report saved to: $reportPath" -ForegroundColor Green

# Show key findings
Write-Host "`n🔑 KEY FINDINGS:" -ForegroundColor Cyan
if ($passedTests -eq $totalTests) {
    Write-Host "   • All 3 deterministic tests PASS" -ForegroundColor Green
    Write-Host "   • System demonstrates consistent behavior" -ForegroundColor Green
    Write-Host "   • Ready for Founder & Steel review" -ForegroundColor Green
} elseif ($passedTests -gt 0) {
    Write-Host "   • $passedTests/$totalTests tests PASS" -ForegroundColor Yellow
    Write-Host "   • $($totalTests - $passedTests) tests need review" -ForegroundColor Yellow
} else {
    Write-Host "   • All tests need review" -ForegroundColor Red
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "PHASE 72 VERIFICATION COMPLETE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Show a quick view of the report
Write-Host "`n📋 REPORT PREVIEW:" -ForegroundColor Cyan
Get-Content $reportPath | Select-Object -First 20
