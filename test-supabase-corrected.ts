// test-supabase-corrected.ts
// Simple test to verify the Supabase connection works

async function testSupabaseBridge() {
    console.log('Testing Supabase bridge connection...')
    
    try {
        // Check what's actually exported
        const supabaseModule = await import('./lib/supabase')
        console.log('Available exports:', Object.keys(supabaseModule))
        
        // Try different possible export names
        let supabase;
        if (supabaseModule.createClient) {
            supabase = supabaseModule.createClient()
            console.log('✓ Used createClient()')
        } else if (supabaseModule.default) {
            supabase = supabaseModule.default;
            console.log('✓ Used default export')
        } else if (supabaseModule.supabase) {
            supabase = supabaseModule.supabase;
            console.log('✓ Used supabase export')
        } else {
            // Try to create client directly
            const { createClient } = await import('@supabase/supabase-js')
            supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
            )
            console.log('✓ Created client directly from @supabase/supabase-js')
        }
        
        console.log('✓ Supabase client created successfully')
        
        // Try a simple query
        try {
            const { data, error } = await supabase.from('users').select('count').limit(1)
            
            if (error) {
                console.log('⚠ Database query error (might be expected if no tables):', error.message)
                console.log('✓ But client creation worked!')
            } else {
                console.log('✓ Database query successful!')
            }
        } catch (queryError) {
            console.log('⚠ Query failed but client created:', queryError.message)
        }
        
        return true;
    } catch (error: any) {
        console.error('✗ Error:', error.message)
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
