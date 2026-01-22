// scripts/find-error-sources.js
const fs = require('fs');
const path = require('path');

console.log('🔎 Finding sources of VS Code errors');

// Common patterns that cause many errors
const patterns = {
    'checkJs issues': /\.jsx?$/,
    'node_modules': /node_modules/,
    'test files': /\.(test|spec)\.(js|ts|jsx|tsx)$/,
    'config files': /\.config\.(js|ts)$/,
    'next.js files': /next\.config\.js|next-env\.d\.ts/
};

// Check project structure
const rootDir = __dirname;
const errorSources = {};

function scanDirectory(dir, depth = 0) {
    if (depth > 5) return; // Limit depth
    
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(rootDir, fullPath);
            
            if (entry.isDirectory()) {
                // Skip certain directories
                if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
                    scanDirectory(fullPath, depth + 1);
                } else if (entry.name === 'node_modules') {
                    console.log(`⚠️  node_modules found at: ${relativePath}`);
                    console.log('   This could be source of many errors if VS Code is scanning it');
                }
            } else {
                // Check file patterns
                for (const [patternName, pattern] of Object.entries(patterns)) {
                    if (pattern.test(relativePath)) {
                        errorSources[patternName] = (errorSources[patternName] || 0) + 1;
                    }
                }
            }
        }
    } catch (err) {
        // Skip directories we can't read
    }
}

scanDirectory(rootDir);

console.log('\n📊 Potential error sources:');
Object.entries(errorSources).forEach(([source, count]) => {
    console.log(`   ${source}: ${count} files`);
});

console.log('\n💡 Quick fixes:');
console.log('1. Add this to .vscode/settings.json:');
console.log('   "javascript.validate.enable": false');
console.log('');
console.log('2. Add this to tsconfig.json:');
console.log('   "exclude": ["node_modules", "**/*.js", "**/*.jsx"]');
console.log('');
console.log('3. If using Next.js, ensure you have next-env.d.ts');
console.log('');
console.log('4. Restart VS Code TS server:');
console.log('   Ctrl+Shift+P → "TypeScript: Restart TS server"');
