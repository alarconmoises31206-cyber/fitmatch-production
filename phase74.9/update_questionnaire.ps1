$inventory = Get-Content -Path "./phase74.9/ui_surface_inventory.json" | ConvertFrom-Json

# Update Questionnaire page
$questionnaireSurface = $inventory.surfaces | Where-Object { $_.route -eq "/questionnaire" }
$questionnaireSurface.status = "partially_implemented"
$questionnaireSurface.system_responsibility = "mixed"  # Collects data but stores locally
$questionnaireSurface.reviewer_exposure_risk = "medium"  # Functional but uses localStorage only
$questionnaireSurface.notes = "Uses localStorage instead of backend. Functional but limited persistence. Needs boundary disclosure about data storage limitations."

$inventory | ConvertTo-Json -Depth 10 | Set-Content -Path "./phase74.9/ui_surface_inventory.json"
Write-Host "Updated Questionnaire page in inventory."
