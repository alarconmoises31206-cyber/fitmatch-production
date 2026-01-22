// Phase 71.7: Seed Data for Internal Testing
// Provides test clients and trainers for E2E verification

export const seedClients = [
  {
    userId: 'client-weight-loss',
    userType: 'client' as const,
    answers: [
      { questionId: 'q1', answer: 'Primary goal is weight loss and improved cardiovascular health' },
      { questionId: 'q2', answer: 'Available weekday evenings after 6 PM' },
      { questionId: 'q3', answer: 'No major injuries, but have lower back sensitivity' },
      { questionId: 'q4', answer: 'Prefer trainers who explain exercise science clearly' },
      { questionId: 'q5', answer: 'Want weekly progress tracking and adjustments' },
      { questionId: 'q6', answer: 'Respond best to supportive, encouraging coaching' }
    ],
    completedAt: new Date('2024-01-10')
  },
  {
    userId: 'client-strength-focused',
    userType: 'client' as const,
    answers: [
      { questionId: 'q1', answer: 'Want to build muscle mass and increase strength' },
      { questionId: 'q2', answer: 'Morning workouts before work, 6-8 AM' },
      { questionId: 'q3', answer: 'No injuries, willing to push hard' },
      { questionId: 'q4', answer: 'Prefer minimal explanation, just show me the workout' },
      { questionId: 'q5', answer: 'Monthly check-ins are sufficient' },
      { questionId: 'q6', answer: 'Like direct, no-nonsense feedback' }
    ],
    completedAt: new Date('2024-01-11')
  },
  {
    userId: 'client-rehab',
    userType: 'client' as const,
    answers: [
      { questionId: 'q1', answer: 'Recovering from knee surgery, need gentle rehab' },
      { questionId: 'q2', answer: 'Flexible schedule, prefer afternoons' },
      { questionId: 'q3', answer: 'Post-surgical knee, cannot do high impact' },
      { questionId: 'q4', answer: 'Need very detailed explanations for safety' },
      { questionId: 'q5', answer: 'Want daily progress notes initially' },
      { questionId: 'q6', answer: 'Need patient, reassuring coaching style' }
    ],
    completedAt: new Date('2024-01-12')
  }
];

export const seedTrainers = [
  // Trainer 1: Weight loss specialist
  {
    userId: 'trainer-cardio-expert',
    userType: 'trainer' as const,
    answers: [
      { questionId: 'q1', answer: 'Specialize in weight loss, metabolic conditioning, and cardio health' },
      { questionId: 'q2', answer: 'Available evenings and weekends for client sessions' },
      { questionId: 'q3', answer: 'Expert in adaptive training for injuries and limitations' },
      { questionId: 'q4', answer: 'Provide detailed exercise science explanations to all clients' },
      { questionId: 'q5', answer: 'Weekly progress tracking with adjustable programs' },
      { questionId: 'q6', answer: 'Coaching style is supportive, educational, and encouraging' }
    ],
    completedAt: new Date('2024-01-05'),
    metadata: {
      certification: 'certified',
      availability: true,
      specialties: ['weight loss', 'cardio', 'metabolic conditioning']
    }
  },
  
  // Trainer 2: Strength specialist
  {
    userId: 'trainer-strength-coach',
    userType: 'trainer' as const,
    answers: [
      { questionId: 'q1', answer: 'Focus on strength training, muscle building, power development' },
      { questionId: 'q2', answer: 'Morning sessions only, 5 AM to 10 AM' },
      { questionId: 'q3', answer: 'Push clients to safely achieve maximum strength gains' },
      { questionId: 'q4', answer: 'Brief, direct instructions focused on execution' },
      { questionId: 'q5', answer: 'Monthly strength testing and program updates' },
      { questionId: 'q6', answer: 'Direct, challenging, results-focused coaching' }
    ],
    completedAt: new Date('2024-01-06'),
    metadata: {
      certification: 'certified',
      availability: true,
      specialties: ['strength training', 'bodybuilding', 'powerlifting']
    }
  },
  
  // Trainer 3: Rehabilitation specialist
  {
    userId: 'trainer-rehab-specialist',
    userType: 'trainer' as const,
    answers: [
      { questionId: 'q1', answer: 'Specialize in post-injury rehab, gentle progression, recovery' },
      { questionId: 'q2', answer: 'Flexible schedule, can accommodate various times' },
      { questionId: 'q3', answer: 'Extensive experience with post-surgical and injury clients' },
      { questionId: 'q4', answer: 'Detailed explanations for every exercise for safety' },
      { questionId: 'q5', answer: 'Frequent progress monitoring, sometimes daily' },
      { questionId: 'q6', answer: 'Patient, reassuring, safety-first approach' }
    ],
    completedAt: new Date('2024-01-07'),
    metadata: {
      certification: 'certified',
      availability: true,
      specialties: ['rehabilitation', 'injury prevention', 'gentle exercise']
    }
  },
  
  // Trainer 4: Generalist with vague answers
  {
    userId: 'trainer-generalist',
    userType: 'trainer' as const,
    answers: [
      { questionId: 'q1', answer: 'I train all types of clients' },
      { questionId: 'q2', answer: 'Whenever' },
      { questionId: 'q3', answer: 'I adjust as needed' },
      { questionId: 'q4', answer: 'I explain things' },
      { questionId: 'q5', answer: 'We track progress' },
      { questionId: 'q6', answer: 'I coach people' }
    ],
    completedAt: new Date('2024-01-08'),
    metadata: {
      certification: 'certified',
      availability: true,
      specialties: ['general fitness']
    }
  },
  
  // Trainer 5: Uncertified trainer (should fail hard filter)
  {
    userId: 'trainer-uncertified',
    userType: 'trainer' as const,
    answers: [
      { questionId: 'q1', answer: 'I have experience but no formal certification' },
      { questionId: 'q2', answer: 'Available weekdays' },
      { questionId: 'q3', answer: 'Work with all fitness levels' },
      { questionId: 'q4', answer: 'Simple explanations' },
      { questionId: 'q5', answer: 'Check progress regularly' },
      { questionId: 'q6', answer: 'Motivational style' }
    ],
    completedAt: new Date('2024-01-09'),
    metadata: {
      certification: 'uncertified', // Will fail hard filter
      availability: true,
      specialties: ['experienced but uncertified']
    }
  }
];

