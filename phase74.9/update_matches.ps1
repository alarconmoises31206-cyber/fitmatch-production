$inventory = Get-Content -Path "./phase74.9/ui_surface_inventory.json" | ConvertFrom-Json

# Update Matches page
$matchesSurface = $inventory.surfaces | Where-Object { $_.route -eq "/matches" }
$matchesSurface.status = "partially_implemented"
$matchesSurface.system_responsibility = "presentation"  # Uses mock data, not real engine
$matchesSurface.reviewer_exposure_risk = "medium"  # Shows match percentages but uses mock data
$matchesSurface.notes = "Uses mock data with localStorage. 'View Profile' buttons alert 'feature not implemented'. Needs boundary disclosure."

$inventory | ConvertTo-Json -Depth 10 | Set-Content -Path "./phase74.9/ui_surface_inventory.json"
Write-Host "Updated Matches page in inventory."
