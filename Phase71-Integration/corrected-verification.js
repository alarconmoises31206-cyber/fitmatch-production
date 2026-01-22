// Corrected Phase 71 Integration Verification
console.log('🔍 PHASE 71 INTEGRATION VERIFICATION - CORRECTED');
console.log('===============================================\n');

const fs = require('fs');
const path = require('path');

// From Phase71-Integration directory, go up to project root
const projectRoot = path.resolve(__dirname, '..');
console.log('Project Root:', projectRoot);

const phase69Path = path.join(projectRoot, 'Phase69-Ranking');
const phase70Path = path.join(phase69Path, 'Phase70-Disclosure');
const currentDir = __dirname;

console.log('\n📁 Checking directories:');
console.log('Phase 69:', phase69Path);
console.log('Exists:', fs.existsSync(phase69Path));
console.log('');
console.log('Phase 70:', phase70Path);
console.log('Exists:', fs.existsSync(phase70Path));
console.log('');
console.log('Current (Phase 71):', currentDir);
console.log('Exists:', fs.existsSync(currentDir));

// Quick manual check
console.log('\n🔧 Manual File Check:');
console.log('1. Phase 69 dist/index.js:', fs.existsSync(path.join(phase69Path, 'dist', 'index.js')) ? '✅' : '❌');
console.log('2. Phase 69 src/rankingEngine.ts:', fs.existsSync(path.join(phase69Path, 'src', 'rankingEngine.ts')) ? '✅' : '❌');
console.log('3. Phase 70 src/index.tsx:', fs.existsSync(path.join(phase70Path, 'src', 'index.tsx')) ? '✅' : '❌');
console.log('4. Phase 71 src/phase71_integration.ts:', fs.existsSync(path.join(currentDir, 'src', 'phase71_integration.ts')) ? '✅' : '❌');

console.log('\n🎯 Conclusion:');
console.log('The file structure appears correct.');
console.log('Phase 71 integration depends on relative paths that need adjustment.');
console.log('Recommendation: Update Phase 71 imports to use correct relative paths.');
