# SAFE-CLEANUP.ps1
# Safe cleanup for FitMatch project - REVIEW BEFORE RUNNING

Write-Host "=== SAFE CLEANUP SCRIPT ==="
Write-Host "This script performs SAFE operations only"
Write-Host ""

# 1. List backup files (DOES NOT DELETE)
Write-Host "1. Backup files found:"
Get-ChildItem -Recurse -Filter "*.backup*" -File | Select-Object -First 10 FullName

# 2. List empty directories (DOES NOT DELETE)
Write-Host "`n2. Empty directories found:"
Get-ChildItem -Recurse -Directory | Where-Object { 
    (Get-ChildItem $_.FullName -Recurse -File).Count -eq 0 
} | Select-Object -First 10 FullName

# 3. List legacy src/ directory contents
Write-Host "`n3. Legacy src/ directory contents:"
if (Test-Path "src") {
    Get-ChildItem "src" -Recurse | Select-Object -First 10 FullName
} else {
    Write-Host "  src/ directory not found"
}

# 4. List PhaseXX components
Write-Host "`n4. PhaseXX components found:"
Get-ChildItem -Recurse -Filter "*Phase*" -Directory | Select-Object -First 10 FullName

Write-Host "`n=== NEXT STEPS ==="
Write-Host "Review the lists above, then manually delete if safe"
Write-Host "Recommended order:"
Write-Host "  1. *.backup files"
Write-Host "  2. Empty directories (except app/, .next/)"
Write-Host "  3. src/ directory (after verifying migration)"
Write-Host "  4. PhaseXX components"
