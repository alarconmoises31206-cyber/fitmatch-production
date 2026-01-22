// scripts/fix-ts1005-targeted.js
const fs = require('fs');
const path = require('path');

console.log('🎯 Targeted TS1005 (comma) Error Fixer');

// Find all TypeScript files
const tsFiles = [];
function findTsFiles(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && 
            !item.name.startsWith('.') && 
            !item.name.startsWith('node_modules') &&
            item.name !== 'domain' && item.name !== 'app' && item.name !== 'infra') {
            findTsFiles(fullPath);
        } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
            tsFiles.push(fullPath);
        }
    }
}

findTsFiles(process.cwd());

console.log(`Found ${tsFiles.length} TypeScript files`);

let fixedCount = 0;
let fixedErrors = 0;

tsFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Pattern 1: Missing comma before closing parenthesis in function calls
    // Example: error('api.error', { details: 'message:', error);
    content = content.replace(
        /(error|log|warn|info)\((['"])(api\.error|api\.event|api\.warning|api\.info)\2\s*,\s*\{[^}]+(details|data|message)\s*:\s*['"][^'"]*['"]\s*:\s*([^)}]+)(?=\s*\)\s*;)/g,
        (match, fn, quote, event, key, errorVar) => {
            fixedErrors++;
            return `${fn}(${quote}${event}${quote}, { ${key}: '${match.split("'")[3] || match.split('"')[3]}:', ${errorVar.trim()} })`;
        }
    );
    
    // Pattern 2: Missing closing parenthesis and curly brace
    content = content.replace(
        /(error|log)\((['"])(api\.error|api\.event)\2\s*,\s*\{[^}]+(details|data)\s*:\s*['"]([^'"]+)['"]\s*([^)}]+)(?=\s*;)/g,
        (match, fn, quote, event, key, message, rest) => {
            fixedErrors++;
            return `${fn}(${quote}${event}${quote}, { ${key}: '${message}', ${rest.trim()} })`;
        }
    );
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        fixedCount++;
        console.log(`  Fixed: ${path.relative(process.cwd(), file)}`);
    }
});

console.log(`\n🎯 Fixed ${fixedCount} files (estimated ${fixedErrors} TS1005 errors)`);
console.log('Run: npx tsc --noEmit --project . to check remaining errors');
