# Update-ConversationStatus.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$ConversationId,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("active", "paused", "completed", "archived")]
    [string]$NewStatus,
    
    [switch]$DryRun = $false
)

# Configuration
$supabaseUrl = "https://jllzubbtdbwlnnbqrkdw.supabase.co"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbHp1YmJ0ZGJ3bG5uYnFya2R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyMDQzMCwiZXhwIjoyMDc5OTk2NDMwfQ.2n9oLwREWsbpXI-IoNu9i4E1Z5uSA0IwS8mAuV1ZMLA"

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

Write-Host "PHASE 36 - Conversation State Update" -ForegroundColor Cyan
Write-Host "Conversation: $ConversationId" -ForegroundColor White
Write-Host "New Status: $NewStatus" -ForegroundColor White

if ($DryRun) {
    Write-Host "Mode: DRY RUN (no changes)" -ForegroundColor Yellow
    exit 0
}

# Prepare update data
$updateData = @{ status = $NewStatus }

# Set timestamp based on status
if ($NewStatus -eq "completed") {
    $updateData.completed_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
} elseif ($NewStatus -eq "archived") {
    $updateData.archived_at = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
}

$updateUrl = "$supabaseUrl/rest/v1/conversations?id=eq.$ConversationId"
$body = $updateData | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $updateUrl -Headers $headers -Method Patch -Body $body
    Write-Host "✅ Status updated successfully!" -ForegroundColor Green
    
    # Log to conversation_health
    $logUrl = "$supabaseUrl/rest/v1/conversation_health"
    $logData = @{
        conversation_id = $ConversationId
        metric_type = "status_change"
        metric_value = 1
        notes = "Changed to $NewStatus"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri $logUrl -Headers $headers -Method Post -Body $logData -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "❌ Failed to update status: $($_.Exception.Message)" -ForegroundColor Red
}
