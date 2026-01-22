// fix-critical-errors.js
const fs = require('fs');
const path = require('path');

function fixCriticalErrors(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;
        
        // Fix 1: return null, -> return null
        content = content.replace(/return null,/g, 'return null;');
        content = content.replace(/return ,/g, 'return;');
        
        // Fix 2: Remove stray commas in interfaces
        content = content.replace(/(interface\s+\w+\s*\{[\s\S]*?\})/g, (match) => {
            return match.replace(/,\s*;/g, ';');
        });
        
        // Fix 3: Fix missing semicolons after statements
        content = content.replace(/return\s+[^;\n]+\n/g, (match) => {
            if (!match.trim().endsWith(';')) {
                return match.trim() + ';\n';
            }
            return match;
        });
        
        // Fix 4: Fix router.push without semicolon
        content = content.replace(/router\.push\([^)]+\)\s*\n/g, (match) => {
            if (!match.includes(';')) {
                return match.trim() + ';\n';
            }
            return match;
        });
        
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed critical errors in: ${filePath}`);
            return true;
        }
    } catch (error) {
        console.error(`Error fixing ${filePath}: ${error.message}`);
    }
    return false;
}

console.log('Fixing critical build-breaking errors...');

// Target files mentioned in build errors
const criticalFiles = [
    'components/ProtectedRoute.tsx',
    'pages/admin/invites/index.tsx',
    'pages/admin/monitor/incidents.tsx',
    'pages/admin/monitor/index.tsx'
];

let fixedCount = 0;
criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        if (fixCriticalErrors(file)) {
            fixedCount++;
        }
    } else {
        console.log(`Warning: ${file} not found`);
    }
});

console.log(`\nFixed ${fixedCount} critical files`);
console.log('\nNow also checking for missing supabaseClient import...');

// Check for missing supabaseClient
if (fs.existsSync('pages/index.tsx')) {
    let indexContent = fs.readFileSync('pages/index.tsx', 'utf8');
    if (indexContent.includes("'../../src/lib/supabaseClient'")) {
        indexContent = indexContent.replace(
            /from\s+'\.\.\/\.\.\/src\/lib\/supabaseClient'/g,
            "from '../../lib/supabase/client'"
        );
        fs.writeFileSync('pages/index.tsx', indexContent, 'utf8');
        console.log('Fixed supabaseClient import in pages/index.tsx');
    }
}

console.log('\nDone! Try building again.');
