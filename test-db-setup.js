// test-db-setup.js
// Test database tables and setup

const { createClient } = require('@supabase/supabase-js');

async function testDatabaseSetup() {
    console.log('Testing database setup...');
    
    try {
        // Create client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        console.log('✓ Supabase client created');
        
        // Test 1: Check if we can list tables
        console.log('\n1. Testing table access...');
        const { data: tables, error: tablesError } = await supabase
            .from('_tables')
            .select('*')
            .limit(5);
        
        if (tablesError) {
            console.log('⚠ Cannot list tables directly (normal for Supabase):', tablesError.message);
        } else {
            console.log('✓ Tables found:', tables);
        }
        
        // Test 2: Try to create a test user
        console.log('\n2. Testing user creation...');
        const testUser = {
            email: 'test_' + Date.now() + '@example.com',
            created_at: new Date().toISOString()
        };
        
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([testUser])
            .select();
        
        if (userError) {
            console.log('⚠ User creation failed (table might not exist):', userError.message);
            console.log('This is expected if database tables are not set up yet.');
        } else {
            console.log('✓ User created successfully:', userData);
        }
        
        // Test 3: Check for existing tables by trying common ones
        console.log('\n3. Checking for common tables...');
        const commonTables = ['users', 'profiles', 'trainers', 'matches', 'conversations'];
        
        for (const table of commonTables) {
            try {
                const { error } = await supabase.from(table).select('count').limit(1);
                if (error) {
                    console.log(\  : ❌ Not found or error: \\);
                } else {
                    console.log(\  : ✅ Exists\);
                }
            } catch (err) {
                console.log(\  : ❌ Error: \\);
            }
        }
        
        return true;
    } catch (error) {
        console.error('✗ Error:', error.message);
        return false;
    }
}

// Load environment
require('dotenv').config({ path: '.env.local' });

// Run test
testDatabaseSetup().then(success => {
    if (success) {
        console.log('\n🎉 Database setup test completed!');
        console.log('\nNext steps:');
        console.log('1. Run database migrations if tables are missing');
        console.log('2. Check Supabase dashboard for table setup');
        process.exit(0);
    } else {
        console.log('\n❌ Database setup test failed');
        process.exit(1);
    }
});
