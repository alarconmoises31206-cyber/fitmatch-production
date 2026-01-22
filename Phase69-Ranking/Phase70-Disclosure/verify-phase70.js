// Quick Phase 70 verification test
const fs = require('fs');
const path = require('path');

console.log('🔍 Phase 70 Component Verification');
console.log('=================================\n');

// Check all required components
const components = [
  'src/components/MatchExplanationPanel.tsx',
  'src/components/TrainerMatchContext.tsx',
  'src/components/ConfidenceBadge.tsx',
  'src/components/FailureMessaging.ts',
  'src/admin/AdminMatchDebug.tsx',
  'src/policies/ExplanationVisibilityPolicy.ts',
  'src/index.tsx'
];

let allExist = true;
components.forEach(component => {
  const exists = fs.existsSync(path.join(__dirname, component));
  console.log(`${exists ? '✅' : '❌'} ${component}`);
  if (!exists) allExist = false;
});

console.log(`\n📊 Status: ${allExist ? 'All components present' : 'Missing components'}`);

if (allExist) {
  console.log('\n🎯 Phase 70 is structurally complete');
  console.log('Components ready for React integration');
} else {
  console.log('\n⚠️  Phase 70 needs missing components');
}
