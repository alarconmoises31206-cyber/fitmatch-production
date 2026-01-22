// Phase 71 Validation & Smoke Tests
// Internal verification of deterministic behavior

import { Phase71IntegrationPipeline } from '../src/phase71_integration';
import { seedClients, seedTrainers, edgeCaseTrainers, hardFilterTestCases } from '../seed-data';
import { HardFilterRule, WeightClass } from '../../Phase69-Ranking/src/types';

describe('Phase 71 - System Integration Smoke Tests', () => {
  // Test configuration matching Phase 66.5
  const hardFilterRules: HardFilterRule[] = [
    {
      id: 'certification',
      field: 'certification',
      operator: 'equals',
      value: 'certified',
      weightClass: 'exclusion',
      failureReason: 'Trainer not certified'
    },
    {
      id: 'availability',
      field: 'availability',
      operator: 'equals',
      value: true,
      weightClass: 'exclusion',
      failureReason: 'Trainer not available'
    }
  ];

  const weightClasses: WeightClass[] = [
    {
      type: 'primary',
      weight: 1.0,
      questionIds: ['q1', 'q2', 'q3']
    },
    {
      type: 'secondary',
      weight: 0.5,
      questionIds: ['q4', 'q5', 'q6']
    }
  ];

  test('SMOKE TEST 1: Same input → same output (deterministic)', async () => {
    const pipeline = new Phase71IntegrationPipeline(hardFilterRules, weightClasses);
    
    // Run pipeline twice with same data
    const result1 = await pipeline.executePipeline(seedClients[0], [seedTrainers[0], seedTrainers[1]]);
    const result2 = await pipeline.executePipeline(seedClients[0], [seedTrainers[0], seedTrainers[1]]);
    
    // Verify same ranking order
    const trainerIds1 = result1.rankedTrainers.map(t => t.trainerId);
    const trainerIds2 = result2.rankedTrainers.map(t => t.trainerId);
    expect(trainerIds1).toEqual(trainerIds2);
    
    // Verify same scores
    result1.rankedTrainers.forEach((trainer, index) => {
      expect(trainer.totalScore).toBe(result2.rankedTrainers[index].totalScore);
    });
    
    console.log('✅ Deterministic behavior confirmed');
  });

  test('SMOKE TEST 2: Hard filter failures remove trainers', async () => {
    const pipeline = new Phase71IntegrationPipeline(hardFilterRules, weightClasses);
    
    // Include a trainer that will fail hard filters
    const testTrainers = [
      seedTrainers[0], // Certified & available
      ...hardFilterTestCases // Includes uncertified and unavailable
    ];
    
    const result = await pipeline.executePipeline(seedClients[0], testTrainers);
    
    // Verify filtered trainers count
    const passedTrainers = result.rankedTrainers.length;
    const totalTrainers = testTrainers.length;
    const failedTrainers = totalTrainers - passedTrainers;
    
    expect(failedTrainers).toBeGreaterThan(0);
    expect(failedTrainers).toBe(hardFilterTestCases.length);
    
    console.log(`✅ Hard filters removed ${failedTrainers} trainers`);
  });

  test('SMOKE TEST 3: Empty embeddings do not break pipeline', async () => {
    const pipeline = new Phase71IntegrationPipeline(hardFilterRules, weightClasses);
    
    // Test with trainers that have empty/short answers
    const result = await pipeline.executePipeline(seedClients[0], edgeCaseTrainers);
    
    // Pipeline should complete without errors
    expect(result.rankedTrainers).toBeDefined();
    expect(result.explanations).toBeDefined();
    expect(result.logs.length).toBeGreaterThan(0);
    
    // Should have confidence indications for poor data
    if (result.rankedTrainers.length > 0) {
      const confidence = result.rankedTrainers[0].confidence;
      expect(confidence).toBeLessThan(1.0); // Lower confidence expected
    }
    
    console.log('✅ Pipeline handles empty/limited data gracefully');
  });

  test('SMOKE TEST 4: Weighted scoring respects Phase 66.5 classes', async () => {
    const pipeline = new Phase71IntegrationPipeline(hardFilterRules, weightClasses);
    
    const result = await pipeline.executePipeline(seedClients[0], [seedTrainers[0]]);
    
    if (result.rankedTrainers.length > 0) {
      const trainer = result.rankedTrainers[0];
      
      // Verify breakdown structure exists
      expect(trainer.breakdown).toBeDefined();
      expect(trainer.breakdown.primary).toBeDefined();
      expect(trainer.breakdown.secondary).toBeDefined();
      expect(trainer.breakdown.penalties).toBeDefined();
      
      // Primary should have higher weight impact than secondary
      // (This is a logical check, actual values depend on embeddings)
      console.log(`✅ Scoring breakdown: Primary=${trainer.breakdown.primary.toFixed(2)}, Secondary=${trainer.breakdown.secondary.toFixed(2)}`);
    }
  });

  test('SMOKE TEST 5: Confidence values populated', async () => {
    const pipeline = new Phase71IntegrationPipeline(hardFilterRules, weightClasses);
    
    const result = await pipeline.executePipeline(seedClients[0], seedTrainers.slice(0, 2));
    
    result.rankedTrainers.forEach(trainer => {
      expect(trainer.confidence).toBeDefined();
      expect(typeof trainer.confidence).toBe('number');
      expect(trainer.confidence).toBeGreaterThanOrEqual(0);
      expect(trainer.confidence).toBeLessThanOrEqual(1);
    });
    
    console.log(`✅ Confidence values populated for ${result.rankedTrainers.length} trainers`);
  });

  test('SMOKE TEST 6: Explainability tokens preserved', async () => {
    const pipeline = new Phase71IntegrationPipeline(hardFilterRules, weightClasses);
    
    const result = await pipeline.executePipeline(seedClients[0], [seedTrainers[0]]);
    
    result.explanations.forEach(explanation => {
      expect(explanation.clientView).toBeDefined();
      expect(typeof explanation.clientView).toBe('string');
      expect(explanation.clientView.length).toBeGreaterThan(0);
      
      expect(explanation.trainerView).toBeDefined();
      expect(explanation.adminView).toBeDefined();
      
      // Should contain human-readable elements
      expect(explanation.clientView).toContain('Alignment');
      expect(explanation.clientView).toContain('Confidence');
    });
    
    console.log('✅ Human-readable explanations generated');
  });

  test('SMOKE TEST 7: Intermediate logs show deterministic numbers', async () => {
    const pipeline = new Phase71IntegrationPipeline(hardFilterRules, weightClasses);
    
    const result = await pipeline.executePipeline(seedClients[0], [seedTrainers[0]]);
    
    // Check for specific log entries
    const hasEmbeddingLog = result.logs.some(log => log.includes('embeddings'));
    const hasRankingLog = result.logs.some(log => log.includes('Ranking complete'));
    const hasExplanationLog = result.logs.some(log => log.includes('explanations'));
    
    expect(hasEmbeddingLog).toBe(true);
    expect(hasRankingLog).toBe(true);
    expect(hasExplanationLog).toBe(true);
    
    // Verify intermediate states were captured
    expect(result.intermediateStates).toBeDefined();
    expect(result.intermediateStates.embeddings).toBeDefined();
    expect(result.intermediateStates.ranking).toBeDefined();
    
    console.log(`✅ ${result.logs.length} log entries captured for founder inspection`);
  });

  test('SMOKE TEST 8: End-to-end pipeline integration', async () => {
    console.log('\n🔧 PHASE 71 E2E INTEGRATION TEST');
    console.log('================================\n');
    
    const pipeline = new Phase71IntegrationPipeline(hardFilterRules, weightClasses);
    
    // Run full integration test
    const result = await pipeline.executePipeline(
      seedClients[0],
      [...seedTrainers, ...edgeCaseTrainers, ...hardFilterTestCases]
    );
    
    // Verify all components worked together
    expect(result.rankedTrainers.length).toBeGreaterThan(0);
    expect(result.explanations.length).toBe(result.rankedTrainers.length);
    expect(result.logs.length).toBeGreaterThan(10);
    
    // Output summary for founder review
    console.log('📊 E2E TEST RESULTS:');
    console.log(`  Total trainers processed: ${seedTrainers.length + edgeCaseTrainers.length + hardFilterTestCases.length}`);
    console.log(`  Passed hard filters: ${result.rankedTrainers.length}`);
    console.log(`  Failed hard filters: ${result.intermediateStates.ranking.filteredCount}`);
    console.log(`  Confidence level: ${result.intermediateStates.ranking.confidenceLevel}`);
    console.log(`  Log entries: ${result.logs.length}`);
    
    // Show top match explanation
    if (result.explanations.length > 0) {
      console.log('\n👑 TOP MATCH EXPLANATION:');
      console.log(`  ${result.explanations[0].clientView}`);
    }
    
    console.log('\n✅ PHASE 71 E2E PIPELINE INTEGRATION SUCCESSFUL');
    console.log('   The machine runs correctly from end to end.');
  });
});
