// master-fix.js - Fix all syntax errors once and for all
const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    try {
        // Read as binary first to avoid encoding issues
        const buffer = fs.readFileSync(filePath);
        let content = buffer.toString('utf8');
        const original = content;
        
        // FIX 1: return (; -> return (
        content = content.replace(/return\s*\(\s*;/g, 'return (');
        
        // FIX 2: return, -> return;
        content = content.replace(/return,(\s|$)/g, 'return;$1');
        
        // FIX 3: Remove stray semicolons in objects
        content = content.replace(/([{,]\s*[^:}]+?):\s*'([^']+)',;/g, "$1: '$2',");
        
        // FIX 4: Fix double semicolons
        content = content.replace(/;;/g, ';');
        
        // FIX 5: Ensure imports are correct
        content = content.replace(/from\s+['"]\.\.\/src\//g, "from '../");
        content = content.replace(/from\s+['"]@\/lib\/supabaseClient['"]/g, "from '../lib/supabase/client.js'");
        
        // FIX 6: Remove duplicate React imports
        const lines = content.split('\n');
        let foundReact = false;
        const newLines = [];
        
        for (let line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('import') && trimmed.includes('react') && trimmed.includes('from')) {
                if (!foundReact) {
                    foundReact = true;
                    newLines.push(line);
                }
                // Skip duplicates
            } else {
                newLines.push(line);
            }
        }
        
        content = newLines.join('\n');
        
        if (content !== original) {
            // Write with proper UTF-8 BOM for consistency
            const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
            const contentBuffer = Buffer.from(content, 'utf8');
            const finalBuffer = Buffer.concat([bom, contentBuffer]);
            fs.writeFileSync(filePath, finalBuffer);
            console.log(`Fixed: ${filePath}`);
            return true;
        }
    } catch (error) {
        console.error(`Error with ${filePath}:`, error.message);
    }
    return false;
}

console.log('=== MASTER FIX STARTING ===');

// Target all problematic files
const targetFiles = [
    'components/ProtectedRoute.tsx',
    'pages/dashboard/index.tsx',
    'pages/auth/login.tsx',
    'pages/admin/invites/index.tsx',
    'pages/admin/monitor/incidents.tsx',
    'pages/admin/monitor/index.tsx',
    'hooks/useEarningsPreview.tsx'
];

let fixedCount = 0;
targetFiles.forEach(file => {
    if (fs.existsSync(file)) {
        if (fixFile(file)) {
            fixedCount++;
        }
    } else {
        console.log(`Missing: ${file}`);
    }
});

console.log(`\n=== MASTER FIX COMPLETE ===`);
console.log(`Fixed ${fixedCount} files`);
console.log('\nNow run: npm run build');
console.log('If build succeeds, run: npm run dev');
