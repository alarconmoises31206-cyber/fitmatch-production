# EmbeddingService.psm1 - Function-based version

$Script:ModelVersion = "text-embedding-3-small"

function New-EmbeddingService {
    [CmdletBinding()]
    param()
    
    return [PSCustomObject]@{
        PSTypeName = "EmbeddingService"
        ModelVersion = $Script:ModelVersion
    } | Add-Member -MemberType ScriptMethod -Name GenerateEmbedding -Value {
        param([string]$text)
        
        # For now, return a dummy 1536-dimensional vector
        $vector = New-Object float[] 1536
        for ($i = 0; $i -lt 1536; $i++) {
            $vector[$i] = 0.0
        }
        
        # Simple hash-based "embedding" for testing
        $hash = [System.BitConverter]::GetBytes($text.GetHashCode())
        for ($i = 0; $i -lt [Math]::Min($hash.Length, 1536); $i++) {
            $vector[$i] = [float]$hash[$i] / 255.0
        }
        
        return $vector
    } -PassThru |
    Add-Member -MemberType ScriptMethod -Name ConvertToPgVector -Value {
        param([float[]]$embedding)
        
        $elements = $embedding -join ", "
        return "[$elements]"
    } -PassThru |
    Add-Member -MemberType ScriptMethod -Name GenerateEmbeddingRecord -Value {
        param(
            [string]$userId,
            [string]$role,
            [string]$questionId,
            [string]$rawText
        )
        
        $embedding = $this.GenerateEmbedding($rawText)
        $pgVector = $this.ConvertToPgVector($embedding)
        
        return [PSCustomObject]@{
            user_id = $userId
            role = $role
            question_id = $questionId
            raw_text = $rawText
            embedding = $pgVector
            model_version = $this.ModelVersion
            created_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        }
    } -PassThru
}

Export-ModuleMember -Function New-EmbeddingService -Variable ModelVersion
