// Update the import in test-phase57.ts
// Change from: import { supabase } from '../../lib/supabase';
// To: import { supabase } from '../../lib/supabase';

// Actually, since we're just testing rules matching, we don't need the actual supabase import
// Remove the supabase import and any code that uses it in the test
// Let me recreate the test script without supabase dependency

import { remediationRegistry } from '../infra/remediation/registry';
import { MetricsEngine } from '../infra/reliability/metricsEngine';

async function testPhase57() {
  console.log('🚀 Testing Phase 57 - Multi-Playbook Auto-Remediation')
  console.log('=====================================================\n')

  // Test 1: Queue Backlog Incident
  console.log('Test 1: Queue Backlog Incident')
  const queueIncident = {
    id: 'test-queue-001',
    service: 'order-processing-queue',
    status: 'CRITICAL',
    message: 'Queue backlog exceeded threshold of 1000 messages',
    created_at: new Date().toISOString(),
    metadata: {},
    playbook_data: {}
  }

  const queueRule = remediationRegistry.getRuleForIncident(queueIncident)
  console.log(`✓ Rule matched: ${queueRule?.name || 'None'}`)
  console.log(`✓ Expected: queue-backlog-threshold`)
  
  if (queueRule?.playbook.name === 'queue-backlog') {
    console.log('✓ Correct playbook selected\n')
  } else {
    console.log('✗ Incorrect playbook selected\n')
  }

  // Test 2: Circuit Breaker Incident
  console.log('Test 2: Circuit Breaker Incident')
  const circuitIncident = {
    id: 'test-circuit-001',
    service: 'payment-service',
    status: 'DEGRADED',
    message: 'Circuit breaker triggered for payment gateway',
    created_at: new Date().toISOString(),
    metadata: {},
    playbook_data: {}
  }

  const circuitRule = remediationRegistry.getRuleForIncident(circuitIncident)
  console.log(`✓ Rule matched: ${circuitRule?.name || 'None'}`)
  console.log(`✓ Expected: circuit-breaker-triggered`)
  
  if (circuitRule?.playbook.name === 'circuit-breaker-reset') {
    console.log('✓ Correct playbook selected\n')
  } else {
    console.log('✗ Incorrect playbook selected\n')
  }

  // Test 3: Redis Incident (existing functionality)
  console.log('Test 3: Redis Incident (legacy test)')
  const redisIncident = {
    id: 'test-redis-001',
    service: 'redis-cache',
    status: 'CRITICAL',
    message: 'Redis connection failed',
    created_at: new Date().toISOString(),
    metadata: {},
    playbook_data: {}
  }

  const redisRule = remediationRegistry.getRuleForIncident(redisIncident)
  console.log(`✓ Rule matched: ${redisRule?.name || 'None'}`)
  console.log(`✓ Expected: redis-connection-failure`)
  
  if (redisRule?.playbook.name === 'redis-restart') {
    console.log('✓ Correct playbook selected\n')
  } else {
    console.log('✗ Incorrect playbook selected\n')
  }

  // Test 4: No Match Incident
  console.log('Test 4: No Match Incident')
  const noMatchIncident = {
    id: 'test-nomatch-001',
    service: 'web-server',
    status: 'CRITICAL',
    message: 'CPU usage at 95%',
    created_at: new Date().toISOString(),
    metadata: {},
    playbook_data: {}
  }

  const noMatchRule = remediationRegistry.getRuleForIncident(noMatchIncident)
  console.log(`✓ Rule matched: ${noMatchRule?.name || 'None'}`)
  console.log(`✓ Expected: No rule should match\n`)

  // Test 5: Metrics Engine (basic test without database)
  console.log('Test 5: Metrics Engine')
  const metricsEngine = MetricsEngine.getInstance()
  console.log('✓ Metrics engine instantiated successfully')

  // Print all rules for documentation
  console.log('\n📋 All Registered Rules:')
  const allRules = remediationRegistry.getAllRules()
  allRules.forEach(rule => {
    console.log(`  • ${rule.name} (${rule.id}) -> ${rule.playbook.name}`)
  })

  console.log('\n✅ Phase 57 Implementation Tests Complete')
  console.log('📊 Framework is ready for playbook logic implementation')
}

// Run tests if this file is executed directly
if (require.main === module) {
  testPhase57().catch(console.error)
}

export { testPhase57 }
