// Phase 70.1: Explanation Visibility Policy
// Defines what truth is safe to show to different user types

export type UserRole = 'client' | 'trainer' | 'admin' | 'founder';
export type ExplanationLayer = 'public' | 'private' | 'full';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface MatchExplanation {
  trainerId: string;
  primaryAlignment: string[];
  secondaryAlignment: string[];
  boundaryRespects: string[];
  hardFilterStatus: 'PASSED' | 'FAILED';
  confidence: ConfidenceLevel;
  confidenceReasons: string[];
  totalScore?: number; // Admin only
  breakdown?: { // Admin only
    primary: number;
    secondary: number;
    penalties: number;
  };
  rankPosition?: number; // Admin only
}

export class ExplanationVisibilityPolicy {
  private static readonly PUBLIC_DENY_LIST = [
    'totalScore',
    'breakdown',
    'rankPosition',
    'numericScores',
    'comparativeRanking',
    'otherTrainerData',
    'weightValues',
    'penaltyDetails'
  ];

  private static readonly TRAINER_DENY_LIST = [
    'totalScore',
    'breakdown',
    'rankPosition',
    'otherTrainerData',
    'clientSpecificData'
  ];

  // 70.1A: Public (Client-Facing) Explanation
  public static getClientExplanation(explanation: MatchExplanation): MatchExplanation {
    return this.filterExplanation(explanation, 'client');
  }

  // 70.1B: Private (Trainer-Facing) Explanation  
  public static getTrainerExplanation(explanation: MatchExplanation): MatchExplanation {
    return this.filterExplanation(explanation, 'trainer');
  }

  // 70.1C: Founder/Admin Explanation
  public static getAdminExplanation(explanation: MatchExplanation): MatchExplanation {
    // Full truth - no filtering for admin
    return {
      ...explanation,
      // Ensure all admin fields are included
      totalScore: explanation.totalScore || 0,
      breakdown: explanation.breakdown || { primary: 0, secondary: 0, penalties: 0 },
      rankPosition: explanation.rankPosition || 1
    };
  }

  private static filterExplanation(explanation: MatchExplanation, role: UserRole): MatchExplanation {
    const filtered: MatchExplanation = {
      trainerId: explanation.trainerId,
      primaryAlignment: explanation.primaryAlignment,
      secondaryAlignment: explanation.secondaryAlignment,
      boundaryRespects: explanation.boundaryRespects,
      hardFilterStatus: explanation.hardFilterStatus,
      confidence: explanation.confidence,
      confidenceReasons: explanation.confidenceReasons
    };

    // Apply role-specific filtering
    if (role === 'client') {
      // Clients never see scores or comparisons
      delete (filtered as any).totalScore;
      delete (filtered as any).breakdown;
      delete (filtered as any).rankPosition;
      
      // Ensure language is non-comparative
      filtered.primaryAlignment = this.makeNonComparative(filtered.primaryAlignment);
      filtered.secondaryAlignment = this.makeNonComparative(filtered.secondaryAlignment);
    }
    
    if (role === 'trainer') {
      // Trainers see alignment but not scores or rank
      delete (filtered as any).totalScore;
      delete (filtered as any).breakdown;
      delete (filtered as any).rankPosition;
      
      // Ensure language is position-relative but not comparative
      filtered.primaryAlignment = this.makePositionRelative(filtered.primaryAlignment);
      filtered.secondaryAlignment = this.makePositionRelative(filtered.secondaryAlignment);
    }

    return filtered;
  }

  private static makeNonComparative(statements: string[]): string[] {
    return statements.map(statement => {
      // Remove comparative language
      return statement
        .replace(/higher than|lower than|better than|worse than|compared to/g, '')
        .replace(/ranked #\d+/g, 'aligned well')
        .replace(/\d+(\.\d+)? points/g, '')
        .trim();
    }).filter(s => s.length > 0);
  }

  private static makePositionRelative(statements: string[]): string[] {
    return statements.map(statement => {
      // Make language about alignment, not ranking
      return statement
        .replace(/ranked #\d+/g, 'aligned well with client preferences')
        .replace(/\d+(\.\d+)? points/g, 'strong alignment')
        .replace(/higher than .+/g, 'met client requirements');
    });
  }

  // Generate human-readable summary based on visibility policy
  public static generateSummary(explanation: MatchExplanation, role: UserRole): string {
    const filtered = role === 'admin' 
      ? explanation 
      : this.filterExplanation(explanation, role);

    const parts: string[] = [];

    // Add alignment statements
    if (filtered.primaryAlignment.length > 0) {
      parts.push(`Alignment: ${filtered.primaryAlignment.join(', ')}`);
    }

    if (filtered.secondaryAlignment.length > 0 && role !== 'client') {
      parts.push(`Additional alignment: ${filtered.secondaryAlignment.slice(0, 2).join(', ')}`);
    }

    // Add boundary respect
    if (filtered.boundaryRespects.length > 0) {
      parts.push(`Respects boundaries: ${filtered.boundaryRespects.join(', ')}`);
    }

    // Add confidence
    parts.push(`Confidence: ${this.getConfidenceLabel(filtered.confidence)}`);

    return parts.join('. ') + '.';
  }

  private static getConfidenceLabel(level: ConfidenceLevel): string {
    switch (level) {
      case 'high': return 'High confidence match';
      case 'medium': return 'Moderate confidence match';
      case 'low': return 'Lower confidence match';
    }
  }

  // Explicit allow/deny matrix for transparency
  public static getVisibilityMatrix(): Record<UserRole, { allowed: string[], denied: string[] }> {
    return {
      client: {
        allowed: [
          'alignmentStatements',
          'boundaryRespects',
          'hardFilterStatus',
          'confidenceLevel',
          'confidenceReasons'
        ],
        denied: this.PUBLIC_DENY_LIST
      },
      trainer: {
        allowed: [
          'alignmentStatements',
          'boundaryRespects', 
          'hardFilterStatus',
          'confidenceLevel',
          'confidenceReasons',
          'positionRelativeFeedback'
        ],
        denied: this.TRAINER_DENY_LIST
      },
      admin: {
        allowed: ['everything'],
        denied: []
      },
      founder: {
        allowed: ['everything'],
        denied: []
      }
    };
  }
}
