// explainability.builder.ts - Phase 79 AI-Assisted Compatibility Engine
// Explainability Layer Builder
// IMPORTANT: Provides transparent, human-readable explanations

export interface ExplanationTemplate {
  id: string;
  template: string;
  minScore: number;
  maxScore: number;
  constraints: string[]; // Safety constraints this template respects
}

export class ExplainabilityBuilder {
  // Phase 79 Section 4: Explainability Layer templates
  // These templates ensure no "AI thinks" claims, no psychological claims, no hidden logic
  private templates: ExplanationTemplate[] = [
    {
      id: 'high-alignment',
      template: 'This match reflects strong similarity in how you and this trainer describe fitness motivations and communication preferences.',
      minScore: 70,
      maxScore: 100,
      constraints: ['no-ai-thinks', 'no-psychology', 'transparent-logic']
    },
    {
      id: 'moderate-alignment',
      template: 'This match reflects moderate overlap in profile descriptions. You may share similar approaches to fitness goals.',
      minScore: 40,
      maxScore: 69,
      constraints: ['no-ai-thinks', 'no-psychology', 'transparent-logic']
    },
    {
      id: 'neutral-alignment',
      template: 'This match reflects some similarity in profile descriptions. Consider reviewing detailed profiles for fit.',
      minScore: 20,
      maxScore: 39,
      constraints: ['no-ai-thinks', 'no-psychology', 'transparent-logic']
    },
    {
      id: 'minimal-alignment',
      template: 'This match reflects limited semantic overlap. The match is primarily based on your explicit filter criteria.',
      minScore: 0,
      maxScore: 19,
      constraints: ['no-ai-thinks', 'no-psychology', 'transparent-logic']
    },
    {
      id: 'no-embeddings',
      template: 'Semantic similarity could not be calculated. This match is based on your explicit filters only.',
      minScore: 0,
      maxScore: 100,
      constraints: ['no-ai-thinks', 'no-psychology', 'transparent-logic', 'graceful-degradation']
    }
  ];

  /**
   * Build human-readable explanation for compatibility score
   * Phase 79 Section 4: Every compatibility signal must have human-readable explanation
   */
  buildExplanation(score: number, hasEmbeddings: boolean = true): string {
    if (!hasEmbeddings) {
      const noEmbeddingsTemplate = this.templates.find(t => t.id === 'no-embeddings');
      return noEmbeddingsTemplate?.template || 'Compatibility signal unavailable.';
    }

    const template = this.templates.find(t => 
      score >= t.minScore && score <= t.maxScore && t.id !== 'no-embeddings'
    );

    return template?.template || 'This match reflects similarity in profile descriptions.';
  }

  /**
   * Build detailed breakdown for UI display
   * Phase 79 Section 4: Optional breakdown (UI-safe)
   */
  buildBreakdown(
    fieldSimilarities: Array<{
      clientField: string;
      trainerField: string;
      similarity: number;
      weight: number;
    }>
  ): {
    motivationAlignment: 'High' | 'Medium' | 'Low';
    communicationOverlap: 'High' | 'Medium' | 'Low';
    goalLanguageOverlap: 'High' | 'Medium' | 'Low';
    fieldDetails: Array<{
      description: string;
      level: 'High' | 'Medium' | 'Low';
    }>;
  } {
    if (!fieldSimilarities || fieldSimilarities.length === 0) {
      return {
        motivationAlignment: 'Medium',
        communicationOverlap: 'Medium',
        goalLanguageOverlap: 'Medium',
        fieldDetails: []
      };
    }

    // Group similarities by category
    const motivationSimilarities = fieldSimilarities.filter(fs => 
      fs.clientField.includes('Motivation') || fs.trainerField.includes('philosophy')
    );
    
    const communicationSimilarities = fieldSimilarities.filter(fs => 
      fs.clientField.includes('communication') || fs.trainerField.includes('communication')
    );
    
    const goalSimilarities = fieldSimilarities.filter(fs => 
      fs.clientField.includes('goal') || fs.trainerField.includes('specialty')
    );

    // Calculate weighted averages
    const calcWeightedAverage = (similarities: typeof fieldSimilarities) => {
      if (similarities.length === 0) return 0.5; // Neutral default
      
      const totalWeight = similarities.reduce((sum, fs) => sum + fs.weight, 0);
      const weightedSum = similarities.reduce((sum, fs) => sum + (fs.similarity * fs.weight), 0);
      return totalWeight > 0 ? weightedSum / totalWeight : 0;
    };

    const motivationScore = calcWeightedAverage(motivationSimilarities);
    const communicationScore = calcWeightedAverage(communicationSimilarities);
    const goalScore = calcWeightedAverage(goalSimilarities);

    // Convert to High/Medium/Low
    const scoreToLevel = (score: number): 'High' | 'Medium' | 'Low' => {
      if (score > 0.7) return 'High';
      if (score > 0.3) return 'Medium';
      return 'Low';
    };

    // Build field details
    const fieldDetails = fieldSimilarities.map(fs => ({
      description: this.fieldToDescription(fs.clientField, fs.trainerField),
      level: scoreToLevel(fs.similarity)
    }));

    return {
      motivationAlignment: scoreToLevel(motivationScore),
      communicationOverlap: scoreToLevel(communicationScore),
      goalLanguageOverlap: scoreToLevel(goalScore),
      fieldDetails
    };
  }

