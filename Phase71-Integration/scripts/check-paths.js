// Update Phase 71 imports to use relative paths
// Since Phase 70 is inside Phase 69 directory, adjust paths

const path = require('path');

// Check actual paths
console.log('🔍 Checking Phase 69 & 70 paths...\n');

const phase69Path = path.join(__dirname, '..', 'Phase69-Ranking');
const phase70Path = path.join(__dirname, '..', 'Phase69-Ranking', 'Phase70-Disclosure');

console.log('Phase 69 path:', phase69Path);
console.log('Exists:', require('fs').existsSync(phase69Path) ? '✅' : '❌');

console.log('\nPhase 70 path:', phase70Path);
console.log('Exists:', require('fs').existsSync(phase70Path) ? '✅' : '❌');

// Check key files
console.log('\n📁 Key file check:');
const filesToCheck = [
  { path: path.join(phase69Path, 'dist', 'rankingEngine.js'), name: 'Phase 69 Ranking Engine' },
  { path: path.join(phase69Path, 'dist', 'index.js'), name: 'Phase 69 API' },
  { path: path.join(phase70Path, 'src', 'index.tsx'), name: 'Phase 70 Main Export' },
  { path: path.join(phase70Path, 'src', 'policies', 'ExplanationVisibilityPolicy.ts'), name: 'Phase 70 Visibility Policy' }
];

filesToCheck.forEach(file => {
  const exists = require('fs').existsSync(file.path);
  console.log(`${exists ? '✅' : '❌'} ${file.name}: ${exists ? 'Found' : 'Missing'}`);
});
