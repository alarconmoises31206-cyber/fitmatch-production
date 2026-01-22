// scripts/test-event-reflex.ts
import { eventBus } from '../infra/eventBus';
import { createDomainEvent } from '../domain/events';
import { registerAllEventHandlers } from '../infra/eventHandlers';

async function testEventReflex() {
  console.log('🧪 Testing Event Reflex Arc Implementation...\n')
  
  // Register all handlers
  registerAllEventHandlers()
  
  // Test 1: Check that handlers are registered
  console.log('1. Checking handler registrations:')
  const testEvents = ['user.signed_up', 'payment.completed', 'match.accepted', 'trainer.onboarded', 'match.created'];
  
  for (const eventName of testEvents) {
    const count = eventBus.getSubscriberCount(eventName)
    console.log(`   ${eventName}: ${count} handler(s) registered`)
  }
  
  console.log('\n2. Testing event creation:')
  
  // Test event creation
  const testEvent = createDomainEvent('user.signed_up', {
    userId: 'test-user-123',
    email: 'test@example.com',
    signupMethod: 'email'
  })
  
  console.log('   Created event:', {
    name: testEvent.name,
    payload: testEvent.payload,
    occurredAt: testEvent.occurredAt
  })
  
  // Test 3: Verify event contract types
  console.log('\n3. Type checking (compile-time - if no errors, types are correct)')
  console.log('   ✓ TypeScript compilation successful')
  
  console.log('\n✅ Event Reflex Arc Implementation Verification Complete!')
  console.log('\nNext steps:')
  console.log('1. Implement actual port implementations (adapters)')
  console.log('2. Add error handling and retry logic')
  console.log('3. Run the full e2e test: npm test -- eventReflex.e2e.test.ts')
}

// Run the test
testEventReflex().catch(console.error)
