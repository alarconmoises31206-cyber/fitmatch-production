// scripts/analyze-vscode-errors.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Analyzing TypeScript Error Patterns');

// Run TypeScript with stricter checking (like VS Code)
try {
    const output = execSync('npx tsc --noEmit --strict --noImplicitAny --noUnusedLocals --noUnusedParameters', {
        encoding: 'utf8',
        stdio: 'pipe'
    });
    console.log('✅ No strict errors');
} catch (error) {
    const errorOutput = error.stdout + error.stderr;
    const errors = errorOutput.match(/error TS\d+:/g) || [];
    
    console.log(`Found ${errors.length} strict TypeScript errors`);
    
    // Categorize errors
    const categories = {
        'TS7005': 'Variable implicitly has an any type',
        'TS6133': 'Unused variable or parameter', 
        'TS7030': 'Not all code paths return a value',
        'TS2532': 'Object is possibly undefined',
        'TS2345': 'Argument type mismatch',
        'other': 'Other errors'
    };
    
    let errorCounts = {};
    Object.keys(categories).forEach(key => errorCounts[key] = 0);
    
    errors.forEach(err => {
        const match = err.match(/TS(\d+)/);
        if (match) {
            const code = 'TS' + match[1];
            if (errorCounts[code] !== undefined) {
                errorCounts[code]++;
            } else {
                errorCounts.other++;
            }
        }
    });
    
    console.log('\nError Categories:');
    Object.entries(categories).forEach(([code, desc]) => {
        if (errorCounts[code] > 0) {
            console.log(`  ${code}: ${errorCounts[code]} - ${desc}`);
        }
    });
    
    // Show sample errors
    console.log('\nSample Errors:');
    const lines = errorOutput.split('\n').filter(line => line.includes('error TS'));
    lines.slice(0, 5).forEach(line => {
        console.log(`  ${line.trim()}`);
    });
}
