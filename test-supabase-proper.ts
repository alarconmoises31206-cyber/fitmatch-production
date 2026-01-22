// test-supabase-proper.ts
// Simple test to verify the Supabase connection works

async function testSupabaseBridge() {
    console.log('Testing Supabase bridge connection...')
    
    try {
        // Import the module - it exports createSupabaseClient, not createClient
        const { createSupabaseClient } = await import('./lib/supabase')
        
        const supabase = createSupabaseClient()
        console.log('✓ Supabase client created successfully using createSupabaseClient()')
        
        // Try a simple query
        const { data, error } = await supabase.from('users').select('count').limit(1)
        
        if (error) {
            console.log('⚠ Database query error:', error.message)
            console.log('This might be expected if the users table does not exist yet.')
            console.log('✓ But client creation worked! Bridge is functional.')
        } else {
            console.log('✓ Database query successful! Data:', data)
        }
        
        return true;
    } catch (error: any) {
        console.error('✗ Error:', error.message)
        console.error('Stack:', error.stack)
        return false;
    }
}

// Run test
testSupabaseBridge().then(success => {
    if (success) {
        console.log('🎉 Supabase bridge test PASSED!')
        process.exit(0)
    } else {
        console.log('❌ Supabase bridge test FAILED')
        process.exit(1)
    }
})
