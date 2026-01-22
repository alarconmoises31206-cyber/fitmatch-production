// check-table-data.js
// Check actual data in existing tables

const { createClient } = require('@supabase/supabase-js');

async function checkTableData() {
    console.log('📊 ACTUAL DATA IN TABLES\n');
    
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const tablesToCheck = ['profiles', 'conversations', 'matches'];
    
    for (const tableName of tablesToCheck) {
        console.log(`Checking ${tableName}:`);
        console.log('-'.repeat(40));
        
        try {
            // First check if table exists
            const { error: tableError } = await supabase
                .from(tableName)
                .select('count')
                .limit(1);
            
            if (tableError) {
                console.log(`  ❌ Table error: ${tableError.message}`);
                continue;
            }
            
            // Get sample data
            const { data, error, count } = await supabase
                .from(tableName)
                .select('*', { count: 'exact' })
                .limit(3);
            
            if (error) {
                console.log(`  ❌ Query error: ${error.message}`);
            } else {
                console.log(`  ✅ Found ${count} records`);
                if (data && data.length > 0) {
                    console.log(`  Sample records:`);
                    data.forEach((record, index) => {
                        console.log(`    ${index + 1}. ID: ${record.id}`);
                        // Show a few key fields
                        const keys = Object.keys(record).slice(0, 3);
                        keys.forEach(key => {
                            if (key !== 'id') {
                                console.log(`       ${key}: ${JSON.stringify(record[key]).substring(0, 50)}...`);
                            }
                        });
                    });
                } else {
                    console.log(`  ⚠ Table exists but has no data yet`);
                }
            }
        } catch (err) {
            console.log(`  ❌ Exception: ${err.message}`);
        }
        
        console.log('');
    }
    
    // Check for auth users
    console.log('Checking auth users:');
    console.log('-'.repeat(40));
    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        if (error) {
            console.log(`  ❌ Auth error: ${error.message}`);
        } else {
            console.log(`  ✅ Found ${users.length} auth users`);
            if (users.length > 0) {
                console.log(`  Recent users:`);
                users.slice(0, 3).forEach((user, index) => {
                    console.log(`    ${index + 1}. ${user.email} (${user.id.substring(0, 8)}...)`);
                    console.log(`       Created: ${new Date(user.created_at).toLocaleDateString()}`);
                });
            }
        }
    } catch (err) {
        console.log(`  ❌ Exception: ${err.message}`);
    }
}

require('dotenv').config({ path: '.env.local' });
checkTableData();
