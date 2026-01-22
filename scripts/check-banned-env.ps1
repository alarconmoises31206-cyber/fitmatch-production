# scripts/check-banned-env.ps1
Write-Host "CI Check: Banned Environment Variables" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$bannedVariables = @(
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'ADMIN_SECRET_TOKEN',
    'VAULT_ADDR',
    'VAULT_TOKEN',
    'VAULT_SECRET_PATH'
)

Write-Host "Checking for direct process.env usage of banned variables..." -ForegroundColor Yellow

$foundIssues = @()
$filesChecked = 0

# Get all TypeScript/JavaScript files
$files = Get-ChildItem -Path . -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
          Where-Object { 
            $_.FullName -notmatch "\\node_modules\\" -and 
            $_.FullName -notmatch "\\\.next\\" -and 
            $_.FullName -notmatch "\\\.git\\" -and
            $_.FullName -notmatch "\\out\\" -and
            $_.FullName -notmatch "\\dist\\" -and
            $_.FullName -notmatch "\\secrets-sync.ts" -and  # Our new file is allowed
            $_.FullName -notmatch "\\secrets.ts"            # Our secrets abstraction is allowed
          }

foreach ($file in $files) {
    $filesChecked++
    $content = [System.IO.File]::ReadAllText((Convert-Path $file.FullName))
    
    foreach ($bannedVar in $bannedVariables) {
        # Check for process.env.VAR_NAME
        if ($content -match "process\.env\.$bannedVar\b") {
            $foundIssues += "$($file.FullName): Direct process.env.$bannedVar usage found"
        }
        
        # Check for process.env['VAR_NAME'] and process.env["VAR_NAME"]
        if ($content -match "process\.env\['$bannedVar'\]" -or $content -match "process\.env\[\`"$bannedVar\`"\]") {
            $foundIssues += "$($file.FullName): Direct process.env['$bannedVar'] usage found"
        }
    }
}

Write-Host "`n=== RESULTS ===" -ForegroundColor Green
Write-Host "Files checked: $filesChecked" -ForegroundColor Cyan
Write-Host "Issues found: $($foundIssues.Count)" -ForegroundColor Cyan

if ($foundIssues.Count -gt 0) {
    Write-Host "`n❌ FAILED: Direct process.env usage found for banned variables:" -ForegroundColor Red
    foreach ($issue in $foundIssues) {
        Write-Host "  - $issue" -ForegroundColor Red
    }
    Write-Host "`nThese should be replaced with getSecretSync() from lib/secrets-sync" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`n✅ SUCCESS: No banned direct process.env usage found." -ForegroundColor Green
    exit 0
}
