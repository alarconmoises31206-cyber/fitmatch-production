// scripts/hard-reset-vscode.js
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('🔄 HARD RESET VS Code TypeScript Server');

const homedir = os.homedir();
const vscodePaths = [
    // Windows
    path.join(homedir, 'AppData', 'Roaming', 'Code', 'CachedData'),
    path.join(homedir, 'AppData', 'Roaming', 'Code', 'User', 'workspaceStorage'),
    path.join(homedir, 'AppData', 'Roaming', 'Code', 'Cache'),
    
    // Mac
    path.join(homedir, 'Library', 'Application Support', 'Code', 'CachedData'),
    path.join(homedir, 'Library', 'Application Support', 'Code', 'User', 'workspaceStorage'),
    path.join(homedir, 'Library', 'Application Support', 'Code', 'Cache'),
    
    // Linux
    path.join(homedir, '.config', 'Code', 'CachedData'),
    path.join(homedir, '.config', 'Code', 'User', 'workspaceStorage'),
    path.join(homedir, '.config', 'Code', 'Cache')
];

console.log('\n🗑️  Deleting VS Code cache directories...');
vscodePaths.forEach(dir => {
    if (fs.existsSync(dir)) {
        try {
            console.log(`Deleting: ${dir}`);
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`✅ Deleted`);
        } catch (err) {
            console.log(`❌ Could not delete ${dir}: ${err.message}`);
        }
    }
});

// Also delete tsserver log files
const tsserverLog = path.join(__dirname, 'tsserver.log');
if (fs.existsSync(tsserverLog)) {
    fs.unlinkSync(tsserverLog);
    console.log('Deleted tsserver.log');
}

console.log('\n🎯 MANUAL STEPS REQUIRED:');
console.log('1. CLOSE VS CODE COMPLETELY (all windows)');
console.log('2. Open Task Manager (Ctrl+Shift+Esc)');
console.log('3. End any "Code" or "Electron" processes');
console.log('4. Wait 10 seconds');
console.log('5. Reopen your project');
console.log('');
console.log('6. After VS Code opens:');
console.log('   - Press Ctrl+Shift+P');
console.log('   - Type: "Developer: Reload Window"');
console.log('   - Press Enter');
console.log('');
console.log('7. Then:');
console.log('   - Press Ctrl+Shift+P');
console.log('   - Type: "TypeScript: Restart TS server"');
console.log('   - Press Enter');
console.log('');
console.log('8. Check TypeScript version in bottom-right:');
console.log('   - Should say "TypeScript 5.9.3"');
console.log('   - Click it → Select "Use Workspace Version"');
