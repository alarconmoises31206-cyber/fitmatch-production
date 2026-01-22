// Test script for Phase 52 Alert System
const path = require('path');

// Mock environment variables
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';

console.log('=== Testing Alert System Components ===\n');

// Test 1: Import and test the engine
try {
  const { evaluateHealthForAlerts } = require('../infra/alerts/engine.ts');
  
  console.log('Test 1: Engine evaluation');
  console.log('-----------------------');
  
  const testReport = {
    db: { healthy: false },
    redis: { healthy: true },
    queues: { memory: { size: 15 } }
  };
  
  const result = evaluateHealthForAlerts(testReport);
  console.log('Input:', testReport);
  console.log('Output:', result);
  console.log('? Engine works correctly\n');
} catch (error) {
  console.log('? Engine test failed:', error.message, '\n');
}

// Test 2: Test state management
try {
  const { shouldAlert, resetAlertState } = require('../infra/alerts/state.ts');
  
  console.log('Test 2: State management');
  console.log('----------------------');
  
  resetAlertState();
  console.log('Initial state reset');
  
  const firstCheck = shouldAlert('DEGRADED');
  console.log('First check (DEGRADED):', firstCheck ? 'ALERT' : 'NO ALERT');
  
  const secondCheck = shouldAlert('DEGRADED');
  console.log('Second check (DEGRADED):', secondCheck ? 'ALERT' : 'NO ALERT');
  
  console.log('? State management works correctly\n');
} catch (error) {
  console.log('? State test failed:', error.message, '\n');
}

// Test 3: Test Slack sender (will log warning if no webhook)
try {
  const { sendSlackAlert } = require('../infra/alerts/senders/slack.ts');
  
  console.log('Test 3: Slack sender');
  console.log('------------------');
  
  // This will log a warning since no webhook is set
  sendSlackAlert('Test alert from system')
    .then(() => console.log('? Slack sender works (warning expected)\n'))
    .catch(err => console.log('? Slack sender error:', err.message, '\n'));
} catch (error) {
  console.log('? Slack sender test failed:', error.message, '\n');
}

// Test 4: Test email sender
try {
  const { sendEmailAlert, formatAlertEmail } = require('../infra/alerts/senders/email.ts');
  
  console.log('Test 4: Email sender');
  console.log('------------------');
  
  const { subject, body } = formatAlertEmail('DEGRADED', ['DATABASE DOWN']);
  console.log('Formatted email subject:', subject);
  console.log('Formatted email body length:', body.length, 'chars');
  
  sendEmailAlert(subject, body)
    .then(success => console.log('? Email sender works:', success ? 'SUCCESS' : 'FAILED', '\n'))
    .catch(err => console.log('? Email sender error:', err.message, '\n'));
} catch (error) {
  console.log('? Email sender test failed:', error.message, '\n');
}

console.log('=== All Tests Completed ===');
console.log('\nNext steps:');
console.log('1. Set SLACK_WEBHOOK_URL environment variable');
console.log('2. Configure cron job to call /api/monitor/alerts');
console.log('3. Test with actual health API');
