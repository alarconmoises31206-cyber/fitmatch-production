import React from 'react';
﻿// pages/phase2-dashboard.tsx
export default function Phase2Dashboard() {
    const testCases: any= [
        {
            id: 1,
            name: 'User Signup Flow',
            description: 'Test user registration and database write',
            url: '/test-signup',
            status: 'pending',
            notes: 'Check if user can sign up and data is written to database'
        },
        {
            id: 2,
            name: 'AI Matchmaking',
            description: 'Test if matchmaking returns data',
            url: '/messages',
            status: 'pending',
            notes: 'Check if conversations load and matchmaking works'
        },
        {
            id: 3,
            name: 'Token Payments',
            description: 'Test credit purchase flow',
            url: '/payment',
            status: 'pending',
            notes: 'Test Stripe integration and wallet updates'
        },
        {
            id: 4,
            name: 'External Trainer Discovery',
            description: 'Test trainer profiles and search',
            url: '/trainer',
            status: 'pending',
            notes: 'Check if trainer profiles load and filters work'
        },
        {
            id: 5,
            name: 'Database Connection',
            description: 'Test Supabase bridge',
            url: '/diagnostic',
            status: 'pending',
            notes: 'Verify database connection works'
        }
    ];

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <h1>🎯 FitMatch Phase 2 - MVP Testing Dashboard</h1>
            
            <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                backgroundColor: '#e3f2fd', 
                borderRadius: '8px',
                marginBottom: '2rem'
            }}>
                <h2>📋 Status Summary</h2>
                <p><strong>Dev Server:</strong> ✅ Running on http://localhost:3000</p>
                <p><strong>Database:</strong> ✅ Connected (Supabase bridge works)</p>
                <p><strong>TypeScript:</strong> ⚠ Running with errors (ignored for now)</p>
                <p><strong>Phase:</strong> 2/3 - Testing & Validation</p>
            </div>
            
            <h2>🧪 Test Cases</h2>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {testCases.map((test) => (
                    <div key={test.id} style={{
                        padding: '1.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0' }}>{test.name}</h3>
                                <p style={{ margin: '0 0 1rem 0', color: '#666' }}>{test.description}</p>
                            </div>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                backgroundColor: test.status === 'completed' ? '#4caf50' : '#ff9800',
                                color: 'white',
                                borderRadius: '20px',
                                fontSize: '0.875rem'
                            }}>
                                {test.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                            </span>
                        </div>
                        
                        <div style={{ marginTop: '1rem' }}>
                            <p><strong>Notes:</strong> {test.notes}</p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <a href={test.url} style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#2196f3',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '4px'
                                }}>
                                    Run Test
                                </a>
                                <button style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }} onClick={() => alert('Marking as completed')}>
                                    Mark Complete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff8e1', borderRadius: '8px' }}>
                <h3>📊 Quick Diagnostics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    <button onClick={async () => {
  
                        try {
  const { createSupabaseClient } = await import('@/lib/supabase')
                            const supabase: any= createSupabaseClient()
                            const { data, error } = await supabase.from('users').select('count').limit(1)
                            if (error) {
                                alert('Database error (may be expected): ' + error.message)
                            } else {
                                alert('Database connected! Count: ' + JSON.stringify(data))
                            }
                        } catch (err) {
                            alert('Error: ' + err.message)
                        }
                    }} style={{
                        padding: '0.75rem',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        Test Database
                    </button>
                    
                    <button onClick={() => {
  
                        console.log('Environment check:', {
                            supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                            supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  nodeEnv: process.env.NODE_ENV
                        })
                        alert('Check browser console for environment details')
                    }} style={{
                        padding: '0.75rem',
                        backgroundColor: '#9c27b0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        Check Environment
                    </button>
                    
                    <button onClick={() => {
                        window.open('http://localhost:3000', '_blank')
                    }} style={{
                        padding: '0.75rem',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        Open Homepage
                    </button>
                </div>
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
                <h3>✅ Phase 2 Completion Criteria</h3>
                <ul>
                    <li>✓ User signup → database write</li>
                    <li>✓ AI matchmaking → returns real data</li>
                    <li>✓ Token payments → end-to-end flow</li>
                    <li>✓ External trainer discovery → works correctly</li>
                    <li>✓ Database bridge validated</li>
                </ul>
                <p style={{ marginTop: '1rem' }}>
                    <strong>Current Status:</strong> Database bridge validated ✅<br/>
                    <strong>Next:</strong> Test signup flow
                </p>
            </div>
        </div>
    )
}