  /**
   * Convert field IDs to human-readable descriptions
   */
  private fieldToDescription(clientField: string, trainerField: string): string {
    const fieldMap: Record<string, string> = {
      'personalMotivation': 'fitness motivation description',
      'medicalConditions': 'health considerations',
      'communicationStyle': 'communication preferences',
      'bio': 'profile description',
      'trainingPhilosophy': 'training approach',
      'specialties_description': 'specialization descriptions'
    };

    const clientDesc = fieldMap[clientField] || clientField;
    const trainerDesc = fieldMap[trainerField] || trainerField;

    return \\ ↔ \\;
  }

  /**
   * Generate UI tooltip text
   * Phase 79 Section 5: Tooltip always visible
   */
  buildTooltip(): string {
    return 'Compatibility Signal: Reflects semantic similarity in open-ended profile responses. This is a signal to explore, not a decision.';
  }

  /**
   * Generate disclaimer text for UI
   * Phase 79 Section 5: UI must reinforce "This is a signal to explore, not a decision."
   */
  buildDisclaimer(): string {
    return 'This compatibility signal reflects semantic similarity in language used in profiles. It does not indicate match quality, trainer skill, or guarantee success. Consider this one factor among many in your decision.';
  }

  /**
   * Validate explanation against Phase 79 safety constraints
   * Phase 79 Section 6: Safety + Integrity Guards
   */
  validateExplanation(explanation: string): { valid: boolean; violations: string[] } {
    const violations: string[] = [];
    
    // Check for prohibited phrases
    const prohibitedPhrases = [
      'AI thinks',
      'AI believes',
      'artificial intelligence',
      'will succeed',
      'guaranteed',
      'best match',
      'perfect for you',
      'psychologically',
      'mentally',
      'medically'
    ];
    
    for (const phrase of prohibitedPhrases) {
      if (explanation.toLowerCase().includes(phrase.toLowerCase())) {
        violations.push(\Contains prohibited phrase: "\"\);
      }
    }
    
    // Check for epistemic inflation
    const inflationaryPhrases = [
      'knows',
      'understands',
      'determined',
      'calculated',
      'optimized'
    ];
    
    for (const phrase of inflationaryPhrases) {
      if (new RegExp(\\\\\b\\\\\b\, 'i').test(explanation)) {
        violations.push(\May imply epistemic authority: "\"\);
      }
    }
    
    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Log explanation for auditability
   * Phase 79 Section 6: Logging for auditability
   */
  createAuditLog(
    explanation: string,
    score: number,
    clientId: string,
    trainerId: string,
    fieldSimilarities: Array<{clientField: string, trainerField: string, similarity: number}>
  ): Record<string, any> {
    const validation = this.validateExplanation(explanation);
    
    return {
      timestamp: new Date().toISOString(),
      client_id: clientId,
      trainer_id: trainerId,
      compatibility_score: score,
      explanation,
      explanation_valid: validation.valid,
      explanation_violations: validation.violations,
      field_similarities: fieldSimilarities,
      system_version: 'phase79-ai-assisted-compatibility',
      purpose: 'transparent-semantic-similarity-signal'
    };
  }
}
