import React from 'react';
﻿// pages/diagnose-imports.tsx
export default function DiagnoseImportsPage() {
    const testImportChain: any= async () => {
  
        try {
            console.log('Testing import chain...')
            
            // Test 1: Direct Supabase import
            console.log('1. Testing direct @supabase/supabase-js import...')
  const { createClient } = await import('@supabase/supabase-js')
            console.log('✅ Direct Supabase import works')
            
            // Test 2: Our lib/supabase.ts import
            console.log('2. Testing lib/supabase.ts import...')
            try {
                const { createSupabaseClient } = await import('@/lib/supabase')
                console.log('✅ lib/supabase.ts import works')
                
                // Try to create client
                const client: any= createSupabaseClient()
                console.log('✅ Created Supabase client via our adapter')
            } catch (err: any) {
                console.error('❌ lib/supabase.ts import failed:', err.message)
                return `lib/supabase.ts import failed: ${err.message}`;
            }
            
            // Test 3: Check what log.ts exports
            console.log('3. Checking log.ts exports...')
            try {
                const logModule: any= await import('@/infra/observability/log')
                console.log('log.ts module exports:', Object.keys(logModule))
                console.log('✅ Can import log.ts')
            } catch (err: any) {
                console.error('❌ log.ts import failed:', err.message)
                return `log.ts import failed: ${err.message}`;
            }
            
            return '✅ All imports work!';
        } catch (err: any) {
            console.error('Overall error:', err)
            return `❌ Error: ${err.message}`;
        }
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <h1>Import Chain Diagnostic</h1>
            <p>This tests the exact import chain that's failing.</p>
            
            <button onClick={async () => {
  
                const result: any= await testImportChain()
  alert(result)
            }} style={{
                padding: '1rem 2rem',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '1rem'
            }}>
                Test Import Chain
            </button>
            
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Import Chain Being Tested:</h3>
                <ol>
                    <li>pages/diagnose-imports.tsx → imports lib/supabase.ts</li>
                    <li>lib/supabase.ts → imports infra/adapters/supabase-client.adapter.ts</li>
                    <li>supabase-client.adapter.ts → imports observability/log.ts</li>
                </ol>
                <p><strong>Expected Issue:</strong> log.ts exports don't match what adapter expects</p>
            </div>
        </div>
    )
}
