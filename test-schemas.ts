// test-schemas.ts
import { 
  UserSchema, 
  TrainerSchema,
  CompleteQuestionnaireRequestSchema,
  AnswerQuestionRequestSchema,
  SendMessageRequestSchema,
  StartConversationRequestSchema,
  SaveTrainerProfileRequestSchema,
  CreateCheckoutSessionRequestSchema,
  PayoutStartRequestSchema
} from './domain/schemas';

// Test UserSchema
const validUser = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  wallet_balance: 1000
}

const invalidUser = {
  id: 123, // wrong type
  email: 'not-an-email',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  wallet_balance: 'not-a-number'
}

console.log('Testing UserSchema:')
console.log('Valid user:', UserSchema.safeParse(validUser).success)
console.log('Invalid user:', UserSchema.safeParse(invalidUser).success)

// Test API request schemas
const validQuestionnaireRequest = {
  role: 'client',
  user_id: 'user-123'
}

console.log('\nTesting CompleteQuestionnaireRequestSchema:')
console.log('Valid request:', CompleteQuestionnaireRequestSchema.safeParse(validQuestionnaireRequest).success)

console.log('\n? All schema tests completed (basic validation).')
