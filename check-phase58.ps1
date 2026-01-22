Write-Host 'Phase 58 Implementation Status' -ForegroundColor Cyan
Write-Host '==============================' -ForegroundColor Cyan

 = @(
    @{ Name = 'Database tables (invites, orgs)'; File = 'supabase/migrations/*_create_invites_orgs.sql' },
    @{ Name = 'Persistence layer'; File = 'infra/invites/persistence.ts' },
    @{ Name = 'Admin invite creation API'; File = 'pages/api/admin/invites/create.ts' },
    @{ Name = 'Admin invite list API'; File = 'pages/api/admin/invites/list.ts' },
    @{ Name = 'Invite validation API'; File = 'pages/api/invite/[token].ts' },
    @{ Name = 'Signup org creation API'; File = 'pages/api/signup/org.ts' },
    @{ Name = 'Admin invite manager UI'; File = 'pages/admin/invites/index.tsx' },
    @{ Name = 'Invite landing page'; File = 'pages/invite/[token].tsx' },
    @{ Name = 'New signup page (with invite check)'; File = 'pages/signup.tsx' },
    @{ Name = 'Invite-required page'; File = 'pages/invite-required.tsx' },
    @{ Name = 'Middleware for signup redirect'; File = 'middleware.ts' },
    @{ Name = 'Unit tests for invites'; File = '__tests__/infra/invites/persistence.test.ts' }
)

 = True
foreach ( in ) {
     = .File
    if (Test-Path -Path ) {
        Write-Host "[OK]  " -ForegroundColor Green
    } else {
        Write-Host "[MISSING] " -ForegroundColor Red
         = False
    }
}

Write-Host "
"
if () {
    Write-Host 'All components appear to be in place.' -ForegroundColor Green
    Write-Host 'Next steps:' -ForegroundColor Yellow
    Write-Host '1. Run database migration'
    Write-Host '2. Set ADMIN_EMAILS in .env.local'
    Write-Host '3. Run unit tests: npm test'
} else {
    Write-Host 'Some components are missing. Please review.' -ForegroundColor Red
}
