// fix-all-syntax-errors.js
const fs = require('fs');
const path = require('path');

function fixSyntaxErrors(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;
        let changes = 0;
        
        // Fix patterns found in errors:
        // 1. trainer: {, -> trainer: {
        content = content.replace(/(\w+):\s*{,\s*/g, '$1: {');
        
        // 2. }, [router]) -> }, [router]);
        content = content.replace(/},\s*\[router\]\)\s*$/gm, '}, [router]);');
        
        // 3. return (, -> return (
        content = content.replace(/return\s*\(\s*,/g, 'return (');
        
        // 4. Remove stray commas at end of lines in interfaces
        content = content.replace(/(\w+:\s*\w+(?:\[\])?);,/g, '$1;');
        
        // 5. Fix import paths with double quotes
        content = content.replace(/from\s+['"]([^'"]+)['"]['"]/g, "from '$1'");
        
        // 6. Fix empty imports
        content = content.replace(/import\s+\w+\s+from\s+'';/g, '');
        
        // 7. Fix missing semicolons after router.push
        content = content.replace(/router\.push\([^)]+\)\s*\n/g, (match) => {
            if (!match.includes(';')) {
                changes++;
                return match.trim() + ';\n';
            }
            return match;
        });
        
        // 8. Remove duplicate React imports
        const reactImports = (content.match(/import\s+(?:React|{.*})\s+from\s+['"]react['"]/g) || []);
        if (reactImports.length > 1) {
            // Keep the first one, remove others
            let firstFound = false;
            content = content.replace(/import\s+(?:React|{.*})\s+from\s+['"]react['"]/g, (match) => {
                if (!firstFound) {
                    firstFound = true;
                    return match;
                }
                changes++;
                return '';
            });
            // Clean up empty lines
            content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        }
        
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

console.log('Running comprehensive syntax fix...');

// Get all .tsx files
const files = [];
function walk(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory() && !item.includes('node_modules') && !item.startsWith('.') && item !== '.next') {
            walk(itemPath);
        } else if (item.endsWith('.tsx')) {
            files.push(itemPath);
        }
    });
}

walk('.');
console.log(`Found ${files.length} .tsx files`);

let fixedCount = 0;
files.forEach(file => {
    if (fixSyntaxErrors(file)) {
        fixedCount++;
    }
});

console.log(`\nFixed ${fixedCount} files with syntax errors`);
console.log('\nNote: Some files may need manual review.');
