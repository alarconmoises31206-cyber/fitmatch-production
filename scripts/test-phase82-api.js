// scripts/test-phase82-api.js
// Test script for Phase 82 API endpoint

const fetch = require('node-fetch');

async function testPhase82API() {
  const baseUrl = 'http://localhost:3000';
  const testSessionId = 'test_session_' + Date.now();
  
  console.log('?? Testing Phase 82 API Endpoint...');
  console.log('Base URL:', baseUrl);
  console.log('Test Session ID:', testSessionId);
  console.log('---');

  // Test 1: Valid request
  console.log('Test 1: Valid interpretation question response');
  try {
    const response = await fetch(`${baseUrl}/api/phase82/log-interpretation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: testSessionId,
        signalVisibilityState: 'visible',
        promptVariantId: 'interpretation-question-v1',
        selectedResponse: 'A suggestion to explore'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('? Test 1 PASSED');
    } else {
      console.log('? Test 1 FAILED:', data.error);
    }
  } catch (error) {
    console.log('? Test 1 ERROR:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Invalid response (should fail)
  console.log('Test 2: Invalid response (should be rejected)');
  try {
    const response = await fetch(`${baseUrl}/api/phase82/log-interpretation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: testSessionId + '_invalid',
        signalVisibilityState: 'visible',
        promptVariantId: 'interpretation-question-v1',
        selectedResponse: 'Invalid response that should fail'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (!response.ok && data.error) {
      console.log('? Test 2 PASSED (correctly rejected invalid response)');
    } else {
      console.log('? Test 2 FAILED (should have rejected invalid response)');
    }
  } catch (error) {
    console.log('? Test 2 ERROR:', error.message);
  }

  console.log('\n---\n');

  // Test 3: Duplicate session (should fail - once per session max)
  console.log('Test 3: Duplicate session submission (should be rejected)');
  try {
    const response = await fetch(`${baseUrl}/api/phase82/log-interpretation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: testSessionId, // Same session as Test 1
        signalVisibilityState: 'hidden',
        promptVariantId: 'influence-question-v1',
        selectedResponse: 'Not at all'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (!response.ok && data.error && data.error.includes('already submitted')) {
      console.log('? Test 3 PASSED (correctly rejected duplicate session)');
    } else {
      console.log('? Test 3 FAILED (should have rejected duplicate session)');
    }
  } catch (error) {
    console.log('? Test 3 ERROR:', error.message);
  }

  console.log('\n=== Phase 82 API Test Complete ===');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/phase82/log-interpretation', {
      method: 'HEAD'
    });
    return response.status !== 404;
  } catch {
    return false;
  }
}

// Run tests if server is available
checkServer().then(isRunning => {
  if (isRunning) {
    testPhase82API();
  } else {
    console.log('??  Server not running. Please start the Next.js dev server first:');
    console.log('   npm run dev');
    console.log('\nThen run this test script:');
    console.log('   node scripts/test-phase82-api.js');
  }
});
