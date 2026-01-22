$inventory = Get-Content -Path "./phase74.9/ui_surface_inventory.json" | ConvertFrom-Json

# Update Profile page
$profileSurface = $inventory.surfaces | Where-Object { $_.route -eq "/profile" }
$profileSurface.status = "placeholder"  # Mock/smoke test page
$profileSurface.system_responsibility = "presentation"  # Just UI, no real functionality
$profileSurface.reviewer_exposure_risk = "low"  # Clearly labeled as smoke test
$profileSurface.notes = "Smoke test page with role switcher. Clearly labeled but needs Phase 74.9 boundary disclosure."

$inventory | ConvertTo-Json -Depth 10 | Set-Content -Path "./phase74.9/ui_surface_inventory.json"
Write-Host "Updated Profile page in inventory."
