# PowerShell version of find-env-refs.ps1
param([string]$OutputFile = "PHASE24_ENV_MAP.md")

Write-Host "Searching for process.env references..." -ForegroundColor Cyan

$outputContent = "# PHASE24_ENV_MAP`r`nAuto-generated map of process.env references`r`nGenerated on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`r`n`r`n"

# Find all TypeScript/JavaScript files, excluding node_modules, .next, etc.
$files = Get-ChildItem -Path . -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
          Where-Object { 
            $_.FullName -notmatch "\\node_modules\\" -and 
            $_.FullName -notmatch "\\\.next\\" -and 
            $_.FullName -notmatch "\\\.git\\" -and
            $_.FullName -notmatch "\\out\\" -and
            $_.FullName -notmatch "\\dist\\"
          }

$matchCount = 0
$fileCount = 0

Write-Host "Scanning $($files.Count) files..." -ForegroundColor Yellow

foreach ($file in $files) {
    $fileCount++
    if ($fileCount % 50 -eq 0) {
        Write-Host "Processed $fileCount files..." -ForegroundColor Gray
    }
    
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $lines = $content -split "`r`n|`n|`r"
        
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match "process\.env\.[A-Z0-9_]+") {
                $matchCount++
                $lineNum = $i + 1
                $lineContent = $lines[$i].Trim()
                if ($lineContent.Length -gt 100) {
                    $lineContent = $lineContent.Substring(0, 100) + "..."
                }
                
                # Extract just the relative path from project root
                $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace((Get-Location).Path + "/", "")
                $outputContent += "$relativePath : Line $lineNum : $lineContent`r`n"
            }
        }
    } catch {
        Write-Warning "Could not read $($file.FullName): $_"
    }
}

# Also check for process.env with bracket notation: process.env['KEY']
foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $lines = $content -split "`r`n|`n|`r"
        
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match "process\.env\['[A-Z0-9_]+'\]" -or $lines[$i] -match 'process\.env\["[A-Z0-9_]+"\]') {
                $matchCount++
                $lineNum = $i + 1
                $lineContent = $lines[$i].Trim()
                if ($lineContent.Length -gt 100) {
                    $lineContent = $lineContent.Substring(0, 100) + "..."
                }
                
                $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace((Get-Location).Path + "/", "")
                $outputContent += "$relativePath : Line $lineNum : $lineContent`r`n"
            }
        }
    } catch {
        # Continue
    }
}

Set-Content -Path $OutputFile -Value $outputContent -Encoding UTF8

Write-Host ""
Write-Host "=== RESULTS ===" -ForegroundColor Green
Write-Host "Total files scanned: $fileCount" -ForegroundColor Cyan
Write-Host "Total process.env references found: $matchCount" -ForegroundColor Cyan
Write-Host "Output written to: $OutputFile" -ForegroundColor Cyan
Write-Host ""
