// scripts/analyze-real-errors.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Analyzing real TypeScript errors (excluding backups)...');

// First, get a list of all non-backup TypeScript files
const sourceFiles = [];

function collectSourceFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(process.cwd(), fullPath);
        
        if (entry.isDirectory()) {
            // Skip excluded directories
            if (!['node_modules', '.next', '.git', 'dist', 'build', '.vscode'].includes(entry.name)) {
                collectSourceFiles(fullPath);
            }
        } else {
            // Skip backup files and only include .ts/.tsx files
            const isBackup = /backup|phase|\.backup/i.test(entry.name);
            const isSourceFile = /\.(ts|tsx)$/i.test(entry.name);
            
            if (!isBackup && isSourceFile) {
                sourceFiles.push(relativePath);
            }
        }
    }
}

collectSourceFiles(process.cwd());
console.log(`Found ${sourceFiles.length} TypeScript source files`);

// Check errors in each file
console.log('\n📊 Checking each file for errors:');

let totalErrors = 0;
const filesWithErrors = [];

for (const file of sourceFiles.slice(0, 20)) { // Check first 20 files
    try {
        const output = execSync(`npx tsc "${file}" --noEmit --strict 2>&1`, {
            encoding: 'utf8',
            stdio: 'pipe'
        });
        
        const lines = output.split('\n');
        const errors = lines.filter(line => line.includes('error TS'));
        
        if (errors.length > 0) {
            console.log(`\n❌ ${file}: ${errors.length} errors`);
            
            // Show top 3 errors
            errors.slice(0, 3).forEach(err => {
                const cleanErr = err.replace(process.cwd() + path.sep, '');
                console.log(`   ${cleanErr}`);
            });
            
            totalErrors += errors.length;
            filesWithErrors.push({ file, count: errors.length });
            
            if (errors.length > 10) {
                console.log(`   ... and ${errors.length - 3} more errors`);
            }
        }
    } catch (error) {
        // Command failed (has errors)
        const output = error.stdout + error.stderr;
        const lines = output.split('\n');
        const errors = lines.filter(line => line.includes('error TS'));
        
        if (errors.length > 0) {
            console.log(`\n❌ ${file}: ${errors.length} errors`);
            
            errors.slice(0, 3).forEach(err => {
                const cleanErr = err.replace(process.cwd() + path.sep, '');
                console.log(`   ${cleanErr}`);
            });
            
            totalErrors += errors.length;
            filesWithErrors.push({ file, count: errors.length });
        }
    }
}

console.log(`\n📈 Summary: ${totalErrors} total errors in ${filesWithErrors.length} files`);

if (filesWithErrors.length > 0) {
    console.log('\n🎯 Top files with errors:');
    filesWithErrors
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .forEach(({ file, count }) => {
            console.log(`   ${file}: ${count} errors`);
        });
    
    console.log('\n💡 Common fixes needed:');
    console.log('1. Missing imports (install @types packages)');
    console.log('2. Type annotations needed');
    console.log('3. Update outdated syntax');
    console.log('4. Fix module resolutions');
}
