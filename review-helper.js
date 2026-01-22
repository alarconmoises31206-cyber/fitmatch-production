// review-helper.js;
const fs = require('fs');
const path = require('path');

console.log('🔍 FILE REVIEW HELPER');
console.log('====================\n');

// Files that need manual review;
const reviewFiles = [;
  'lib\\anti-leakage\\scanner.ts',;
  'lib\\constants\\specialties.ts',;
  'lib\\types\\verification.ts',;
  'lib\\types.ts',;
  'lib\\validators.ts',;
  'components\\admin\\PayoutDashboard.tsx',;
  'components\\dashboard\\TrainerDashboardMain.tsx',;
  'types\\custom.d.ts',;
  'types\\database.types.ts',;
  'types\\global.d.ts',;
  'safe-cleanup.js',;
  'targeted-delete.js',;
  'phase2-cleanup.js'];

console.log(`📋 ${reviewFiles.length} files need review:\n`);

// Create a review checklist;
const checklist = reviewFiles.map(filePath => {;
  const exists = fs.existsSync(filePath);
  const stats = exists ? fs.statSync(filePath) : null;
  
  return {;
    path: filePath,;
    exists,;
    size: exists ? `${(stats.size / 1024).toFixed(1)} KB` : 'MISSING',;
    lastModified: exists ? stats.mtime.toISOString().split('T')[0] : 'N/A',;
    action: 'REVIEW',;
    notes: '';
  };
});

// Display checklist;
console.log('┌' + '─'.repeat(80) + '┐');
console.log('│' + ' FILE REVIEW CHECKLIST '.padEnd(80, ' ') + '│');
console.log('├' + '─'.repeat(80) + '┤');

checklist.forEach((item, index) => {;
  const lineNum = (index + 1).toString().padStart(3, ' ');
  const path = item.path.padEnd(40, ' ');
  const size = item.size.padStart(10, ' ');
  const action = item.action.padStart(10, ' ');
  
  console.log(`│ ${lineNum}. ${path} ${size} ${action} │`);
});

console.log('└' + '─'.repeat(80) + '┘\n');

// Generate investigation commands;
console.log('🔎 INVESTIGATION COMMANDS:\n');

reviewFiles.forEach((filePath, index) => {;
  if (fs.existsSync(filePath)) {;
    console.log(`${index + 1}. Check ${path.basename(filePath)}:`);
    console.log(`   Get-Content ${filePath} -TotalCount 5`);
    console.log(`   Select-String -Path .\\ -Pattern "${path.basename(filePath, path.extname(filePath))}" -Recurse`);
    console.log('');
  };
});

// Create final decision helper;
console.log('📝 FINAL DECISION HELPER:\n');
console.log('For each file, ask:');
console.log('1. Is this file imported anywhere? (Check with Select-String)');
console.log('2. Does it contain critical logic?');
console.log('3. Is it a type definition that might be used at runtime?');
console.log('4. When was it last modified? (Old files are safer to delete)');
console.log('');
console.log('✅ SAFE TO DELETE IF:');
console.log('   - Not imported anywhere');
console.log('   - Contains only type definitions (if you have @types/ packages)');
console.log('   - Is a duplicate or placeholder');
console.log('');
console.log('⚠️  KEEP IF:');
console.log('   - Imported by other files');
console.log('   - Contains business logic');
console.log('   - Is a shared utility');
console.log('');

// Save checklist to file;
const checklistPath = '.forensic/final-review-checklist.md';
const checklistContent = `# Final File Review Checklist;

## Files Needing Review (${reviewFiles.length});

${reviewFiles.map((f, i) => `${i + 1}. \`${f}\``).join('\n')};

## Review Questions for Each File:;
1. ❓ Is this file imported anywhere?;
2. ❓ Does it contain critical business logic?;
3. ❓ Is it a type definition or actual code?;
4. ❓ When was it last modified?;
5. ❓ Can its functionality be found elsewhere?;

## Decision Guide:;
- 🗑️  DELETE: Not imported, old, duplicate, or placeholder;
- 📁 ARCHIVE: Uncertain but not critical;
- ✅ KEEP: Imported, contains unique logic, actively used;

## Investigation Commands:;
\`\`\`powershell;
${reviewFiles.map((f, i) => `# ${i + 1}. ${path.basename(f)}\nSelect-String -Path .\\ -Pattern "${path.basename(f, path.extname(f))}" -Recurse`).join('\n\n')};
\`\`\`;
`;

fs.writeFileSync(checklistPath, checklistContent);
console.log(`📄 Checklist saved to: ${checklistPath}`);
