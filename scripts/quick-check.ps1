# Quick CI check
$banned = @("STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_SECRET_TOKEN", "VAULT_ADDR", "VAULT_TOKEN", "VAULT_SECRET_PATH")
$issues = @()

foreach ($file in (Get-ChildItem -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" -Exclude "node_modules", ".next", ".git", "backups_phase24*")) {
    $content = Get-Content $file.FullName
    foreach ($key in $banned) {
        if ($content -match "process\.env\.$key\b" -or $content -match "process\.env\['$key'\]" -or $content -match "process\.env\[\`"$key\`"\]") {
            $issues += "$($file.Name): process.env.$key"
        }
    }
}

if ($issues.Count -gt 0) {
    Write-Host "❌ Issues found:" -ForegroundColor Red
    $issues | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    exit 1
} else {
    Write-Host "✅ No banned process.env usage found" -ForegroundColor Green
    exit 0
}
