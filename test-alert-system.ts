import { evaluateHealthForAlerts } from "./infra/alerts/engine";
import { shouldAlert, resetAlertState } from "./infra/alerts/state";

// Test 1: Healthy system
console.log("Test 1: Healthy system")
const healthyReport = {
db: { healthy: true },
redis: { healthy: true },
queues: { memory: { size: 5 } }
}
const result1 = evaluateHealthForAlerts(healthyReport)
console.log("Status:", result1.status, "Issues:", result1.issues)

// Test 2: Database down
console.log("\nTest 2: Database down")
const dbDownReport = {
db: { healthy: false },
redis: { healthy: true },
queues: { memory: { size: 5 } }
}
const result2 = evaluateHealthForAlerts(dbDownReport)
console.log("Status:", result2.status, "Issues:", result2.issues)
console.log("Should alert?", shouldAlert(result2.status))

// Test 3: Queue backlog
console.log("\nTest 3: Queue backlog")
const queueReport = {
db: { healthy: true },
redis: { healthy: true },
queues: { memory: { size: 15 } }
}
const result3 = evaluateHealthForAlerts(queueReport)
console.log("Status:", result3.status, "Issues:", result3.issues)

// Reset for next test
resetAlertState()
console.log("\nAlert state reset")
