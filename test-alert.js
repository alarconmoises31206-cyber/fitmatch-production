const { evaluateHealthForAlerts } = require('./infra/alerts/engine.js');
const { shouldAlert, resetAlertState } = require('./infra/alerts/state.js');

console.log('Testing Alert System');
console.log('===================');

// Test 1: Healthy system
console.log('\nTest 1: Healthy system');
const healthyReport = {
db: { healthy: true },
redis: { healthy: true },
queues: { memory: { size: 5 } }
};
const result1 = evaluateHealthForAlerts(healthyReport);
console.log('Status:', result1.status);
console.log('Issues:', result1.issues);

// Test 2: Database down
console.log('\nTest 2: Database down');
resetAlertState();
const dbDownReport = {
db: { healthy: false },
redis: { healthy: true },
queues: { memory: { size: 5 } }
};
const result2 = evaluateHealthForAlerts(dbDownReport);
console.log('Status:', result2.status);
console.log('Issues:', result2.issues);
console.log('Should alert?', shouldAlert(result2.status));

// Test 3: Queue backlog
console.log('\nTest 3: Queue backlog');
resetAlertState();
const queueReport = {
db: { healthy: true },
redis: { healthy: true },
queues: { memory: { size: 15 } }
};
const result3 = evaluateHealthForAlerts(queueReport);
console.log('Status:', result3.status);
console.log('Issues:', result3.issues);
console.log('Should alert?', shouldAlert(result3.status));

console.log('\nAll tests completed!');
