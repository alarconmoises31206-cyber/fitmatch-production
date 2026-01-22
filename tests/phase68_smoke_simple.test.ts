// tests/phase68_smoke_simple.test.ts
import { SimilarityService } from '../lib/SimilarityService';

describe('Phase 68 Basic Tests', () => {
  test('cosine similarity works', () => {
    const vec = [1, 2, 3];
    const result = SimilarityService.computeCosineSimilarity(vec, vec);
    expect(result).toBeCloseTo(1, 5);
  });

  test('normalization works', () => {
    expect(SimilarityService.normalizeSimilarity(1.0)).toBe(1.0);
    expect(SimilarityService.normalizeSimilarity(0.0)).toBe(0.5);
    expect(SimilarityService.normalizeSimilarity(-1.0)).toBe(0.0);
  });

  test('deterministic score returns object', () => {
    const result = SimilarityService.calculateDeterministicScore('a', 'b', null);
    expect(result).toHaveProperty('eligible');
    expect(result).toHaveProperty('hardFailures');
    expect(result).toHaveProperty('weightedScore');
    expect(result).toHaveProperty('confidence');
  });
});
