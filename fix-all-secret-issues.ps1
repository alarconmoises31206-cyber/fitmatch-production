# fix-all-secret-issues.ps1
$rootDir = Get-Location
$tsFiles = Get-ChildItem -Recurse -Path $rootDir -Filter "*.ts" -File
$tsxFiles = Get-ChildItem -Recurse -Path $rootDir -Filter "*.tsx" -File
$allFiles = $tsFiles + $tsxFiles

$fixedCount = 0

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if file doesn't contain getSecretSync
    if ($content -notmatch "getSecretSync") {
        continue
    }
    
    Write-Host "Processing: $($file.FullName)"
    
    # Fix 1: Replace getSecretSync('ADMIN_SECRET_TOKEN') with process.env.ADMIN_SECRET_TOKEN
    $newContent = $content -replace "getSecretSync\('ADMIN_SECRET_TOKEN'\)", "process.env.ADMIN_SECRET_TOKEN"
    
    # Fix 2: Replace other common getSecretSync calls
    $newContent = $newContent -replace "getSecretSync\('STRIPE_SECRET_KEY'\)", "process.env.STRIPE_SECRET_KEY"
    $newContent = $newContent -replace "getSecretSync\('SUPABASE_SERVICE_ROLE_KEY'\)", "process.env.SUPABASE_SERVICE_ROLE_KEY"
    
    # Fix 3: Generic pattern for any getSecretSync('XXX')
    $newContent = $newContent -replace "getSecretSync\('([^']+)'\)", "process.env.`$1"
    
    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent
        $fixedCount++
        Write-Host "  Fixed $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total files processed: $($allFiles.Count)" 
Write-Host "Files fixed: $fixedCount" -ForegroundColor Green