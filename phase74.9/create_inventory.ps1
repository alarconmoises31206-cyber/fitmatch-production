# Phase 74.9.1 Surface Inventory Script
$inventory = @{
    phase = "74.9.1"
    inventory_date = Get-Date -Format "yyyy-MM-dd"
    surfaces = @()
}

# Define all routes/pages
$pages = @(
    @{path="/"; file="index.tsx"; name="Home/Landing"}
    @{path="/dashboard"; file="dashboard/index.tsx"; name="Dashboard"}
    @{path="/matches"; file="matches.tsx"; name="Trainer Matches"}
    @{path="/profile"; file="profile.tsx"; name="User Profile"}
    @{path="/questionnaire"; file="questionnaire.tsx"; name="Questionnaire"}
    @{path="/trainer-dashboard"; file="trainer-dashboard.tsx"; name="Trainer Dashboard"}
    @{path="/messages/chat"; file="messages/chat.tsx"; name="Messages/Chat"}
    @{path="/auth/login"; file="auth/login.tsx"; name="Login"}
    @{path="/auth/register"; file="auth/register.tsx"; name="Register"}
)

foreach ($page in $pages) {
    $surface = @{
        route = $page.path
        component = $page.file
        name = $page.name
        status = "to_be_determined"
        system_responsibility = "to_be_determined"
        reviewer_exposure_risk = "to_be_determined"
        notes = ""
    }
    $inventory.surfaces += $surface
}

# Convert to JSON and save
$inventory | ConvertTo-Json -Depth 10 | Set-Content -Path "./phase74.9/ui_surface_inventory.json"
Write-Host "Inventory created. Review and update status fields."
