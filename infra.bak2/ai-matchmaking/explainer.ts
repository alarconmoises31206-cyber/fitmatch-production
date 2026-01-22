// infra/ai-matchmaking/explainer.ts
import { MatchScore } from './types';

export class MatchExplainer {
  /**
   * Generate human-readable rationale for a match score
   */
  generateRationale(score: MatchScore): string {
    const { breakdown } = score;
    const reasons: string[] = [];
    const improvements: string[] = [];

    // Goals rationale
    if (breakdown.goals >= 80) {
      reasons.push("Excellent alignment with your fitness goals")
    } else if (breakdown.goals >= 60) {
      reasons.push("Good overlap with your stated goals")
    } else {
      improvements.push("Goal alignment could be stronger")
    }

    // Experience rationale
    if (breakdown.experience >= 80) {
      reasons.push("Experience level well-matched to your needs")
    } else if (breakdown.experience >= 60) {
      reasons.push("Suitable experience for your level")
    } else if (breakdown.experience < 40) {
      improvements.push("Experience level may not be ideal")
    }

    // Specialties rationale
    if (breakdown.specialties === 100) {
      reasons.push("Specializes in your preferred training style")
    } else if (breakdown.specialties >= 70) {
      reasons.push("Offers relevant specialties for your needs")
    } else {
      improvements.push("Training specialties partially match your preference")
    }

    // Availability rationale
    if (breakdown.availability >= 85) {
      reasons.push("Excellent schedule and timezone compatibility")
    } else if (breakdown.availability >= 70) {
      reasons.push("Good availability overlap with your schedule")
    } else {
      improvements.push("Schedule alignment may require coordination")
    }

    // Personality rationale
    if (breakdown.personality >= 80) {
      reasons.push("Communication style aligns well with your preferences")
    } else if (breakdown.personality >= 60) {
      reasons.push("Compatible communication approach")
    }

    // Location rationale
    if (breakdown.location === 100) {
      reasons.push("Same timezone for convenient scheduling")
    } else if (breakdown.location >= 70) {
      reasons.push("Compatible timezone for coordination")
    }

    // Tier rationale
    if (breakdown.tier >= 90) {
      reasons.push("Highly verified and trusted trainer tier")
    } else if (breakdown.tier >= 80) {
      reasons.push("Paired trainer with full access benefits")
    }

    // Construct final rationale
    let rationale = "";
    
    if (reasons.length > 0) {
      rationale += `This match scored ${score.score}/100. Key strengths:\n`;
      reasons.forEach((reason, index) => {
        rationale += `  • ${reason}\n`;
      })
    }

    if (improvements.length > 0) {
      rationale += "\nAreas to consider:\n";
      improvements.forEach((improvement) => {
        rationale += `  • ${improvement}\n`;
      })
    }

    // Add confidence note
    rationale += `\nConfidence: ${Math.round(score.confidence * 100)}% based on profile completeness.`;

    return rationale;
  }

  /**
   * Generate a concise summary for UI display
   */
  generateSummary(score: MatchScore): string {
    const { breakdown, score: totalScore } = score;
    
    if (totalScore >= 90) return "Exceptional match across all criteria";
    if (totalScore >= 80) return "Strong match with excellent alignment";
    if (totalScore >= 70) return "Good match with solid compatibility";
    if (totalScore >= 60) return "Moderate match with reasonable fit";
    return "Basic match - some areas may need adjustment";
  }

  /**
   * Generate tier-specific visibility explanation
   */
  generateTierExplanation(tier: string): string {
    switch (tier) {
      case 'web':
        return "Web trainer: Limited visibility. One free contact allowed.";
      case 'free':
        return "Free trainer: Partial profile access. Limited matches per week.";
      case 'paid':
        return "Paid trainer: Full visibility. Unlimited matches within token limits.";
      case 'verified':
        return "Verified trainer: Full access with quality verification.";
      case 'elite_verified':
        return "Elite verified: Highest tier with premium features.";
      default:
        return "Standard trainer access.";
    }
  }
}
