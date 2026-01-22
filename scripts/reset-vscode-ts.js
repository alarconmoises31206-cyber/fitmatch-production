// scripts/reset-vscode-ts.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Resetting VS Code TypeScript State');

// Find VS Code storage directories
const homedir = require('os').homedir();
const vscodeDirs = [
    path.join(homedir, '.vscode', 'extensions'),
    path.join(homedir, 'AppData', 'Roaming', 'Code', 'CachedData'),
    path.join(homedir, 'AppData', 'Roaming', 'Code', 'User', 'workspaceStorage')
];

console.log('\n💡 Manual steps to fix VS Code TypeScript:');
console.log('1. Close VS Code completely');
console.log('2. Delete these folders if they exist:');
vscodeDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`   - ${dir}`);
    }
});
console.log('\n3. Reopen VS Code');
console.log('4. Press Ctrl+Shift+P and run: "Developer: Reload Window"');
console.log('5. Press Ctrl+Shift+P and run: "TypeScript: Restart TS server"');
console.log('\n6. Check TypeScript version in bottom-right status bar');
console.log('   - It should say "TypeScript 5.9.3"');
console.log('   - Click it and select "Use Workspace Version"');

// Also check for tsserver logs
console.log('\n📋 To check tsserver logs:');
console.log('1. In VS Code: Ctrl+Shift+P → "Developer: Open Logs Folder"');
console.log('2. Look for "tsserver.log"');
