import React from 'react';
﻿// pages/test-mvp.tsx
export default function TestMVP() {
    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <h1>FitMatch MVP Test Page</h1>
            <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h2>Core MVP Features Test</h2>
                <ul>
                    <li>✓ Next.js is running</li>
                    <li>✓ Pages can be rendered</li>
                    <li>✓ TypeScript compilation (with errors) but app runs</li>
                </ul>
                <div style={{ marginTop: '2rem' }}>
                    <h3>Test Links:</h3>
                    <a href="/signup" style={{ marginRight: '1rem' }}>Test Signup</a>
                    <a href="/trainer" style={{ marginRight: '1rem' }}>Test Trainer</a>
                    <a href="/messages">Test Messages</a>
                </div>
            </div>
        </div>
    )
}
