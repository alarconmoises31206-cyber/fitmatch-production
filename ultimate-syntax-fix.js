// ultimate-syntax-fix.js
const fs = require('fs');
const path = require('path');

function ultimateFix(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const original = content;
        
        // ALL the patterns we've seen:
        // 1. return statements with commas
        content = content.replace(/return([^;]),/g, 'return$1;');
        
        // 2. Stray commas in objects and arrays
        content = content.replace(/([{,]\s*[^:]+):\s*{,/g, '$1: {');
        content = content.replace(/,\s*}/g, '}');
        content = content.replace(/,\s*]/g, ']');
        
        // 3. Missing semicolons
        content = content.replace(/return\s+[^;\n]+(\n|$)/g, (match) => {
            if (!match.includes(';')) {
                return match.trim() + ';\n';
            }
            return match;
        });
        
        // 4. Duplicate React imports
        const lines = content.split('\n');
        let hasReactImport = false;
        const cleanedLines = [];
        
        for (let line of lines) {
            if (line.includes("import") && line.includes("react") && line.includes("from")) {
                if (!hasReactImport) {
                    hasReactImport = true;
                    cleanedLines.push(line);
                }
                // Skip duplicate
            } else {
                cleanedLines.push(line);
            }
        }
        
        content = cleanedLines.join('\n');
        
        // 5. Fix import paths with src/
        content = content.replace(/from\s+['"](\.\.\/)*src\//g, (match) => {
            return match.replace('/src/', '/');
        });
        
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed: ${filePath}`);
            return true;
        }
    } catch (error) {
        console.error(`Error with ${filePath}:`, error.message);
    }
    return false;
}

console.log('Running ultimate syntax fix on problematic files...');

// Target the files we know have issues
const targetFiles = [
    'pages/matches.tsx',
    'pages/dashboard/index.tsx',
    'pages/auth/login.tsx',
    'components/ProtectedRoute.tsx',
    'pages/admin/invites/index.tsx',
    'pages/admin/monitor/incidents.tsx',
    'pages/admin/monitor/index.tsx'
];

let fixedCount = 0;
targetFiles.forEach(file => {
    if (fs.existsSync(file)) {
        if (ultimateFix(file)) {
            fixedCount++;
        }
    } else {
        console.log(`Missing: ${file}`);
    }
});

console.log(`\nFixed ${fixedCount} files`);
console.log('\nTrying a test build...');
