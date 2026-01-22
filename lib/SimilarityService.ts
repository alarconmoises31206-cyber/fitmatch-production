// lib/SimilarityService.ts - Phase 68 Core Implementation
import { CLIENT_QUESTIONS, TRAINER_QUESTIONS, WEIGHT_CLASSES, COMPARISON_MAP } from './phase66_5_questions';

export interface DeterministicMatchScore {
  eligible: boolean;
  hardFailures: string[];
  softScores: Record<string, number>;
  weightedScore: number;
  confidence: number;
  explanationTokens: string[];
}

export class SimilarityService {
  // Weight constants from Phase 66.5
  private static readonly WEIGHTS: Record<string, number> = {
    // Primary signals: Goal?Approach, Style?Style (weight: 0.4 each)
    "client_primary_goal": 0.4,
    "trainer_approach": 0.4,
    "client_interaction_style": 0.4,
    "trainer_communication_style": 0.4,
    
    // Secondary signals: Readiness?Best-fit, Expectations?Philosophy (weight: 0.2 each)
    "client_readiness": 0.2,
    "trainer_best_fit_clients": 0.2,
    "trainer_consultation_philosophy": 0.2
  };
  // 68.1
  static computeCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (!vectorA || !vectorB || vectorA.length === 0 || vectorB.length === 0) return NaN;
    if (vectorA.length !== vectorB.length) throw new Error("Vector dimension mismatch");
    
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    return normA === 0 || normB === 0 ? 0 : dotProduct / (normA * normB);
  }

  // 68.2
  static normalizeSimilarity(cosineSim: number): number {
    if (isNaN(cosineSim)) return 0;
    const normalized = (cosineSim + 1) / 2;
    return Math.max(0, Math.min(1, normalized));
  }

  // 68.3 (simplified)
  static checkHardFilters(): { eligible: boolean; failures: string[] } {
    return { eligible: true, failures: [] };
  }

  // 68.4 (simplified)
  static calculateWeightedScore(): { softScores: Record<string, number>; weightedScore: number } {
    return { softScores: {}, weightedScore: 0.5 };
  }

  // 68.5 (simplified)
  static calculateConfidence(): number {
    return 0.8;
  }

  // 68.6 (simplified)
  static calculateDeterministicScore(
    clientId: string,
    trainerId: string,
    supabaseClient: any
  ): DeterministicMatchScore {
    return {
      eligible: true,
      hardFailures: [],
      softScores: {
        'client_primary_goal': 0.85,
        'trainer_approach': 0.85,
        'client_interaction_style': 0.92,
        'trainer_communication_style': 0.92
      },
      weightedScore: 0.82,
      confidence: 0.88,
      explanationTokens: ['Phase 68 implementation in progress']
    };
  }
}

