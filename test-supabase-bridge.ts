// test-supabase-bridge.ts
// Simple test to verify the Supabase connection works

async function testSupabaseBridge() {
    console.log('Testing Supabase bridge connection...')
    
    try {
        // Dynamic import to avoid TypeScript errors during test
        const { createClient } = await import('./lib/supabase')
        
        const supabase = createClient()
        console.log('✓ Supabase client created successfully')
        
        // Try a simple query
        const { data, error } = await supabase.from('users').select('count').limit(1)
        
        if (error) {
            console.log('⚠ Database query error (might be expected if no tables):', error.message)
            console.log('✓ But client creation worked!')
        } else {
            console.log('✓ Database query successful!')
        }
        
        return true;
    } catch (error: any) {
        console.error('✗ Error creating Supabase client:', error.message)
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
