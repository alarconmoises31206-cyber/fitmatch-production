# Read the questionnaire file
$content = Get-Content -Path "./pages/questionnaire.tsx" -Raw

# Add import for BoundaryDisclosure
if ($content -match 'import Layout from ''../components/Layout'';') {
    $content = $content -replace 'import Layout from ''../components/Layout'';', "import Layout from '../components/Layout';`nimport BoundaryDisclosure from '../components/BoundaryDisclosure';"
}

# Add localStorage notice near the save function comment
if ($content -match '// Simple save to localStorage') {
    $content = $content -replace '// Simple save to localStorage', "// DEMONSTRATION: LocalStorage save (not production persistence)"
}

# Add BoundaryDisclosure at the end of the form
if ($content -match '(?s)(</form>\s*</div>\s*</div>\s*)\s*(</div>\s*</div>\s*</div>\s*\);)') {
    $boundaryInsert = "`n`n          {/* Phase 74.9 - Data Persistence Boundary */}`n          <BoundaryDisclosure showPersistenceNotice={true} />`n`n"
    $content = $content -replace '(?s)(</form>\s*</div>\s*</div>\s*)\s*(</div>\s*</div>\s*</div>\s*\);)', "`$1$boundaryInsert`$2"
}

# Write back
Set-Content -Path "./pages/questionnaire.tsx" -Value $content
Write-Host "Added boundary disclosure to questionnaire page"
