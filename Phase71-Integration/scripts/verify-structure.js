// Correct path check
const path = require('path');
const fs = require('fs');

console.log('📍 Current directory:', __dirname);
console.log('');

// Go up one level from Phase71-Integration to find Phase69-Ranking
const projectRoot = path.join(__dirname, '..');
const phase69Path = path.join(projectRoot, 'Phase69-Ranking');
const phase70Path = path.join(phase69Path, 'Phase70-Disclosure');
const phase71Path = __dirname;

console.log('Project root:', projectRoot);
console.log('Phase 69:', phase69Path);
console.log('Phase 70:', phase70Path);
console.log('Phase 71:', phase71Path);
console.log('');

// Verify all phases exist
console.log('📦 Phase Existence Check:');
console.log(`Phase 69: ${fs.existsSync(phase69Path) ? '✅ Found' : '❌ Missing'}`);
console.log(`Phase 70: ${fs.existsSync(phase70Path) ? '✅ Found' : '❌ Missing'}`);
console.log(`Phase 71: ${fs.existsSync(phase71Path) ? '✅ Found' : '❌ Missing'}`);
console.log('');

// Check critical files
console.log('🔍 Critical File Check:');
const criticalFiles = [
  { 
    path: path.join(phase69Path, 'dist', 'rankingEngine.js'), 
    name: 'Phase 69 Ranking Engine (compiled)',
    required: true
  },
  { 
    path: path.join(phase69Path, 'src', 'rankingEngine.ts'), 
    name: 'Phase 69 Ranking Engine (source)',
    required: true
  },
  { 
    path: path.join(phase70Path, 'src', 'index.tsx'), 
    name: 'Phase 70 Main Export',
    required: true 
  },
  { 
    path: path.join(phase71Path, 'src', 'phase71_integration.ts'), 
    name: 'Phase 71 Integration',
    required: true
  }
];

let allCriticalFilesExist = true;
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file.path);
  console.log(`${exists ? '✅' : '❌'} ${file.name}`);
  if (file.required && !exists) allCriticalFilesExist = false;
});

console.log('');
console.log('🎯 Status:', allCriticalFilesExist ? '✅ All phases ready for integration' : '❌ Missing critical files');
