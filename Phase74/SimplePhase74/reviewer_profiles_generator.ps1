# reviewer_profiles_generator.ps1
# This script creates the reviewer_profiles.json file for Phase 75

# Define the reviewer profiles according to the schema
$reviewers = @()

# Reviewer 1: Technical Skeptic
$reviewers += @{
    reviewer_id = "R1"
    reviewer_type = "technical_skeptic"
    profile = @{
        background = @{
            primary_field = "software_engineering"
            years_experience = 8
            familiarity_with_ai = "high"
        }
        skepticism_profile = @{
            default_stance = "skeptical"
            known_annoyances = @(
                "black-box models",
                "hand-wavy explanations",
                "non-deterministic behavior"
            )
        }
        review_capabilities = @{
            can_reason_about_algorithms = $true
            can_detect_inconsistencies = $true
            expects_formal_logic = $true
        }
    }
    eligibility_checks = @{
        has_not_worked_on_fitmatch = $true
        has_not_received_prior_explanations = $true
        is_not_personally_invested = $true
    }
    bias_risk_assessment = @{
        relationship_to_founder = "none"
        incentive_to_be_supportive = "low"
        risk_of_deference = "low"
        notes = "Former colleague from different company, known for technical rigor"
    }
}

# Reviewer 2: Domain Practitioner
$reviewers += @{
    reviewer_id = "R2"
    reviewer_type = "domain_practitioner"
    profile = @{
        domain = @{
            field = "fitness"
            years_practice = 12
            current_role = "trainer"
        }
        decision_style = @{
            relies_on_intuition = $true
            open_to_systems = "medium"
        }
        risk_sensitivity = @{
            safety_conscious = $true
            dislikes_overconfidence = $true
        }
    }
    eligibility_checks = @{
        actively_practicing = $true
        not_affiliated_with_fitmatch = $true
        not_previously_briefed = $true
    }
    bias_risk_assessment = @{
        relationship_to_founder = "weak"
        incentive_to_be_supportive = "low"
        risk_of_deference = "medium"
        notes = "Professional contact through industry events, no personal relationship"
    }
}

# Reviewer 3: Critical Non-Technical Thinker
$reviewers += @{
    reviewer_id = "R3"
    reviewer_type = "critical_non_technical"
    profile = @{
        background = @{
            profession = "Marketing Director"
            education_level = "graduate"
            technical_fluency = "low"
        }
        thinking_style = @{
            asks_why = $true
            challenges_authority = $true
            sensitive_to_confidence_tone = $true
        }
        trust_baseline = @{
            initial_trust_in_ai = "low"
        }
    }
    eligibility_checks = @{
        not_tech_professional = $true
        not_domain_expert = $true
        no_prior_exposure = $true
    }
    bias_risk_assessment = @{
        relationship_to_founder = "none"
        incentive_to_be_supportive = "low"
        risk_of_deference = "low"
        notes = "No prior connection, found through professional network"
    }
}

# Create the complete JSON structure
$reviewerProfiles = @{
    reviewers = $reviewers
}

# Convert to JSON with proper formatting
$jsonContent = $reviewerProfiles | ConvertTo-Json -Depth 10

# Save to file
$jsonContent | Out-File -FilePath "reviewer_profiles.json" -Encoding UTF8

Write-Host "reviewer_profiles.json has been created successfully." -ForegroundColor Green
Write-Host "Reviewers created: $($reviewers.Count)" -ForegroundColor Cyan
Write-Host "Reviewer types: $($reviewers.reviewer_type -join ', ')" -ForegroundColor Cyan
