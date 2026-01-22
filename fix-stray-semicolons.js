// fix-stray-semicolons.js
const fs = require('fs');
const path = require('path');

function fixStraySemicolons(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;
        
        // Fix common patterns with stray semicolons
        // 1. After JSX props: onSelectConversation,;
        content = content.replace(/,\s*;/g, ',');
        // 2. After default values: isLoading = false;
        content = content.replace(/:\s*;/g, ':');
        // 3. After function calls: return (;
        content = content.replace(/\)\s*;/g, ')');
        content = content.replace(/\(\s*;/g, '(');
        // 4. After braces
        content = content.replace(/\}\s*;/g, '}');
        content = content.replace(/\{\s*;/g, '{');
        // 5. In JSX return statements
        content = content.replace(/return\s*\(\s*;/g, 'return (');
        
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed: ${filePath}`);
            return true;
        }
    } catch (error) {
        console.error(`Error fixing ${filePath}: ${error.message}`);
    }
    return false;
}

// Process all .ts and .tsx files
const files = [];
function walk(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory() && !item.includes('node_modules') && !item.startsWith('.') && item !== '.next') {
            walk(itemPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            files.push(itemPath);
        }
    });
}

walk('.');
console.log(`Found ${files.length} TypeScript files`);

let fixedCount = 0;
files.forEach(file => {
    if (fixStraySemicolons(file)) {
        fixedCount++;
    }
});

console.log(`Fixed ${fixedCount} files with stray semicolons`);
