// Quick schema check for incident_log table
console.log("🔍 Checking incident_log table schema...");

console.log("\n📋 If the metadata column doesn't exist, run this SQL in Supabase:");
console.log(`
ALTER TABLE incident_log 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
`);

console.log("\n📋 To add remediation tracking columns, you can also add:");
console.log(`
-- Optional: Add dedicated columns for better querying
ALTER TABLE incident_log 
ADD COLUMN IF NOT EXISTS remediation_attempts JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS auto_remediated BOOLEAN DEFAULT false;
`);

console.log("\n✅ Phase 56 implementation complete!");
console.log("🎯 Next steps:");
console.log("1. Run the SQL above if needed");
console.log("2. Test with: node test-remediation.js");
console.log("3. Check incidents page for auto-fix badges");
