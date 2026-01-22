# Read the profile file
$content = Get-Content -Path "./pages/profile.tsx" -Raw

# Add import for BoundaryDisclosure
if ($content -match 'import DashboardContent from ''../components/dashboard/DashboardContent'';') {
    $content = $content -replace 'import DashboardContent from ''../components/dashboard/DashboardContent'';', "import DashboardContent from '../components/dashboard/DashboardContent';`nimport BoundaryDisclosure from '../components/BoundaryDisclosure';"
}

# Add smoke test label more prominently
if ($content -match '<div className="mt-4 p-4 bg-gray-100 rounded">') {
    $content = $content -replace '<div className="mt-4 p-4 bg-gray-100 rounded">', '<div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">'
}

if ($content -match '<h3 className="font-semibold mb-2">Role Switcher \(Smoke Test\)</h3>') {
    $content = $content -replace '<h3 className="font-semibold mb-2">Role Switcher \(Smoke Test\)</h3>', '<div className="flex items-center mb-2"><h3 className="font-semibold">Role Switcher (Smoke Test)</h3><span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Testing Only</span></div>'
}

# Add BoundaryDisclosure before the closing Layout
if ($content -match '(?s)(<DashboardContent>.*?</DashboardContent>\s*)\s*(</Layout>\s*\);)') {
    $boundaryInsert = "`n`n      {/* Phase 74.9 - Smoke Test Boundary */}`n      <BoundaryDisclosure />`n`n"
    $content = $content -replace '(?s)(<DashboardContent>.*?</DashboardContent>\s*)\s*(</Layout>\s*\);)', "`$1$boundaryInsert`$2"
}

# Write back
Set-Content -Path "./pages/profile.tsx" -Value $content
Write-Host "Added boundary disclosure to profile page"
