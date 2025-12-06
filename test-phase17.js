// test-phase17.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = '3a5c09c2-6d11-4f24-97f0-dc0229936c28';

async function testEndpoint(name, endpoint, method = 'post', data = {}) {
  try {
    console.log(`\n=== Testing ${name} ===`);
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data: method === 'post' ? data : undefined,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Success:`, response.data);
    return response.data;
  } catch (error) {
    console.log(`❌ Error:`, error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('Starting Phase 17 API Tests...');
  
  // 1. Test matches endpoint
  await testEndpoint('Matches API', '/api/ml/match', 'post', {
    user_id: TEST_USER_ID,
    limit: 5
  });
  
  // 2. Test credits get endpoint
  await testEndpoint('Credits Get', '/api/credits/get', 'post', {
    user_id: TEST_USER_ID
  });
  
// Get trainer ID from matches response first
const matches = await testEndpoint('Check Active Trainers', '/api/ml/match', 'post', {
  user_id: TEST_USER_ID,
  limit: 10
});

if (matches?.results?.length > 0) {
  const trainerId = matches.results[0].trainer.id;
  console.log(`\nUsing trainer ID: ${trainerId}`);
  
  // Test credits spend with real trainer ID
  await testEndpoint('Credits Spend', '/api/credits/spend', 'post', {
    user_id: TEST_USER_ID,
    trainer_id: trainerId
  });
}else {
    console.log('\n⚠️ No active trainers found. Testing with mock trainer ID...');
    await testEndpoint('Credits Spend (mock)', '/api/credits/spend', 'post', {
      user_id: TEST_USER_ID,
      trainer_id: '00000000-0000-0000-0000-000000000000'
    });
  }
}

runTests().catch(console.error);