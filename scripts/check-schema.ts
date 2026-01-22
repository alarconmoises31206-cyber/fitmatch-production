// Check if incident_log table has metadata column
// This is a utility to verify the database schema

import { getSupabaseClient } from '../../infra/adapters/supabase-client.adapter';

async function checkIncidentLogSchema() {
  const supabase = getSupabaseClient()
  
  try {
    // Try to insert and retrieve metadata to test
    const testIncident = {
      status: 'DEGRADED',
      service: 'schema-test',
      message: 'Testing metadata field',
      metadata: { test: true, remediation_attempts: [] }
    }
    
    const { data, error } = await supabase
      .from('incident_log')
      .insert(testIncident)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error testing metadata field:', error.message)
      console.log('⚠️  The incident_log table might need the metadata column.')
      console.log('Run this SQL in Supabase:')
      console.log(`
        ALTER TABLE incident_log 
        ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
      `)
      return false;
    }
    
    console.log('✅ Metadata field test successful:', data)
    
    // Clean up test record
    await supabase
      .from('incident_log')
      .delete()
      .eq('id', data.id)
    
    return true;
    
  } catch (error: any) {
    console.error('💥 Schema check failed:', error)
    return false;
  }
}

// Run check if executed directly
if (require.main === module) {
  checkIncidentLogSchema()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

export { checkIncidentLogSchema }
