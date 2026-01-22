# Update-UserIdentityCache-Simple.ps1
# Simplified version that works with Supabase REST API

param(
    [switch]$DryRun = $false,
    [int]$LimitUsers = 5
)

# Configuration
$supabaseUrl = "https://jllzubbtdbwlnnbqrkdw.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbHp1YmJ0ZGJ3bG5uYnFya2R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyMDQzMCwiZXhwIjoyMDc5OTk2NDMwfQ.2n9oLwREWsbpXI-IoNu9i4E1Z5uSA0IwS8mAuV1ZMLA"

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PHASE 36 - SIMPLIFIED IDENTITY CALCULATOR" -ForegroundColor Cyan
Write-Host "Started at: $(Get-Date)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Step 1: Get recent users from profiles
Write-Host "`nStep 1: Fetching recent users..." -ForegroundColor Yellow
$profilesUrl = "$supabaseUrl/rest/v1/profiles?order=created_at.desc&limit=$LimitUsers&select=id,email,created_at"

try {
    $users = Invoke-RestMethod -Uri $profilesUrl -Headers $headers -Method Get
    Write-Host "  Found $($users.Count) users" -ForegroundColor Green
}
catch {
    Write-Host "  [ERROR] Failed to fetch users: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Analyze each user
$processed = 0
foreach ($user in $users) {
    $processed++
    $userId = $user.id
    
    Write-Host "`n  User $processed/$($users.Count): $($user.email ?? $userId)" -ForegroundColor White
    
    # Check if user is a client
    $clientUrl = "$supabaseUrl/rest/v1/client_profiles?id=eq.$userId&limit=1"
    $trainerUrl = "$supabaseUrl/rest/v1/trainer_profiles?id=eq.$userId&limit=1"
    
    $isClient = $false
    $isTrainer = $false
    
    try {
        $clientResult = Invoke-RestMethod -Uri $clientUrl -Headers $headers -Method Get
        if ($clientResult.Count -gt 0) { $isClient = $true }
    } catch { }
    
    try {
        $trainerResult = Invoke-RestMethod -Uri $trainerUrl -Headers $headers -Method Get
        if ($trainerResult.Count -gt 0) { $isTrainer = $true }
    } catch { }
    
    # Determine role
    if ($isClient -and $isTrainer) { $role = "hybrid" }
    elseif ($isClient) { $role = "client" }
    elseif ($isTrainer) { $role = "trainer" }
    else { $role = "unknown" }
    
    Write-Host "    Role: $role" -ForegroundColor Gray
    
    # Get conversation count for engagement tier
    $convUrl = "$supabaseUrl/rest/v1/conversations?or=(client_id.eq.$userId,trainer_id.eq.$userId)&select=id"
    try {
        $conversations = Invoke-RestMethod -Uri $convUrl -Headers $headers -Method Get
        $convCount = $conversations.Count
        
        if ($convCount -eq 0) { $engagement = "new" }
        elseif ($convCount -lt 3) { $engagement = "active" }
        else { $engagement = "consistent" }
        
        Write-Host "    Conversations: $convCount -> Engagement: $engagement" -ForegroundColor Gray
    }
    catch {
        Write-Host "    Engagement: new (error fetching conversations)" -ForegroundColor Gray
        $engagement = "new"
    }
    
    # Default communication tier (we'll enhance this later)
    $communication = "basic"
    Write-Host "    Communication: $communication (default)" -ForegroundColor Gray
    
    # Update cache if not dry run
    if (-not $DryRun) {
        $cacheUrl = "$supabaseUrl/rest/v1/user_identity_cache"
        $cacheData = @{
            user_id = $userId
            role = $role
            engagement_tier = $engagement
            communication_tier = $communication
            recalculates_at = (Get-Date).AddHours(24).ToString("yyyy-MM-ddTHH:mm:ssZ")
        } | ConvertTo-Json
        
        try {
            # Upsert - using PATCH with ON CONFLICT in Supabase
            $upsertHeaders = $headers.Clone()
            $upsertHeaders["Prefer"] = "resolution=merge-duplicates"
            
            Invoke-RestMethod -Uri $cacheUrl -Headers $upsertHeaders -Method Post -Body $cacheData
            Write-Host "    [CACHE UPDATED]" -ForegroundColor Green
        }
        catch {
            Write-Host "    [CACHE ERROR: $($_.Exception.Message)]" -ForegroundColor Red
        }
    }
    else {
        Write-Host "    [DRY RUN] Would cache: $role | $engagement | $communication" -ForegroundColor DarkGray
    }
    
    # Brief pause
    Start-Sleep -Milliseconds 200
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "COMPLETE: Processed $processed users" -ForegroundColor Green
Write-Host "Mode: $(if ($DryRun) {'DRY RUN'} else {'LIVE UPDATE'})" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan