# Read the matches file
$content = Get-Content -Path "./pages/matches.tsx" -Raw

# Add import for BoundaryDisclosure at the top
if ($content -match 'import { useState, useEffect } from ''react'';') {
    $content = $content -replace 'import { useState, useEffect } from ''react'';', "import { useState, useEffect } from 'react';`nimport BoundaryDisclosure from '../components/BoundaryDisclosure';"
}

# Add demo label to the mock data section
$content = $content -replace '// Mock data for clients', "// DEMONSTRATION DATA ONLY - Not connected to production backend"
$content = $content -replace 'const mockClients = \[', "const mockClients = [ // Sample data for UI demonstration"

# Add BoundaryDisclosure component before the closing div of the main container
# Look for the closing </div> after the matches grid
if ($content -match '(?s)(.*</div>\s*</div>\s*</div>\s*)\s*(</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*\);)') {
    $boundaryInsert = "`n`n      {/* Phase 74.9 - System Boundary Disclosure */}`n      <BoundaryDisclosure showPersistenceNotice={true} />`n`n"
    $content = $content -replace '(?s)(.*</div>\s*</div>\s*</div>\s*)\s*(</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*\);)', "`$1$boundaryInsert`$2"
}

# Add demo label to match cards
if ($content -match '<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">') {
    $content = $content -replace '<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">', '<div className="flex items-center justify-between mb-2"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">'
    $content = $content -replace '</span>\s*</div>', '</span><span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Demo</span></div>'
}

# Write back
Set-Content -Path "./pages/matches.tsx" -Value $content
Write-Host "Added boundary disclosure to matches page"
