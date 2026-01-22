// Phase 71 Full Integration Verification
// Now with correct paths to Phase 69 and Phase 70

const path = require('path');
const fs = require('fs');

console.log('🚀 PHASE 71 - FULL INTEGRATION VERIFICATION');
console.log('===========================================\n');

// Correct paths
const projectRoot = path.join(__dirname, '..');
const phase69Path = path.join(projectRoot, 'Phase69-Ranking');
const phase70Path = path.join(projectRoot, 'Phase69-Ranking', 'Phase70-Disclosure');
const phase71Path = __dirname;

console.log('📍 Directory Structure:');
console.log(`Project Root: ${projectRoot}`);
console.log(`Phase 69:     ${phase69Path} ${fs.existsSync(phase69Path) ? '✅' : '❌'}`);
console.log(`Phase 70:     ${phase70Path} ${fs.existsSync(phase70Path) ? '✅' : '❌'}`);
console.log(`Phase 71:     ${phase71Path} ✅\n`);

// Phase 69 Verification
console.log('🧪 PHASE 69 VERIFICATION:');
const phase69Files = [
  { path: path.join(phase69Path, 'dist', 'index.js'), desc: 'API Server' },
  { path: path.join(phase69Path, 'dist', 'rankingEngine.js'), desc: 'Ranking Engine' },
  { path: path.join(phase69Path, 'src', 'rankingEngine.ts'), desc: 'Source Code' },
  { path: path.join(phase69Path, 'tests', 'rankingEngine.test.ts'), desc: 'Test Suite' }
];

let phase69Ready = true;
phase69Files.forEach(file => {
  const exists = fs.existsSync(file.path);
  console.log(`  ${exists ? '✅' : '❌'} ${file.desc}`);
  if (!exists) phase69Ready = false;
});

// Phase 70 Verification
console.log('\n🧪 PHASE 70 VERIFICATION:');
const phase70Files = [
  { path: path.join(phase70Path, 'src', 'index.tsx'), desc: 'Main Export' },
  { path: path.join(phase70Path, 'src', 'components', 'MatchExplanationPanel.tsx'), desc: 'Explanation Panel' },
  { path: path.join(phase70Path, 'src', 'policies', 'ExplanationVisibilityPolicy.ts'), desc: 'Visibility Policy' },
  { path: path.join(phase70Path, 'src', 'admin', 'AdminMatchDebug.tsx'), desc: 'Admin Debug' }
];

let phase70Ready = true;
phase70Files.forEach(file => {
  const exists = fs.existsSync(file.path);
  console.log(`  ${exists ? '✅' : '❌'} ${file.desc}`);
  if (!exists) phase70Ready = false;
});

// Phase 71 Verification
console.log('\n🧪 PHASE 71 VERIFICATION:');
const phase71Files = [
  { path: path.join(phase71Path, 'src', 'phase71_integration.ts'), desc: 'Integration Orchestrator' },
  { path: path.join(phase71Path, 'seed-data', 'index.ts'), desc: 'Seed Data' },
  { path: path.join(phase71Path, 'tests', 'integration.test.ts'), desc: 'Integration Tests' },
  { path: path.join(phase71Path, 'scripts', 'founder-verification.js'), desc: 'Founder Verification Script' }
];

let phase71Ready = true;
phase71Files.forEach(file => {
  const exists = fs.existsSync(file.path);
  console.log(`  ${exists ? '✅' : '❌'} ${file.desc}`);
  if (!exists) phase71Ready = false;
});

// Integration Readiness
console.log('\n🔗 INTEGRATION READINESS:');
console.log(`Phase 69: ${phase69Ready ? '✅ READY' : '❌ NOT READY'}`);
console.log(`Phase 70: ${phase70Ready ? '✅ READY' : '❌ NOT READY'}`);
console.log(`Phase 71: ${phase71Ready ? '✅ READY' : '❌ NOT READY'}`);

const allPhasesReady = phase69Ready && phase70Ready && phase71Ready;
console.log(`\n🎯 OVERALL STATUS: ${allPhasesReady ? '✅ ALL PHASES READY FOR INTEGRATION' : '❌ MISSING COMPONENTS'}`);

if (allPhasesReady) {
  console.log('\n✅ VERIFICATION PASSED');
  console.log('Phase 71 can now perform full integration testing.');
  console.log('All dependencies are present and ready.');
} else {
  console.log('\n❌ VERIFICATION FAILED');
  console.log('Missing components prevent full integration.');
  console.log('Please complete the missing phases/files.');
}
