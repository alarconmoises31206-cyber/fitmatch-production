@{
    RootModule = 'Phase74-Orchestrator.ps1'
    ModuleVersion = '1.0.0'
    GUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    Author = 'FitMatch Engineering'
    CompanyName = 'FitMatch'
    Copyright = '(c) 2026 FitMatch. All rights reserved.'
    Description = 'Phase 74 - Externalized Trust & Reproducibility Layer'
    PowerShellVersion = '5.1'
    FunctionsToExport = @(
        'Start-Phase74',
        'Get-Phase74Status',
        'New-MatchSnapshot',
        'Export-MatchSnapshot',
        'Import-MatchSnapshot',
        'Invoke-MatchReplay',
        'Test-MatchReplaySystem',
        'New-DecisionTrace',
        'Export-DecisionTrace',
        'Import-DecisionTrace',
        'Generate-MatchDecisionTrace',
        'Test-DecisionTraceSystem',
        'New-InvariantAssertionEngine',
        'Test-SystemInvariants',
        'New-CounterfactualProbe',
        'Generate-CounterfactualProbes',
        'Export-CounterfactualProbe',
        'Test-CounterfactualProbeSystem',
        'New-ExternalReviewPacket',
        'Export-ExternalReviewPacket',
        'Create-StandardReviewPacket',
        'Test-ExternalReviewSystem'
    )
    CmdletsToExport = @()
    VariablesToExport = '*'
    AliasesToExport = @()
    PrivateData = @{
        PSData = @{
            Tags = @('FitMatch', 'Phase74', 'Trust', 'Reproducibility', 'Audit')
            LicenseUri = 'https://example.com/license'
            ProjectUri = 'https://example.com/fitmatch'
            ReleaseNotes = 'Initial Phase 74 implementation'
        }
    }
}
