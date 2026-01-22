Write-Host 'Phase 59 Acceptance Criteria Verification' -ForegroundColor Cyan
Write-Host '===========================================' -ForegroundColor Cyan

 = @(
    @{ Name = 'Org admin can invite users (within seat limit)'; File = 'pages/api/org/admin/invites/create.ts' },
    @{ Name = 'Over-quota seat attempts are gracefully blocked'; File = 'infra/org-access/persistence.ts' },
    @{ Name = 'Domain verification attaches domain → org'; File = 'pages/api/org/admin/domain/verify.ts' },
    @{ Name = 'Users with verified domains can request to join'; File = 'pages/api/org/join/request.ts' },
    @{ Name = 'Admin UI can manage seat usage, users, invites, pending requests'; File = 'pages/admin/org/access.tsx' },
    @{ Name = 'Database tables exist (org_users, domain_verifications, join_requests)'; File = 'supabase/migrations/*_phase59*.sql' },
    @{ Name = 'Auto-join middleware/endpoint'; File = 'pages/api/org/auto-join.ts' },
    @{ Name = 'Unit tests for denial paths'; File = '__tests__/infra/org-access/persistence.test.ts' }
)

 = True
foreach ( in ) {
     = False
    if (.File -like '*\**') {
        # Wildcard pattern
         = (Get-ChildItem -Path .File -ErrorAction SilentlyContinue).Count -gt 0
    } else {
         = Test-Path -Path .File
    }
    if () {
        Write-Host "[OK]  " -ForegroundColor Green
    } else {
        Write-Host "[MISSING] " -ForegroundColor Red
         = False
    }
}

Write-Host "
"
if () {
    Write-Host 'All acceptance criteria appear to be implemented.' -ForegroundColor Green
    Write-Host 'Next steps:' -ForegroundColor Yellow
    Write-Host '1. Run database migration for new tables.'
    Write-Host '2. Deploy and test end-to-end flow.'
    Write-Host '3. Verify seat blocking and domain verification.'
} else {
    Write-Host 'Some criteria are missing. Review above.' -ForegroundColor Red
}
