// fix-ts1005-errors.js
const fs = require('fs');
const path = require('path');

function fixCommonSyntaxErrors(content) {
    let fixed = content;
    
    // Fix: const x = { a: 1; b: 2 } should be const x = { a: 1, b: 2 }
    fixed = fixed.replace(/{([^}]*);([^}]*)}/g, '{$1,$2}');
    
    // Fix: function x() { return 1; } should not have ; after }
    fixed = fixed.replace(/}\s*;/g, '}');
    
    // Fix: Missing commas in function params: (a: string b: string)
    fixed = fixed.replace(/([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>\[\]]+)\s+([a-zA-Z0-9_]+)\s*:/g, '$1: $2, $3:');
    
    // Fix: Missing commas in object literals
    fixed = fixed.replace(/([a-zA-Z0-9_]+):\s*([^,\n}]+)\n\s*([a-zA-Z0-9_]+):/g, '$1: $2,\n  $3:');
    
    // Fix: Missing parentheses in arrow functions
    fixed = fixed.replace(/=>\s*{([^}]+)\n\s*([a-zA-Z])/g, '=> {\n  $1\n  $2');
    
    return fixed;
}

function fixTS1005Errors(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;
        
        content = fixCommonSyntaxErrors(content);
        
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed syntax in: ${filePath}`);
            return true;
        }
    } catch (error) {
        console.error(`Error fixing ${filePath}: ${error.message}`);
    }
    return false;
}

// Get files with TS1005 errors by checking TypeScript output
console.log('Note: This script fixes common TS1005 patterns.');
console.log('For best results, run TypeScript to identify problematic files.');
console.log('');
console.log('Looking for files that might have syntax issues...');

// Process all .ts and .tsx files in components and pages directories
const files = [];
function walk(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory() && !item.includes('node_modules') && !item.startsWith('.') && item !== '.next') {
            walk(itemPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            // Prioritize components and pages directories
            if (itemPath.includes('components') || itemPath.includes('pages') || itemPath.includes('hooks')) {
                files.push(itemPath);
            }
        }
    });
}

['components', 'pages', 'hooks'].forEach(dir => {
    if (fs.existsSync(dir)) {
        walk(dir);
    }
});

console.log(`Found ${files.length} files to check`);

let fixedCount = 0;
files.forEach(file => {
    if (fixTS1005Errors(file)) {
        fixedCount++;
    }
});

console.log(`Fixed ${fixedCount} files with potential syntax issues`);
