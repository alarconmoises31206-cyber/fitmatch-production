const fs = require('fs');
const path = require('path');

function fixReturnStatements(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const original = content;
        
        // Fix: return, -> return;
        content = content.replace(/return,\s*/g, 'return;');
        
        // Also fix: return null, -> return null;
        content = content.replace(/return null,\s*/g, 'return null;');
        
        // Fix: return true, -> return true;
        content = content.replace(/return true,\s*/g, 'return true;');
        
        // Fix: return false, -> return false;
        content = content.replace(/return false,\s*/g, 'return false;');
        
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(\`Fixed return statements in: \${filePath}\`);
            return true;
        }
    } catch (error) {
        console.error(\`Error: \${filePath}\`, error.message);
    }
    return false;
}

// Process all TypeScript/JS files
const files = [];
function collectFiles(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory() && !item.includes('node_modules') && !item.startsWith('.') && item !== '.next') {
            collectFiles(itemPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js')) {
            files.push(itemPath);
        }
    });
}

collectFiles('.');
console.log(\`Checking \${files.length} files for return, errors...\`);

let fixedCount = 0;
files.forEach(file => {
    if (fixReturnStatements(file)) {
        fixedCount++;
    }
});

console.log(\`\\nFixed \${fixedCount} files with return, errors\`);
