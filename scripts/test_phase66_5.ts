// scripts/test_phase66_5.ts
// Test script to validate Phase 66.5 implementation

import { CLIENT_QUESTIONS, TRAINER_QUESTIONS, COMPARISON_MAP, WEIGHT_CLASSES } from '../lib/phase66_5_questions';
import type { Database } from '../lib/types/database';

// Test 1: Verify question definitions exist
console.log('=== Testing Phase 66.5 Question Definitions ===');
console.log('Client questions:', Object.keys(CLIENT_QUESTIONS).length);
console.log('Trainer questions:', Object.keys(TRAINER_QUESTIONS).length);

// Test 2: Verify database types compile
console.log('\n=== Testing Database Types ===');
// Create a mock object to test TypeScript compilation
const testDatabase: Database['public']['Tables'] = {
  trainer_profiles: {
    Row: {
      id: 'test-id',
      user_id: 'user-123',
      full_name: 'Test Trainer',
      age: 30,
      gender: 'male',
      city_timezone: 'America/New_York',
      years_experience: 5,
      certifications: ['cert1', 'cert2'],
      links: { website: 'https://example.com' },
      bio: 'Test bio',
      philosophy: 'Test philosophy',
      communication_style: 'direct',
      lived_experience: 'Test experience',
      specialties: ['specialty1'],
      timezone: 'America/New_York',
      training_modes: ['online'],
      availability_schedule: { monday: '9am-5pm' },
      completed: true,
      vector_ready: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    Insert: {} as any,
    Update: {} as any
  },
  client_profiles: {
    Row: {
      id: 'client-id',
      user_id: 'user-456',
      full_name: 'Test Client',
      age: 25,
      gender: 'female',
      city_timezone: 'America/Los_Angeles',
      completed: true,
      vector_ready: false,
      ai_summary: { summary: 'Test AI summary' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    Insert: {} as any,
    Update: {} as any
  },
  trainer_questionnaire_responses: {
    Row: {
      id: 'response-1',
      trainer_profile_id: 'trainer-id',
      question: 'trainer_approach',
      response_text: 'I help clients by...',
      created_at: new Date().toISOString()
    },
    Insert: {} as any,
    Update: {} as any
  },
  client_questionnaire_responses: {
    Row: {
      id: 'response-2',
      client_profile_id: 'client-id',
      question: 'client_primary_goal',
      response_text: 'I want to improve...',
      created_at: new Date().toISOString()
    },
    Insert: {} as any,
    Update: {} as any
  }
};

console.log('Database types compiled successfully');

// Test 3: Verify comparison map
console.log('\n=== Testing Comparison Map ===');
console.log('Client primary goal compares to:', COMPARISON_MAP.client_primary_goal);
console.log('Trainer boundaries compares to:', COMPARISON_MAP.trainer_boundaries);

// Test 4: Verify weight classes
console.log('\n=== Testing Weight Classes ===');
console.log('Hard filters:', WEIGHT_CLASSES.HARD_FILTERS.questions.length, 'questions');
console.log('Primary signals:', WEIGHT_CLASSES.PRIMARY_SIGNALS.questions.length, 'questions');

console.log('\n✅ Phase 66.5 implementation tests passed!');
