// scripts/compare-vscode-ts.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Comparing VS Code vs Command Line');

// Read tsconfig
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

console.log('\n1. tsconfig.json includes:');
if (tsconfig.include) {
    tsconfig.include.forEach(pattern => console.log(`   - ${pattern}`));
} else {
    console.log('   No include patterns (defaults to all .ts files)');
}

console.log('\n2. tsconfig.json excludes:');
if (tsconfig.exclude) {
    tsconfig.exclude.forEach(pattern => console.log(`   - ${pattern}`));
} else {
    console.log('   No exclude patterns');
}

console.log('\n3. Checking actual files in project:');

// Count TypeScript/JavaScript files
const extensions = ['.ts', '.tsx', '.js', '.jsx'];
let totalFiles = 0;
let typeScriptFiles = 0;
let javaScriptFiles = 0;

function countFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            // Skip node_modules and other build directories
            if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
                countFiles(fullPath);
            }
        } else {
            totalFiles++;
            const ext = path.extname(entry.name).toLowerCase();
            if (ext === '.ts' || ext === '.tsx') {
                typeScriptFiles++;
            } else if (ext === '.js' || ext === '.jsx') {
                javaScriptFiles++;
            }
        }
    }
}

try {
    countFiles(__dirname);
    console.log(`   Total files scanned: ${totalFiles}`);
    console.log(`   TypeScript files: ${typeScriptFiles}`);
    console.log(`   JavaScript files: ${javaScriptFiles}`);
} catch (err) {
    console.log(`   Error counting files: ${err.message}`);
}

console.log('\n4. Testing TypeScript compilation with different scopes:');

const tests = [
    { name: 'Only TypeScript files', cmd: 'npx tsc --noEmit --allowJs false' },
    { name: 'TypeScript + JavaScript', cmd: 'npx tsc --noEmit --allowJs true' },
    { name: 'Skip lib check', cmd: 'npx tsc --noEmit --skipLibCheck' },
    { name: 'No strict mode', cmd: 'npx tsc --noEmit --strict false' }
];

tests.forEach(test => {
    try {
        execSync(test.cmd, { stdio: 'pipe', encoding: 'utf8' });
        console.log(`   ✅ ${test.name}: 0 errors`);
    } catch (error) {
        const output = error.stdout + error.stderr;
        const errors = (output.match(/error TS\d+:/g) || []).length;
        console.log(`   ❌ ${test.name}: ${errors} errors`);
        
        if (errors > 0 && errors < 5) {
            const sample = output.split('\n').filter(l => l.includes('error TS')).slice(0, 2);
            sample.forEach(err => console.log(`      ${err.trim()}`));
        }
    }
});

console.log('\n💡 VS Code might be:');
console.log('   - Analyzing JavaScript files with checkJs enabled');
console.log('   - Using different compiler settings');
console.log('   - Checking node_modules dependencies');
console.log('\n🔧 Check VS Code settings:');
console.log('   - Look for "javascript.validate.enable"');
console.log('   - Look for "typescript.validate.enable"');
console.log('   - Check if checkJs is enabled');
