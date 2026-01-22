# scripts/add-imports.ps1
Write-Host "Phase 24: Adding import statements for getSecretSync" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Map of files to their import paths
$fileImports = @{
    "lib\stripe\index.ts" = "import { getSecretSync } from '../secrets-sync';"
    "lib\supabaseServer.ts" = "import { getSecretSync } from './secrets-sync';"
    "pages\admin\payouts.tsx" = "import { getSecretSync } from '@/lib/secrets-sync';"
    "pages\api\admin\payout-complete.ts" = "import { getSecretSync } from '../../../lib/secrets-sync';"
    "pages\api\admin\payout-mark-failed.ts" = "import { getSecretSync } from '../../../lib/secrets-sync';"
    "pages\api\admin\payout-start.ts" = "import { getSecretSync } from '../../../lib/secrets-sync';"
    "pages\api\admin\payouts-list.ts" = "import { getSecretSync } from '../../../lib/secrets-sync';"
    "pages\api\admin\refund.ts" = "import { getSecretSync } from '../../../lib/secrets-sync';"
    "pages\api\admin\rotate-secret.ts" = "import { getSecretSync } from '../../../lib/secrets-sync';"
    "pages\api\admin\transactions.ts" = "import { getSecretSync } from '../../../lib/secrets-sync';"
    "pages\api\stripe\webhook.ts" = "import { getSecretSync } from '../../../lib/secrets-sync';"
    "pages\api\wallet\create-checkout-session.ts" = "import { getSecretSync } from '../../../lib/secrets-sync';"
    "pages\api\env-check.ts" = "import { getSecretSync } from '../../lib/secrets-sync';"
    "scripts\rotate-secret.js" = "const { getSecretSync } = require('../lib/secrets-sync');"
}

foreach ($file in $fileImports.Keys) {
    if (Test-Path $file) {
        $content = [System.IO.File]::ReadAllText((Convert-Path $file))
        
        # Check if import already exists
        $importToAdd = $fileImports[$file]
        $importExists = $false
        
        if ($file -match "\.(ts|tsx)$") {
            # TypeScript/TSX file
            $importExists = $content -match [regex]::Escape($importToAdd -replace "^import.*from '", "import.*from '" -replace "';\$", "'") -or
                           $content -match "from ['\`"]\.\./lib/secrets-sync['\`"]" -or
                           $content -match "from ['\`"]@/lib/secrets-sync['\`"]"
        } elseif ($file -match "\.js$") {
            # JavaScript file
            $importExists = $content -match [regex]::Escape($importToAdd -replace "^const.*require\(", "const.*require\(" -replace "\);\$", ")") -or
                           $content -match "require\(['\`"]\.\./lib/secrets-sync['\`"]\)"
        }
        
        if (-not $importExists) {
            # Add import at the beginning of the file
            if ($file -match "\.(ts|tsx)$") {
                # Find the first import statement or add after any shebang/license comments
                if ($content -match "^(//.*?\n|/\*.*?\*/\n)*") {
                    $match = $Matches[0]
                    $newContent = $match + $importToAdd + "`n" + $content.Substring($match.Length)
                    [System.IO.File]::WriteAllText((Convert-Path $file), $newContent, [System.Text.Encoding]::UTF8)
                    Write-Host "  ✓ Added import to: $file" -ForegroundColor Green
                } else {
                    $newContent = $importToAdd + "`n" + $content
                    [System.IO.File]::WriteAllText((Convert-Path $file), $newContent, [System.Text.Encoding]::UTF8)
                    Write-Host "  ✓ Added import to: $file" -ForegroundColor Green
                }
            } elseif ($file -match "\.js$") {
                # JavaScript file - add require statement
                if ($content -match "^(//.*?\n|/\*.*?\*/\n)*") {
                    $match = $Matches[0]
                    $newContent = $match + $importToAdd + "`n" + $content.Substring($match.Length)
                    [System.IO.File]::WriteAllText((Convert-Path $file), $newContent, [System.Text.Encoding]::UTF8)
                    Write-Host "  ✓ Added import to: $file" -ForegroundColor Green
                } else {
                    $newContent = $importToAdd + "`n" + $content
                    [System.IO.File]::WriteAllText((Convert-Path $file), $newContent, [System.Text.Encoding]::UTF8)
                    Write-Host "  ✓ Added import to: $file" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "  ⓘ Import already exists in: $file" -ForegroundColor Blue
        }
    } else {
        Write-Host "  ⚠ File not found: $file" -ForegroundColor DarkYellow
    }
}

Write-Host "`n=== Import addition complete ===" -ForegroundColor Green
