import { RankingEngine } from '../src/rankingEngine';
import { ClientData, TrainerCandidate, HardFilterRule, WeightClass } from '../src/types';

describe('Phase 69 - Ranking Engine Smoke Tests', () => {
  // Test data setup
  const clientData: ClientData = {
    clientId: 'client-123',
    questionnaireResponses: {
      q1: 'I want to build muscle',
      q2: 'I prefer morning workouts',
      q3: 'I have knee issues'
    },
    questionEmbeddings: {
      q1: [0.1, 0.2, 0.3],
      q2: [0.4, 0.5, 0.6],
      q3: [0.7, 0.8, 0.9]
    }
  };

  const trainers: TrainerCandidate[] = [
    {
      trainerId: 'trainer-a',
      questionnaireResponses: {
        q1: 'I specialize in muscle building',
        q2: 'I train in mornings',
        q3: 'I modify for knee issues',
        certification: 'certified',
        availability: true
      },
      questionEmbeddings: {
        q1: [0.15, 0.25, 0.35], // Similar to client
        q2: [0.45, 0.55, 0.65], // Similar to client
        q3: [0.75, 0.85, 0.95]  // Similar to client
      },
      availability: true,
      requiredResponses: ['q1', 'q2', 'q3']
    },
    {
      trainerId: 'trainer-b',
      questionnaireResponses: {
        q1: 'I do cardio training',
        q2: 'Evening sessions only',
        q3: 'No modifications',
        certification: 'certified',
        availability: true
      },
      questionEmbeddings: {
        q1: [0.8, 0.7, 0.6], // Less similar
        q2: [0.9, 0.8, 0.7], // Less similar
        q3: [0.6, 0.5, 0.4]  // Less similar
      },
      availability: true,
      requiredResponses: ['q1', 'q2', 'q3']
    }
  ];

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
      questionIds: ['q1', 'q2']
    },
    {
      type: 'secondary',
      weight: 0.5,
      questionIds: ['q3']
    }
  ];

  test('SMOKE TEST 1: Same inputs → same ranking', () => {
    const engine1 = new RankingEngine(clientData, trainers, hardFilterRules, weightClasses);
    const result1 = engine1.rankTrainers();
    
    const engine2 = new RankingEngine(clientData, trainers, hardFilterRules, weightClasses);
    const result2 = engine2.rankTrainers();
    
    // Check that rankings are identical
    expect(result1.rankedTrainers.map(t => t.trainerId))
      .toEqual(result2.rankedTrainers.map(t => t.trainerId));
    
    // Check that scores are identical
    result1.rankedTrainers.forEach((trainer, index) => {
      expect(trainer.totalScore).toBe(result2.rankedTrainers[index].totalScore);
    });
  });

  test('SMOKE TEST 2: Removing one answer predictably changes ordering', () => {
    // Test with complete data
    const completeEngine = new RankingEngine(clientData, trainers, hardFilterRules, weightClasses);
    const completeResult = completeEngine.rankTrainers();
    
    // Create trainer with missing answer
    const trainerWithMissingAnswer: TrainerCandidate = {
      ...trainers[0],
      questionEmbeddings: {
        ...trainers[0].questionEmbeddings
      }
    };
    delete trainerWithMissingAnswer.questionEmbeddings.q1;
    
    const trainersWithMissing = [trainerWithMissingAnswer, trainers[1]];
    const missingEngine = new RankingEngine(clientData, trainersWithMissing, hardFilterRules, weightClasses);
    const missingResult = missingEngine.rankTrainers();
    
    // The trainer with missing answer should have lower score
    const missingTrainer = missingResult.rankedTrainers.find(t => t.trainerId === 'trainer-a');
    const completeTrainer = completeResult.rankedTrainers.find(t => t.trainerId === 'trainer-a');
    
    expect(missingTrainer?.totalScore).toBeLessThan(completeTrainer!.totalScore);
  });

  test('SMOKE TEST 3: Hard filter failure fully removes trainer', () => {
    // Create uncertified trainer
    const uncertifiedTrainer: TrainerCandidate = {
      ...trainers[0],
      questionnaireResponses: {
        ...trainers[0].questionnaireResponses,
        certification: 'uncertified'
      }
    };
    
    const testTrainers = [uncertifiedTrainer, trainers[1]];
    const engine = new RankingEngine(clientData, testTrainers, hardFilterRules, weightClasses);
    const result = engine.rankTrainers();
    
    // Uncertified trainer should not appear in rankings
    const uncertifiedInRankings = result.rankedTrainers.find(t => t.trainerId === 'trainer-a');
    expect(uncertifiedInRankings).toBeUndefined();
    
    // Only certified trainer should appear
    expect(result.rankedTrainers.length).toBe(1);
    expect(result.rankedTrainers[0].trainerId).toBe('trainer-b');
  });

  test('SMOKE TEST 4: Strong secondary similarity cannot beat weak primary', () => {
    // Create two trainers with opposite strengths
    const primaryStrongTrainer: TrainerCandidate = {
      trainerId: 'primary-strong',
      questionnaireResponses: {
        q1: 'Muscle building',
        q2: 'Morning workouts',
        q3: 'No modifications',
        certification: 'certified',
        availability: true
      },
      questionEmbeddings: {
        q1: [0.1, 0.2, 0.3], // Very similar to client (primary)
        q2: [0.4, 0.5, 0.6], // Very similar to client (primary)
        q3: [0.1, 0.1, 0.1]  // Not similar (secondary)
      },
      availability: true,
      requiredResponses: ['q1', 'q2', 'q3']
    };

    const secondaryStrongTrainer: TrainerCandidate = {
      trainerId: 'secondary-strong',
      questionnaireResponses: {
        q1: 'Cardio',
        q2: 'Evening',
        q3: 'Knee modifications',
        certification: 'certified',
        availability: true
      },
      questionEmbeddings: {
        q1: [0.9, 0.8, 0.7], // Not similar (primary)
        q2: [0.8, 0.7, 0.6], // Not similar (primary)
        q3: [0.7, 0.8, 0.9]  // Very similar to client (secondary)
      },
      availability: true,
      requiredResponses: ['q1', 'q2', 'q3']
    };

    const testTrainers = [primaryStrongTrainer, secondaryStrongTrainer];
    const engine = new RankingEngine(clientData, testTrainers, hardFilterRules, weightClasses);
    const result = engine.rankTrainers();
    
    // Primary-strong trainer should rank higher despite weak secondary
    expect(result.rankedTrainers[0].trainerId).toBe('primary-strong');
    expect(result.rankedTrainers[1].trainerId).toBe('secondary-strong');
  });

  test('SMOKE TEST 5: Explainability survives ordering', () => {
    const engine = new RankingEngine(clientData, trainers, hardFilterRules, weightClasses);
    const result = engine.rankTrainers();
    
    // Check each ranked trainer has explanations
    result.rankedTrainers.forEach(trainer => {
      expect(trainer.explanation).toBeDefined();
      expect(Array.isArray(trainer.explanation)).toBe(true);
      expect(trainer.explanation.length).toBeGreaterThan(0);
      
      // Should include hard filter status
      expect(trainer.explanation.some(exp => exp.includes('Hard filters'))).toBe(true);
      
      // Should include score breakdown
      expect(trainer.explanation.some(exp => exp.includes('alignment'))).toBe(true);
    });
  });

  test('SMOKE TEST 6: Empty embedding system returns safe output', () => {
    // Client with no embeddings
    const clientNoEmbeddings: ClientData = {
      ...clientData,
      questionEmbeddings: {}
    };
    
    // Trainers with no embeddings
    const trainersNoEmbeddings: TrainerCandidate[] = trainers.map(trainer => ({
      ...trainer,
      questionEmbeddings: {}
    }));
    
    const engine = new RankingEngine(clientNoEmbeddings, trainersNoEmbeddings, hardFilterRules, weightClasses);
    const result = engine.rankTrainers();
    
    // System should not crash
    expect(result.rankedTrainers).toBeDefined();
    expect(Array.isArray(result.rankedTrainers)).toBe(true);
    
    // All trainers should have confidence < 1.0 due to missing embeddings
    result.rankedTrainers.forEach(trainer => {
      expect(trainer.confidence).toBeLessThan(1.0);
    });
  });
});
