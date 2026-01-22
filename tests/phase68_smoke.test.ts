// tests/phase68_smoke.test.ts
// Phase 68 Smoke Tests

import { SimilarityService, DeterministicMatchScore } from '../lib/SimilarityService';

describe('Phase 68 — Similarity Math & Deterministic Scoring', () => {
  
  // 68.1 — Cosine Similarity Computation
  describe('68.1 Cosine Similarity', () => {
    test('identical vectors return ~1', () => {
      const vec = [1, 2, 3, 4, 5];
      const similarity = SimilarityService.computeCosineSimilarity(vec, vec);
      expect(similarity).toBeCloseTo(1, 5);
    });

    test('orthogonal vectors return ~0', () => {
      const vecA = [1, 0, 0];
      const vecB = [0, 1, 0];
      const similarity = SimilarityService.computeCosineSimilarity(vecA, vecB);
      expect(similarity).toBeCloseTo(0, 5);
    });

    test('opposite vectors return ~-1', () => {
      const vecA = [1, 2, 3];
      const vecB = [-1, -2, -3];
      const similarity = SimilarityService.computeCosineSimilarity(vecA, vecB);
      expect(similarity).toBeCloseTo(-1, 5);
    });

    test('empty vectors return NaN', () => {
      const similarity = SimilarityService.computeCosineSimilarity([], []);
      expect(similarity).toBeNaN();
    });
  });

  // 68.2 — Soft Score Normalization
  describe('68.2 Soft Score Normalization', () => {
    test('1.0 maps to 1.0', () => {
      expect(SimilarityService.normalizeSimilarity(1.0)).toBe(1.0);
    });

    test('0.0 maps to 0.5', () => {
      expect(SimilarityService.normalizeSimilarity(0.0)).toBe(0.5);
    });

    test('-1.0 maps to 0.0', () => {
      expect(SimilarityService.normalizeSimilarity(-1.0)).toBe(0.0);
    });

    test('NaN maps to 0', () => {
      expect(SimilarityService.normalizeSimilarity(NaN)).toBe(0);
    });

    test('values outside range are clamped', () => {
      expect(SimilarityService.normalizeSimilarity(1.5)).toBe(1.0);
      expect(SimilarityService.normalizeSimilarity(-1.5)).toBe(0.0);
    });
  });

  // 68.3 — Hard Filter Enforcement
  describe('68.3 Hard Filters', () => {
    test('empty answers pass hard filters', () => {
      const result = SimilarityService.checkHardFilters(
        new Map(),
        new Map(),
        new Map(),
        new Map()
      );
      expect(result.eligible).toBe(true);
      expect(result.failures).toHaveLength(0);
    });

    test('missing embeddings generate failures', () => {
      const clientAnswers = new Map([['client_constraints', 'Some constraints']]);
      const result = SimilarityService.checkHardFilters(
        clientAnswers,
        new Map(),
        new Map(), // No embeddings
        new Map()
      );
      expect(result.failures.some(f => f.includes('Missing embedding'))).toBe(true);
    });
  });

  // 68.4 — Weighted Soft Score Calculation
  describe('68.4 Weighted Scores', () => {
    test('weights are applied correctly', () => {
      const similarityScores = new Map([
        ['client_primary_goal', 0.8],
        ['trainer_approach', 0.8]
      ]);
      
      const result = SimilarityService.calculateWeightedScore(
        similarityScores,
        new Map([['client_primary_goal', [1,2,3]], ['trainer_approach', [1,2,3]]]),
        new Map()
      );
      
      expect(result.weightedScore).toBeGreaterThan(0);
      expect(result.weightedScore).toBeLessThanOrEqual(1);
      expect(Object.keys(result.softScores)).toHaveLength(2);
    });
  });

  // 68.5 — Confidence Calculation
  describe('68.5 Confidence', () => {
    test('empty answers reduce confidence', () => {
      const clientAnswers = new Map([['client_primary_goal', '']]);
      const confidence = SimilarityService.calculateConfidence(
        clientAnswers,
        new Map(),
        new Map(),
        new Map()
      );
      expect(confidence).toBeLessThan(1.0);
    });

    test('complete answers with embeddings give high confidence', () => {
      const clientAnswers = new Map([['client_primary_goal', 'I want to lose weight and build muscle']]);
      const clientEmbeddings = new Map([['client_primary_goal', [1,2,3,4,5]]]);
      
      const confidence = SimilarityService.calculateConfidence(
        clientAnswers,
        new Map(),
        clientEmbeddings,
        new Map()
      );
      expect(confidence).toBeGreaterThan(0.5);
    });
  });

  // 68.6 — Deterministic Output
  describe('68.6 Deterministic Output', () => {
    test('output structure matches interface', () => {
      const result = SimilarityService.calculateDeterministicScore(
        'test-client',
        'test-trainer',
        null
      );
      
      expect(result).toHaveProperty('eligible');
      expect(result).toHaveProperty('hardFailures');
      expect(result).toHaveProperty('softScores');
      expect(result).toHaveProperty('weightedScore');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('explanationTokens');
      expect(Array.isArray(result.hardFailures)).toBe(true);
      expect(Array.isArray(result.explanationTokens)).toBe(true);
    });
  });

  // Mechanical Smoke Tests
  describe('Mechanical Smoke Tests', () => {
    test('same input produces same output', () => {
      const result1 = SimilarityService.calculateDeterministicScore('a', 'b', null);
      const result2 = SimilarityService.calculateDeterministicScore('a', 'b', null);
      
      expect(result1.eligible).toBe(result2.eligible);
      expect(result1.weightedScore).toBe(result2.weightedScore);
      expect(result1.confidence).toBe(result2.confidence);
    });
  });
});

