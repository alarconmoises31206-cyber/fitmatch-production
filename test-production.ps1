# Production test for Phase 18
$testUrl = "https://your-vercel-app.vercel.app/api/secure-chat/send"
$testBody = @{
    user_id = "test-user-123"
    trainer_id = "test-trainer-456"
    message = "email me at test@example.com"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $testUrl -Method Post -Body $testBody -ContentType "application/json"
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error Status:" $_.Exception.Response.StatusCode.value__ -ForegroundColor Red
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        Write-Host "SUCCESS: Phase 18 is blocking leaked contact info!" -ForegroundColor Green
    }
}