// Edge case tests
export const edgeCaseTrainers = [
  // Empty answers
  {
    userId: 'trainer-empty-answers',
    userType: 'trainer' as const,
    answers: [
      { questionId: 'q1', answer: '' },
      { questionId: 'q2', answer: '' },
      { questionId: 'q3', answer: '' },
      { questionId: 'q4', answer: '' },
      { questionId: 'q5', answer: '' },
      { questionId: 'q6', answer: '' }
    ],
    completedAt: new Date(),
    metadata: {
      certification: 'certified',
      availability: true,
      specialties: []
    }
  },
  
  // Very short answers
  {
    userId: 'trainer-brief',
    userType: 'trainer' as const,
    answers: [
      { questionId: 'q1', answer: 'Yes' },
      { questionId: 'q2', answer: 'No' },
      { questionId: 'q3', answer: 'Maybe' },
      { questionId: 'q4', answer: 'Ok' },
      { questionId: 'q5', answer: 'Sure' },
      { questionId: 'q6', answer: 'Fine' }
    ],
    completedAt: new Date(),
    metadata: {
      certification: 'certified',
      availability: true,
      specialties: []
    }
  },
  
  // Missing some answers
  {
    userId: 'trainer-incomplete',
    userType: 'trainer' as const,
    answers: [
      { questionId: 'q1', answer: 'Strength training' },
      { questionId: 'q3', answer: 'No injuries' },
      // Missing q2, q4, q5, q6
    ],
    completedAt: new Date(),
    metadata: {
      certification: 'certified',
      availability: true,
      specialties: []
    }
  }
];

// Hard filter test cases
export const hardFilterTestCases = [
  // Unavailable trainer
  {
    userId: 'trainer-unavailable',
    userType: 'trainer' as const,
    answers: seedTrainers[0].answers, // Same as cardio expert
    completedAt: new Date(),
    metadata: {
      certification: 'certified',
      availability: false, // Will fail availability filter
      specialties: ['cardio']
    }
  },
  
  // Both filters failed
  {
    userId: 'trainer-double-fail',
    userType: 'trainer' as const,
    answers: seedTrainers[0].answers,
    completedAt: new Date(),
    metadata: {
      certification: 'uncertified',
      availability: false, // Will fail both filters
      specialties: []
    }
  }
];

export default {
  seedClients,
  seedTrainers,
  edgeCaseTrainers,
  hardFilterTestCases
};
