// scripts/vscode-ts-diagnostic.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 VS Code TypeScript Diagnostic');

// Check 1: Project TypeScript version
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const tsVersion = packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript;
    console.log(`📦 Project TypeScript version: ${tsVersion || 'Not found in package.json'}`);
} catch (err) {
    console.log('❌ Error reading package.json:', err.message);
}

// Check 2: VS Code TypeScript version
try {
    const vscodePath = path.join('node_modules', '.vscode-test', 'vscode', '**', 'node_modules', 'typescript');
    const glob = require('glob');
    const matches = glob.sync(vscodePath);
    if (matches.length > 0) {
        console.log('🖥️ VS Code might be using bundled TypeScript');
    }
} catch (err) {
    // Ignore, glob might not be available
}

// Check 3: Run TypeScript with different strictness levels
console.log('\n🧪 Testing TypeScript strictness levels:');

const tests = [
    { name: 'Default (tsconfig.json)', cmd: 'npx tsc --noEmit' },
    { name: 'Very strict (like VS Code)', cmd: 'npx tsc --noEmit --strict --noImplicitAny --noUnusedLocals --noUnusedParameters --exactOptionalPropertyTypes' },
    { name: 'Lenient', cmd: 'npx tsc --noEmit --skipLibCheck --noImplicitAny false' }
];

tests.forEach(test => {
    try {
        execSync(test.cmd, { stdio: 'pipe', encoding: 'utf8' });
        console.log(`✅ ${test.name}: 0 errors`);
    } catch (error) {
        const output = error.stdout + error.stderr;
        const errorCount = (output.match(/error TS\d+:/g) || []).length;
        console.log(`❌ ${test.name}: ${errorCount} errors`);
        
        if (errorCount > 0 && test.name === 'Very strict (like VS Code)') {
            console.log('   This explains why VS Code shows errors!');
            const sampleErrors = output.split('\n')
                .filter(line => line.includes('error TS'))
                .slice(0, 3);
            sampleErrors.forEach(err => console.log(`   ${err.trim()}`));
        }
    }
});

console.log('\n💡 Solution:');
console.log('1. In VS Code, click TypeScript version in bottom-right');
console.log('2. Select "Use Workspace Version"');
console.log('3. Or create .vscode/settings.json with:');
console.log('   { "typescript.tsdk": "node_modules/typescript/lib" }');
