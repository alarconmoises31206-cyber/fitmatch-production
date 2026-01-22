// fix-imports.js;
const fs = require('fs');
const path = require('path');

console.log('🔧 IMPORT FIX SCRIPT');
console.log('===================\n');

// Common import fixes;
const importFixes = [;
  {;
    pattern: /from ['"](\.\.\/)*src\/lib\/onboarding['"]/g,;
    replacement: "from '@/lib/onboarding'",;
    description: "Fix onboarding import path";
  },;
  {;
    pattern: /from ['"](\.\.\/)*types\/match['"]/g,;
    replacement: "from '@/types/match'",;
    description: "Fix match types import path";
  },;
  {;
    pattern: /from ['"](\.\.\/)*src\/lib\/supabaseClient['"]/g,;
    replacement: "from '@/lib/supabaseClient'",;
    description: "Fix supabaseClient import path";
  };
];

// Find all TypeScript/JavaScript files;
const files = [];
function findFiles(dir) {;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {;
    const fullPath = path.join(dir, entry.name);
    
    // Skip node_modules, .next, etc.;
    if (entry.name === 'node_modules' || 
        entry.name === '.next' || 
        entry.name === '.git' ||;
        entry.name.startsWith('.')) {;
      continue;
    };
    
    if (entry.isDirectory()) {;
      findFiles(fullPath);
    } else if (entry.isFile() && 
              (entry.name.endsWith('.ts') || 
               entry.name.endsWith('.tsx') || 
               entry.name.endsWith('.js') || 
               entry.name.endsWith('.jsx'))) {;
      files.push(fullPath);
    };
  };
};

findFiles(process.cwd());

console.log(`Found ${files.length} source files to check\n`);

let filesFixed = 0;
let importsFixed = 0;

files.forEach(filePath => {;
  try {;
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fixedInThisFile = 0;
    
    importFixes.forEach(fix => {;
      if (fix.pattern.test(newContent)) {;
        newContent = newContent.replace(fix.pattern, fix.replacement);
        fixedInThisFile++;
      };
    });
    
    if (newContent !== content) {;
      fs.writeFileSync(filePath, newContent, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✅ Fixed ${fixedInThisFile} imports in: ${relativePath}`);
      filesFixed++;
      importsFixed += fixedInThisFile;
    };
    
  } catch (error) {;
    console.log(`⚠️  Could not read ${filePath}: ${error.message}`);
  };
});

console.log(`\n📊 SUMMARY:`);
console.log(`- Files checked: ${files.length}`);
console.log(`- Files fixed: ${filesFixed}`);
console.log(`- Total imports fixed: ${importsFixed}`);

if (filesFixed > 0) {;
  console.log('\n🔄 Some imports were fixed. You may need to restart the dev server.');
}
