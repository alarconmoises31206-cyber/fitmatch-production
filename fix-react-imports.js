// fix-react-imports.js
const fs = require('fs');
const path = require('path');

function addReactImport(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if file has JSX but no React import
        const hasJSX = /<[^>]+>/.test(content);
        const hasReactImport = /import\s+React\s+from\s+['"]react['"]/.test(content);
        const hasDefaultReact = /import\s+\{\s*React\s*\}\s+from\s+['"]react['"]/.test(content);
        
        if (hasJSX && !hasReactImport && !hasDefaultReact) {
            // Add React import at the top
            const lines = content.split('\n');
            let importIndex = 0;
            
            // Find where to insert (after any existing imports)
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('import ')) {
                    importIndex = i + 1;
                } else if (lines[i].trim() !== '') {
                    break;
                }
            }
            
            lines.splice(importIndex, 0, "import React from 'react';");
            const newContent = lines.join('\n');
            
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Added React import to: ${filePath}`);
            return true;
        }
    } catch (error) {
        console.error(`Error processing ${filePath}: ${error.message}`);
    }
    return false;
}

// Find all .tsx files
const tsxFiles = [];
function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.') && file !== '.next') {
            walk(filePath);
        } else if (file.endsWith('.tsx')) {
            tsxFiles.push(filePath);
        }
    });
}

walk('.');
console.log(`Found ${tsxFiles.length} .tsx files`);

let fixedCount = 0;
tsxFiles.forEach(file => {
    if (addReactImport(file)) {
        fixedCount++;
    }
});

console.log(`Fixed ${fixedCount} files with missing React imports`);
