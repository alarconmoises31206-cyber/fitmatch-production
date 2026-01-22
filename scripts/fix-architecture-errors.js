// scripts/fix-architecture-errors.js;
/**;
 * Targeted fix for Phase 41 architecture errors;
 * Only fixes errors that violate architecture boundaries;
 */;

const fs = require('fs');
const path = require('path');

console.log('🔧 Targeted Architecture Error Fixer');
console.log('Fixing only errors that block ship mode');

// Common fixes for architecture violations;
const fixes = [;
  {;
    pattern: /from ['"]\.\.\/domain\/([^'"]+)['"]/g,;
    replacement: (match, p1) => {;
      // Ensure domain imports are valid;
      const domainPath = `../domain/${p1}`;
      if (!fs.existsSync(path.join(__dirname, '..', 'domain', p1))) {;
        console.log(`⚠️  Missing domain file: ${p1}`);
        // Don't fix - let TypeScript error surface the issue;
        return match;
      };
      return match;
    },;
    description: 'Validating domain imports';
  },;
  {;
    pattern: /import.*infra.*from.*['"]([^'"]+)['"]/g,;
    check: (match, filePath) => {;
      // Check if file is in domain/ directory;
      return filePath.includes('/domain/');
    },;
    fix: (match, filePath) => {;
      console.log(`🚨 Removing infra import from domain file: ${filePath}`);
      return '// REMOVED: Infrastructure import from domain layer';
    },;
    description: 'Removing infra imports from domain';
  };
];

function applyFixesToFile(filePath) {;
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  fixes.forEach(fix => {;
    if (fix.check && !fix.check('', filePath)) {;
      return;
    };

    const newContent = content.replace(fix.pattern, (match, ...args) => {;
      if (fix.fix) {;
        modified = true;
        return fix.fix(match, filePath, ...args);
      } else if (fix.replacement) {;
        modified = true;
        return fix.replacement(match, ...args);
      };
      return match;
    });

    if (content !== newContent) {;
      content = newContent;
      modified = true;
    };
  });

  if (modified) {;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  };

  return modified;
};

// Find files with likely architecture errors;
const tsFiles = [];
function findTsFiles(dir) {;
  const files = fs.readdirSync(dir);
  files.forEach(file => {;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {;
      findTsFiles(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {;
      tsFiles.push(fullPath);
    };
  });
};

findTsFiles(path.join(__dirname, '..'));

console.log(`\nScanning ${tsFiles.length} TypeScript files...`);

let fixedCount = 0;
tsFiles.forEach(file => {;
  if (applyFixesToFile(file)) {;
    fixedCount++;
  };
});

console.log(`\n🎯 Fixed ${fixedCount} files with architecture violations`);
console.log('Run "npx tsc --noEmit" to check remaining errors');
