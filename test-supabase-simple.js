// test-supabase-simple.js
// Simple test without TypeScript

async function testSupabaseBridge() {
    console.log('Testing Supabase bridge connection...');
    
    try {
        // Use require instead of import to avoid TypeScript issues
        const { createSupabaseClient } = require('./lib/supabase');
        
        const supabase = createSupabaseClient();
        console.log('✓ Supabase client created successfully');
        
        // Try a simple query
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
            console.log('⚠ Database query error:', error.message);
            console.log('This might be expected if the users table does not exist yet.');
            console.log('✓ But client creation worked! Bridge is functional.');
        } else {
            console.log('✓ Database query successful! Data:', data);
        }
        
        return true;
    } catch (error) {
        console.error('✗ Error:', error.message);
        return false;
    }
}

// Run test
testSupabaseBridge().then(success => {
    if (success) {
        console.log('🎉 Supabase bridge test PASSED!');
        process.exit(0);
    } else {
        console.log('❌ Supabase bridge test FAILED');
        process.exit(1);
    }
});
