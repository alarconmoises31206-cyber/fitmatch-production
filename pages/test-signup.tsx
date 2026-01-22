import React from 'react';
﻿// pages/test-signup.tsx
;

export default function TestSignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleTestSignup: any= async () => {
  
        setLoading(true)
        setError(null)
        setResult(null)
        
        try {
  const { createSupabaseClient } = await import('@/lib/supabase')
            const supabase: any= createSupabaseClient()
            
            // Test 1: Try to sign up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            })
            
            if (authError) {
                setError('Auth Error: ' + authError.message)
                setResult({ authError: authError.message })
                return;
            }
            
            setResult({ 
                success: true, 
                user: authData.user,
                message: 'Signup attempt completed. Check Supabase Auth for user.' 
            })
            
            // Test 2: Try to insert into users table (if it exists)
            if (authData.user) {
                try {
                    const { error: dbError } = await supabase
                        .from('users')
                        .insert([{
                            id: authData.user.id,
                            email: authData.user.email,
                            created_at: new Date().toISOString()
                        }])
                    
                    if (dbError) {
                        setResult(prev => ({ 
                            ...prev, 
                            dbWarning: 'Could not insert into users table: ' + dbError.message 
                        }))
                    } else {
                        setResult(prev => ({ 
                            ...prev, 
                            dbSuccess: 'User inserted into database successfully!' 
                        }))
                    }
                } catch (dbErr) {
                    setResult(prev => ({ 
                        ...prev, 
                        dbWarning: 'Database error: ' + dbErr.message 
                    }))
                }
            }
            
        } catch (err: any) {
            setError('Unexpected error: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Phase 2: Signup Flow Test</h1>
            
            <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h2>Test User Signup</h2>
                
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Email:
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                            placeholder="test@example.com"
                        />
                    </label>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Password:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '0.5rem', 
                                marginTop: '0.25rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                            placeholder="password123"
                        />
                    </label>
                </div>
                
                <button
                    onClick={handleTestSignup}
                    disabled={loading || !email || !password}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: loading ? '#ccc' : '#0070f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Testing...' : 'Test Signup'}
                </button>
                
                {error && (
                    <div style={{ 
                        marginTop: '1rem', 
                        padding: '1rem', 
                        backgroundColor: '#ffebee', 
                        color: '#c62828',
                        borderRadius: '4px'
                    }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}
                
                {result && (
                    <div style={{ 
                        marginTop: '1rem', 
                        padding: '1rem', 
                        backgroundColor: '#e8f5e9', 
                        color: '#2e7d32',
                        borderRadius: '4px'
                    }}>
                        <h3>Result:</h3>
                        <pre style={{ 
                            whiteSpace: 'pre-wrap', 
                            wordBreak: 'break-word',
                            backgroundColor: 'white',
                            padding: '1rem',
                            borderRadius: '4px',
                            overflow: 'auto'
                        }}>
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
            
            <div style={{ marginTop: '2rem' }}>
                <h3>Next Steps:</h3>
                <ol>
                    <li>Enter test email and password</li>
                    <li>Click "Test Signup"</li>
                    <li>Check result above</li>
                    <li>Check Supabase Auth dashboard for new user</li>
                </ol>
                
                <p style={{ marginTop: '1rem' }}>
                    <strong>Note:</strong> This tests the signup flow from browser → Supabase Auth → Database.
                    The "users" table might not exist yet - that's okay for Phase 2 testing.
                </p>
            </div>
        </div>
    )
}
