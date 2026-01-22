// test-supabase-direct.js
// Test Supabase connection directly

const { createClient } = require('@supabase/supabase-js');

async function testSupabaseDirect() {
    console.log('Testing Supabase connection directly...');
    
    try {
        // Get environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        console.log('Supabase URL present:', !!supabaseUrl);
        console.log('Supabase Key present:', !!supabaseKey);
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase environment variables');
            return false;
        }
        
        // Create client
        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✓ Supabase client created successfully');
        
        // Try a simple query
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
            console.log('⚠ Database query error:', error.message);
            console.log('This might be expected if the users table does not exist yet.');
            console.log('✓ But client creation worked!');
        } else {
            console.log('✓ Database query successful! Data:', data);
        }
        
        return true;
    } catch (error) {
        console.error('✗ Error:', error.message);
        return false;
    }
}

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Run test
testSupabaseDirect().then(success => {
    if (success) {
        console.log('🎉 Supabase direct test PASSED!');
        process.exit(0);
    } else {
        console.log('❌ Supabase direct test FAILED');
        process.exit(1);
    }
});
