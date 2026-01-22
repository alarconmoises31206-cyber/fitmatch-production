# scripts/codemod-replace-env.ps1 - FIXED VERSION
# Usage: .\codemod-replace-env.ps1 [-Dry] [-Apply]
param(
    [switch]$Dry = $false,
    [switch]$Apply = $false
)

Write-Host "Phase 24: Environment Variable Migration Tool" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

if ($Dry -and $Apply) {
    Write-Host "Error: Cannot use both -Dry and -Apply" -ForegroundColor Red
    exit 1
}

if (-not $Dry -and -not $Apply) {
    Write-Host "Running in dry-run mode by default. Use -Apply to make changes." -ForegroundColor Yellow
    $Dry = $true
}

# Define which environment variables should be migrated
# NEXT_PUBLIC_* should NOT be migrated as they're safe for client-side
$secretsToMigrate = @(
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'ADMIN_SECRET_TOKEN',
    'VAULT_ADDR',
    'VAULT_TOKEN',
    'VAULT_SECRET_PATH'
)

Write-Host "Found 114 files to scan" -ForegroundColor Yellow

$filesToProcess = @(
    "lib\stripe\index.ts",
    "lib\supabaseServer.ts", 
    "pages\admin\payouts.tsx",
    "pages\api\admin\payout-complete.ts",
    "pages\api\admin\payout-mark-failed.ts",
    "pages\api\admin\payout-start.ts",
    "pages\api\admin\payouts-list.ts",
    "pages\api\admin\refund.ts",
    "pages\api\admin\rotate-secret.ts",
    "pages\api\admin\transactions.ts",
    "pages\api\stripe\webhook.ts",
    "pages\api\wallet\create-checkout-session.ts",
    "pages\api\env-check.ts",
    "scripts\rotate-secret.js"
)

$totalReplacements = 0
$filesModified = @()

foreach ($filePath in $filesToProcess) {
    if (Test-Path $filePath) {
        # Read file content (compatible with older PowerShell)
        $content = [System.IO.File]::ReadAllText((Convert-Path $filePath))
        $originalContent = $content
        
        # Track changes for this file
        $changesForFile = @()
        
        # Replace process.env.VAR_NAME with getSecretSync('VAR_NAME')
        foreach ($secret in $secretsToMigrate) {
            $pattern = "process\.env\.$secret"
            if ($content -match $pattern) {
                $replacement = "getSecretSync('$secret')"
                $oldContent = $content
                $content = $content -replace $pattern, $replacement
                if ($oldContent -ne $content) {
                    $changesForFile += "process.env.$secret -> getSecretSync('$secret')"
                }
            }
            
            # Also handle bracket notation
            $pattern1 = "process\.env\['$secret'\]"
            $pattern2 = 'process\.env\["' + $secret + '"\]'
            
            if ($content -match $pattern1) {
                $replacement = "getSecretSync('$secret')"
                $oldContent = $content
                $content = $content -replace $pattern1, $replacement
                if ($oldContent -ne $content) {
                    $changesForFile += "process.env['$secret'] -> getSecretSync('$secret')"
                }
            }
            
            if ($content -match $pattern2) {
                $replacement = "getSecretSync('$secret')"
                $oldContent = $content
                $content = $content -replace $pattern2, $replacement
                if ($oldContent -ne $content) {
                    $changesForFile += 'process.env["' + $secret + '"] -> getSecretSync("' + $secret + '")'
                }
            }
        }
        
        if ($content -ne $originalContent) {
            $diffCount = $changesForFile.Count
            $totalReplacements += $diffCount
            $filesModified += @{
                File = $filePath
                Changes = $diffCount
                SpecificChanges = $changesForFile
            }
            
            if ($Apply) {
                [System.IO.File]::WriteAllText((Convert-Path $filePath), $content, [System.Text.Encoding]::UTF8)
                Write-Host "  ✓ Modified: $filePath ($diffCount changes)" -ForegroundColor Green
                foreach ($change in $changesForFile) {
                    Write-Host "    - $change" -ForegroundColor Gray
                }
            } else {
                Write-Host "  ○ Would modify: $filePath ($diffCount changes)" -ForegroundColor Yellow
                foreach ($change in $changesForFile) {
                    Write-Host "    - $change" -ForegroundColor DarkGray
                }
            }
        }
    } else {
        Write-Host "  ⚠ File not found: $filePath" -ForegroundColor DarkYellow
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Green
Write-Host "Files that would be modified: $($filesModified.Count)" -ForegroundColor Cyan
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Cyan

if ($Dry) {
    Write-Host "`nThis was a DRY RUN. No files were modified." -ForegroundColor Yellow
    Write-Host "To apply changes, run: .\scripts\codemod-replace-env.ps1 -Apply" -ForegroundColor Yellow
} else {
    Write-Host "`nChanges have been APPLIED to files." -ForegroundColor Green
    Write-Host "Remember to add import statements where needed:" -ForegroundColor Yellow
    Write-Host "  import { getSecretSync } from '@/lib/secrets-sync'" -ForegroundColor White
    Write-Host "  or for server-side: import { getSecretSync } from '../../lib/secrets-sync'" -ForegroundColor White
}
