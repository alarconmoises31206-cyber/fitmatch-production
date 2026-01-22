$inventory = Get-Content -Path "./phase74.9/ui_surface_inventory.json" | ConvertFrom-Json

# Update Home/Landing page
$homeSurface = $inventory.surfaces | Where-Object { $_.route -eq "/" }
$homeSurface.status = "partially_implemented"
$homeSurface.system_responsibility = "presentation"  # This is mainly UI, not core engine
$homeSurface.reviewer_exposure_risk = "medium"  # Has placeholders ("??") that need addressing
$homeSurface.notes = "Contains '??' placeholders in 'How it works' section. Needs Phase 74.9 neutralization."

$inventory | ConvertTo-Json -Depth 10 | Set-Content -Path "./phase74.9/ui_surface_inventory.json"
Write-Host "Updated Home/Landing page in inventory."
