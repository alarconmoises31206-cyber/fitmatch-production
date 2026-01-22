// scripts/test-event-system.ts
import { initializeEventSystem } from '../infra/events.init';
import { createUser } from '../domain/services/userService';
import { createMatch } from '../domain/services/matchService';
import { validatePaymentCompletion } from '../domain/services/paymentService';
import { createTrainer } from '../domain/services/trainerService';
import { log } from '../infra/observability/log';

async function test() {
  console.log('=== Testing Phase 45 Event System ===\n')

  // Initialize event system
  initializeEventSystem()
  console.log('✅ Event system initialized.\n')

  // Test 1: User signup event
  console.log('Test 1: Creating user (should emit user.signed_up)')
  try {
    const user = createUser({
      id: 'test-user-123',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      wallet_balance: 0,
    })
    console.log(`   User created: ${user.id}`)
  } catch (error) {
    console.error('   Error:', error)
  }

  // Test 2: Trainer onboarding event
  console.log('\nTest 2: Creating trainer (should emit trainer.onboarded)')
  try {
    const trainer = createTrainer({
      id: 'test-trainer-456',
      user_id: 'test-user-123',
      specialization: 'Yoga',
      rating: 4.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    console.log(`   Trainer created: ${trainer.id}`)
  } catch (error) {
    console.error('   Error:', error)
  }

  // Test 3: Match creation event
  console.log('\nTest 3: Creating match (should emit match.created)')
  try {
    const match = createMatch({
      id: 'test-match-789',
      user_id: 'test-user-123',
      trainer_id: 'test-trainer-456',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    console.log(`   Match created: ${match.id}`)
  } catch (error) {
    console.error('   Error:', error)
  }

  // Test 4: Payment completion event
  console.log('\nTest 4: Validating payment (should emit payment.completed)')
  try {
    const payment = validatePaymentCompletion({
      id: 'test-payment-999',
      user_id: 'test-user-123',
      amount_cents: 5000,
      status: 'completed',
      stripe_payment_intent_id: 'pi_test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    console.log(`   Payment validated: ${payment.id}`)
  } catch (error) {
    console.error('   Error:', error)
  }

  console.log('\n=== Test complete ===')
  console.log('Check server logs for event publications and handler executions.')
}

// Run test if this file is executed directly
if (require.main === module) {
  test().catch(console.error)
}
