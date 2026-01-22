// test-db-simple.js
// Simple database test

const { createClient } = require('@supabase/supabase-js');

async function testDatabaseSimple() {
    console.log('Testing database connection and tables...');
    
    try {
        // Create client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        console.log('✓ Supabase client created');
        
        // Check for common tables
        console.log('\nChecking for tables...');
        const tables = ['users', 'profiles', 'trainers', 'matches', 'conversations'];
        
        for (const table of tables) {
            try {
                const { error } = await supabase.from(table).select('count').limit(1);
                if (error) {
                    console.log(`  ${table}: ❌ Not found - ${error.message}`);
                } else {
                    console.log(`  ${table}: ✅ Exists`);
                }
            } catch (err) {
                console.log(`  ${table}: ❌ Error - ${err.message}`);
            }
        }
        
        console.log('\n✅ Database connection test completed!');
        console.log('\nNext steps:');
        console.log('1. If tables are missing, run database migrations');
        console.log('2. Check Supabase dashboard at: https://supabase.com/dashboard');
        console.log('3. The app can still run with missing tables for Phase 2 testing');
        
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

// Load environment
require('dotenv').config({ path: '.env.local' });

// Run test
testDatabaseSimple().then(success => {
    process.exit(success ? 0 : 1);
});
