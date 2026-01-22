// Test script for Phase 56 Auto-Remediation Engine
import { logIncident } from "../infra/alerts/persistence";

async function testRemediation() {
  console.log("🧪 Testing Auto-Remediation Engine...\n")
  
  // Test 1: Redis connection failure
  console.log("1. Testing Redis connection failure remediation:")
  try {
    const incident = await logIncident({
      status: 'CRITICAL',
      service: 'redis-cache',
      message: 'Redis connection timeout: Failed to connect after 3 attempts',
      metadata: { component: 'cache-layer', error_code: 'CONN_TIMEOUT' }
    })
    
    console.log(`   ✅ Incident logged: ${incident.id}`)
    console.log(`   ⏱️  Auto-remediation should trigger in background...\n`)
    
    // Wait a bit for remediation to complete
    await new Promise(resolve => setTimeout(resolve, 2000))
    
  } catch (error: any) {
    console.log(`   ❌ Failed to log incident: ${error.message}\n`)
  }
  
  // Test 2: Non-remediated incident (should not trigger)
  console.log("2. Testing non-remediated incident (should not trigger):")
  try {
    const incident = await logIncident({
      status: 'DEGRADED',
      service: 'database',
      message: 'High query latency detected',
      metadata: { avg_latency_ms: 450 }
    })
    
    console.log(`   ✅ Incident logged: ${incident.id}`)
    console.log(`   📝 No remediation expected for database latency\n`)
    
  } catch (error: any) {
    console.log(`   ❌ Failed to log incident: ${error.message}\n`)
  }
  
  console.log("🎯 Test completed!")
  console.log("Check the incident_log table for remediation_attempts in metadata")
}

// Run test if this file is executed directly
if (require.main === module) {
  testRemediation().catch(console.error)
}
