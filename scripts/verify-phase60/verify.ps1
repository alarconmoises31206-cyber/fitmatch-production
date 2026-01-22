# scripts/verify-phase60/verify.ps1
# Run this script to verify Phase 60 implementation

Write-Host "🔍 PHASE 60 VERIFICATION CHECKS" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# 1. Check if files exist
Write-Host "📁 1. File Existence Check:" -ForegroundColor Yellow
$requiredFiles = @(
    "infra/ai-matchmaking/types.ts",
    "infra/ai-matchmaking/scoring-engine.ts",
    "infra/ai-matchmaking/explainer.ts",
    "infra/ai-matchmaking/tier-enforcer.ts",
    "infra/ai-matchmaking/token-integrator.ts",
    "infra/ai-matchmaking/index.ts",
    "pages/api/ai/match/index.ts",
    "pages/api/ai/match/contact.ts",
    "hooks/useMatchmaking.ts",
    "supabase/migrations/20250101000000_phase60_ai_matchmaking_tables.sql",
    "__tests__/infra/ai-matchmaking/scoring-engine.test.ts",
    "__tests__/infra/ai-matchmaking/tier-enforcer.test.ts",
    "__tests__/infra/ai-matchmaking/token-integrator.test.ts",
    "scripts/test-ai-engine/test-engine.ts",
    "scripts/verify-phase60/verify.ts"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""
Write-Host "   Result: " -NoNewline
if ($allFilesExist) {
    Write-Host "✅ All files exist" -ForegroundColor Green
} else {
    Write-Host "❌ Missing files!" -ForegroundColor Red
}
Write-Host ""

# 2. Check TypeScript compilation (basic)
Write-Host "⚙️ 2. TypeScript Compilation Check:" -ForegroundColor Yellow
try {
    # Check if we can find TypeScript files
    $tsFiles = Get-ChildItem -Path . -Recurse -Filter "*.ts" -Exclude "node_modules" | Select-Object -First 5
    if ($tsFiles.Count -gt 0) {
        Write-Host "   ✅ TypeScript files detected" -ForegroundColor Green
    } else {
        Write-Host "   ❌ No TypeScript files found" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error checking TypeScript: $_" -ForegroundColor Red
}
Write-Host ""

# 3. Check package.json for required scripts
Write-Host "📦 3. Package.json Scripts Check:" -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $hasTestScript = $packageJson.scripts.test -ne $null
    $hasAITestScript = $packageJson.scripts."test:ai-engine" -ne $null
    
    if ($hasTestScript) {
        Write-Host "   ✅ npm test script found" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  npm test script not found" -ForegroundColor Yellow
    }
    
    if ($hasAITestScript) {
        Write-Host "   ✅ test:ai-engine script found" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  test:ai-engine script not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ package.json not found" -ForegroundColor Red
}
Write-Host ""

# 4. Check database migration file content
Write-Host "🗄️ 4. Database Migration Check:" -ForegroundColor Yellow
$migrationFile = "supabase/migrations/20250101000000_phase60_ai_matchmaking_tables.sql"
if (Test-Path $migrationFile) {
    $content = Get-Content $migrationFile -Raw
    $hasTables = $content -match "CREATE TABLE"
    $hasRLS = $content -match "ROW LEVEL SECURITY"
    
    if ($hasTables) {
        Write-Host "   ✅ CREATE TABLE statements found" -ForegroundColor Green
    } else {
        Write-Host "   ❌ No CREATE TABLE statements" -ForegroundColor Red
    }
    
    if ($hasRLS) {
        Write-Host "   ✅ RLS policies found" -ForegroundColor Green
    } else {
        Write-Host "   ❌ No RLS policies" -ForegroundColor Red
    }
    
    # Count tables
    $tableCount = ([regex]::Matches($content, "CREATE TABLE")).Count
    Write-Host "   📊 Found $tableCount table creation statements" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ Migration file not found" -ForegroundColor Red
}
Write-Host ""

# 5. Check API structure
Write-Host "🌐 5. API Structure Check:" -ForegroundColor Yellow
$apiFiles = @("pages/api/ai/match/index.ts", "pages/api/ai/match/contact.ts")
foreach ($apiFile in $apiFiles) {
    if (Test-Path $apiFile) {
        $content = Get-Content $apiFile -Raw
        $hasHandler = $content -match "export default async function handler"
        $hasPostCheck = $content -match "req.method !== 'POST'"
        
        if ($hasHandler) {
            Write-Host "   ✅ $apiFile has handler function" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $apiFile missing handler" -ForegroundColor Red
        }
    } else {
        Write-Host "   ❌ $apiFile not found" -ForegroundColor Red
    }
}
Write-Host ""

# 6. Directory structure check
Write-Host "📂 6. Directory Structure Check:" -ForegroundColor Yellow
$requiredDirs = @(
    "infra/ai-matchmaking",
    "pages/api/ai/match", 
    "hooks",
    "supabase/migrations",
    "__tests__/infra/ai-matchmaking",
    "scripts/test-ai-engine",
    "scripts/verify-phase60"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "   ✅ $dir exists" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $dir missing" -ForegroundColor Red
    }
}
Write-Host ""

# Summary
Write-Host "=" * 60
Write-Host "📊 VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host ""

# Count checks
$fileCount = $requiredFiles.Count
$missingFiles = 0
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) { $missingFiles++ }
}

$dirCount = $requiredDirs.Count
$missingDirs = 0
foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) { $missingDirs++ }
}

Write-Host "Files: $(($fileCount - $missingFiles))/$fileCount present" -ForegroundColor $(if ($missingFiles -eq 0) { "Green" } else { "Red" })
Write-Host "Directories: $(($dirCount - $missingDirs))/$dirCount present" -ForegroundColor $(if ($missingDirs -eq 0) { "Green" } else { "Red" })

if ($missingFiles -eq 0 -and $missingDirs -eq 0) {
    Write-Host ""
    Write-Host "🎉 PHASE 60 STRUCTURE VERIFICATION PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps to complete verification:" -ForegroundColor Yellow
    Write-Host "1. Apply database migration to Supabase" -ForegroundColor White
    Write-Host "2. Run: npx tsx scripts/verify-phase60/verify.ts" -ForegroundColor White
    Write-Host "3. Run: npm test (to run unit tests)" -ForegroundColor White
    Write-Host "4. Run: npm run test:ai-engine (integration test)" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️  PHASE 60 STRUCTURE ISSUES DETECTED" -ForegroundColor Yellow
    Write-Host "Please fix missing files/directories before proceeding." -ForegroundColor White
}
