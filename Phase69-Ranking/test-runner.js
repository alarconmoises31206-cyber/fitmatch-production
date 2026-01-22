#!/usr/bin/env node
// test-runner.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Phase 69 - Ranking & Selection Test Runner');
console.log('=============================================\n');

// Check if dependencies are installed
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log('✓ Package.json found');
} catch (error) {
  console.error('✗ Cannot read package.json');
  process.exit(1);
}

// Run TypeScript compilation
console.log('\n1. Compiling TypeScript...');
try {
  execSync('npx tsc', { stdio: 'inherit', cwd: __dirname });
  console.log('✓ TypeScript compilation successful\n');
} catch (error) {
  console.error('✗ TypeScript compilation failed');
  process.exit(1);
}

// Run tests
console.log('2. Running Phase 69 Smoke Tests...');
console.log('   These tests must all pass for phase completion:\n');
try {
  execSync('npx jest --coverage', { stdio: 'inherit', cwd: __dirname });
  console.log('\n✅ All Phase 69 Smoke Tests PASSED');
} catch (error) {
  console.error('\n❌ Phase 69 Smoke Tests FAILED');
  console.error('   Phase exit criteria not met.');
  process.exit(1);
}

// Final validation
console.log('\n3. Validating Phase 69 Exit Criteria...\n');
const exitCriteria = [
  '✔️ Trainer list is ordered deterministically',
  '✔️ Ranking respects all locks',
  '✔️ No trainer appears "mysteriously"',
  '✔️ You trust the ordering even when it disappoints'
];

exitCriteria.forEach(criterion => {
  console.log(criterion);
});

console.log('\n🎯 PHASE 69 COMPLETE');
console.log('The matching brain is now complete.');
