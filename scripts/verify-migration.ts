// scripts/verify-migration.ts
import { checkEventPersistenceHealth } from "../infra/eventBus/persistence.health";

async function verifyMigration() {
    console.log("Verifying domain_events table migration...")
    
    const health = await checkEventPersistenceHealth()
    
    console.log("\n=== Migration Verification ===")
    console.log("Table exists:", health.tableExists)
    console.log("Healthy:", health.healthy)
    
    if (health.error) {
        console.log("Error:", health.error)
    }
    
    if (health.tableExists) {
        console.log("\n✅ Migration successful! The domain_events table exists and is accessible.")
        console.log("You can now proceed with testing the database persistence.")
    } else {
        console.log("\n❌ Table does not exist or is not accessible.")
        console.log("Please run the migration SQL in Supabase dashboard:")
        console.log("File: migrations/20251227_phase48_domain_events.sql")
        console.log("\nSteps:")
        console.log("1. Go to Supabase Dashboard")
        console.log("2. Open SQL Editor")
        console.log("3. Paste the SQL content")
        console.log("4. Click Run")
    }
    
    process.exit(health.tableExists ? 0 : 1)
}

verifyMigration().catch(console.error)
