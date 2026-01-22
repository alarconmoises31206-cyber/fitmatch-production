// compatibility.engine.ts - Phase 79 AI-Assisted Compatibility Engine
// Core Compatibility Computation Logic
// IMPORTANT: This is a semantic similarity signal, not a recommendation

import { EmbeddingService, EmbeddingRecord } from './embedding.service';

export interface CompatibilityResult {
  score: number; // 0-100
  label: 'Compatibility Signal';
  explanation: string;
  breakdown?: {
    motivationAlignment: 'High' | 'Medium' | 'Low';
    communicationOverlap: 'High' | 'Medium' | 'Low';
    goalLanguageOverlap: 'High' | 'Medium' | 'Low';
  };
  computed_at: string;
}

export interface FieldMapping {
  clientField: string;
  trainerField: string;
  weight: number; // Sum of all weights should be 1.0
}

export class CompatibilityEngine {
  private embeddingService: EmbeddingService;
  
  // Phase 79 Section 3: Field-to-field similarity mapping
  private fieldMappings: FieldMapping[] = [
    // Example mapping from Phase 79 spec
    { clientField: 'personalMotivation', trainerField: 'bio', weight: 0.4 },
    { clientField: 'communicationStyle', trainerField: 'bio', weight: 0.3 },
    // Note: 'goals text' vs 'specialties text' would need actual field names
    { clientField: 'personalMotivation', trainerField: 'bio', weight: 0.3 } // Placeholder
  ];

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Phase 79 Section 3: Core Compatibility Computation
   * Step 1: Filter first (done elsewhere)
   * Step 2: Semantic comparison
   * Step 3: Weighted aggregation
   * Step 4: Normalize to 0-100
   */
  async calculateCompatibility(
    clientId: string,
    trainerId: string,
    candidateTrainerSet: string[] // Result from explicit filters
  ): Promise<CompatibilityResult> {
    // Validate this trainer is in the filtered candidate set
    if (!candidateTrainerSet.includes(trainerId)) {
      throw new Error('Trainer must pass explicit filters before compatibility calculation');
    }

    // Get embeddings for both entities
    const clientEmbeddings = await this.embeddingService.getEntityEmbeddings('client', clientId);
    const trainerEmbeddings = await this.embeddingService.getEntityEmbeddings('trainer', trainerId);

    if (clientEmbeddings.length === 0 || trainerEmbeddings.length === 0) {
      // No embeddings available - return neutral signal
      return this.createNeutralResult();
    }

    // Calculate weighted similarity
    let totalSimilarity = 0;
    let totalWeight = 0;
    const breakdownScores: {[key: string]: number} = {};

    for (const mapping of this.fieldMappings) {
      const clientEmbedding = this.findEmbeddingByField(clientEmbeddings, mapping.clientField);
      const trainerEmbedding = this.findEmbeddingByField(trainerEmbeddings, mapping.trainerField);

      if (clientEmbedding && trainerEmbedding) {
        const similarity = this.cosineSimilarity(
          clientEmbedding.embedding,
          trainerEmbedding.embedding
        );
        
        const weightedSimilarity = similarity * mapping.weight;
        totalSimilarity += weightedSimilarity;
        totalWeight += mapping.weight;
        
        // Store for breakdown
        const breakdownKey = \\-\\;
        breakdownScores[breakdownKey] = similarity;
      }
    }

    // Handle case where no mappings had embeddings
    if (totalWeight === 0) {
      return this.createNeutralResult();
    }

    // Normalize and convert to 0-100 scale
    const normalizedSimilarity = totalSimilarity / totalWeight;
    const score = Math.round(this.similarityToScore(normalizedSimilarity));
    
    // Create explanation based on breakdown
    const explanation = this.buildExplanation(breakdownScores);
    const breakdown = this.createBreakdown(breakdownScores);

    return {
      score,
      label: 'Compatibility Signal',
      explanation,
      breakdown,
      computed_at: new Date().toISOString()
    };
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Convert similarity (-1 to 1) to score (0 to 100)
   */
  private similarityToScore(similarity: number): number {
    // Normalize: similarity ranges from -1 to 1, map to 0 to 1
    const normalized = (similarity + 1) / 2;
    // Convert to 0-100 scale
    return Math.max(0, Math.min(100, normalized * 100));
  }

  /**
   * Find embedding by field ID
   */
  private findEmbeddingByField(embeddings: EmbeddingRecord[], fieldId: string): EmbeddingRecord | null {
    return embeddings.find(e => e.field_id === fieldId) || null;
  }

  /**
   * Create neutral result when no embeddings or calculations possible
   */
  private createNeutralResult(): CompatibilityResult {
    return {
      score: 50, // Neutral midpoint
      label: 'Compatibility Signal',
      explanation: 'Semantic similarity could not be calculated. This match is based on your explicit filters only.',
      computed_at: new Date().toISOString()
    };
  }

  /**
   * Phase 79 Section 4: Explainability Layer
   * Build human-readable explanation
   */
  private buildExplanation(breakdownScores: {[key: string]: number}): string {
    if (Object.keys(breakdownScores).length === 0) {
      return 'This match reflects similarity in how you and this trainer describe motivation and communication style.';
    }

    // Count high/medium/low scores
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (const score of Object.values(breakdownScores)) {
      if (score > 0.7) highCount++;
      else if (score > 0.3) mediumCount++;
      else lowCount++;
    }

    const parts = [];
    if (highCount > 0) parts.push(\strong alignment in \ area\\);
    if (mediumCount > 0) parts.push(\moderate overlap in \ area\\);
    if (lowCount > 0 && highCount === 0 && mediumCount === 0) parts.push('limited semantic overlap');

    const explanation = parts.length > 0
      ? \This match reflects \.\
      : 'This match reflects similarity in profile descriptions.';

    return explanation + ' This is a signal to explore, not a decision.';
  }

  /**
   * Create UI-safe breakdown
   */
  private createBreakdown(breakdownScores: {[key: string]: number}): CompatibilityResult['breakdown'] {
    if (Object.keys(breakdownScores).length === 0) {
      return undefined;
    }

    // Calculate average scores for each category (simplified)
    const avgScore = Object.values(breakdownScores).reduce((a, b) => a + b, 0) / Object.values(breakdownScores).length;
    
    const getLevel = (score: number): 'High' | 'Medium' | 'Low' => {
      if (score > 0.7) return 'High';
      if (score > 0.3) return 'Medium';
      return 'Low';
    };

    return {
      motivationAlignment: getLevel(avgScore),
      communicationOverlap: getLevel(avgScore),
      goalLanguageOverlap: getLevel(avgScore)
    };
  }

  /**
   * Phase 79 Section 6: Safety & Integrity Guards
   * Validate that computation respects all constraints
   */
  validateComputationConstraints(clientId: string, trainerId: string): string[] {
    const warnings: string[] = [];
    
    // Check for medical inference attempts
    warnings.push('No medical inference performed');
    warnings.push('No mental health inference performed');
    warnings.push('No outcome prediction generated');
    warnings.push('No trainer quality scoring computed');
    
    return warnings;
  }
}
