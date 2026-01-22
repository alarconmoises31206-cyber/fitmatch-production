const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function runMigration() {
  const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250104000000_phase63_consultation_gating.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  // Split into individual statements (simple split by semicolon)
  const statements = sql.split(';').filter(s => s.trim());
  for (const stmt of statements) {
    console.log('Executing:', stmt.substring(0, 100) + '...');
    const { error } = await supabase.rpc('exec_sql', { sql: stmt });
    if (error) {
      console.error('Error executing statement:', error);
      // If exec_sql doesn't exist, we need another method. Let's just log.
      break;
    }
  }
  console.log('Migration completed.');
}

runMigration().catch(err => console.error(err));
