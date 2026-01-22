# Read the dashboard file
$content = Get-Content -Path "./pages/dashboard/index.tsx" -Raw

# Fix the ?? AI Match Spin header
$content = $content -replace '<h2 className="text-2xl font-bold text-gray-900">\?\? AI Match Spin</h2>', '<h2 className="text-2xl font-bold text-gray-900"><span className="text-gray-500 text-lg">[Core]</span> AI Match Spin</h2>'

# Add demo label to purchase section  
$content = $content -replace '<h3 className="font-bold text-gray-900">Purchase Spin</h3>', '<h3 className="font-bold text-gray-900"><span className="text-gray-500 text-sm">[Demo]</span> Purchase Spin</h3>'

# Write back
Set-Content -Path "./pages/dashboard/index.tsx" -Value $content
Write-Host "Fixed dashboard placeholders"
