import React from 'react';
﻿// pages/minimal-phase2.tsx
export default function MinimalPhase2Test() {
    const testDatabase: any= async () => {
  
        try {
            // Direct Supabase test without log dependency
  const { createClient } = await import('@supabase/supabase-js')
            
            const supabase: any= createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL || '',
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
            )
            
            const { data, error } = await supabase.from('profiles').select('count').limit(1)
            
            if (error) {
                alert('Database error (profiles table): ' + error.message)
            } else {
                alert('Database connected! Profiles count check successful.')
            }
        } catch (err: any) {
            alert('Error: ' + err.message)
        }
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <h1>Minimal Phase 2 Test</h1>
            <p>This test bypasses the log.ts dependency issues.</p>
            
            <button onClick={testDatabase} style={{
                padding: '1rem 2rem',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '1rem'
            }}>
                Test Database Connection
            </button>
            
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Test Results Should Show:</h3>
                <ul>
                    <li>✅ Page loads without log.ts errors</li>
                    <li>✅ Database connection test works</li>
                    <li>✅ No dependency chain issues</li>
                </ul>
            </div>
        </div>
    )
}
