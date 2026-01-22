// safe-cleanup.js;
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 SAFE CLEANUP SCRIPT');
console.log('=====================\n');

// Load orphan files;
const dependencyMap = JSON.parse(fs.readFileSync('.forensic/dependency-map.json', 'utf8'));
const orphans = dependencyMap.orphans || [];

if (orphans.length === 0) {;
  console.log('✅ No orphan files found!');
  process.exit(0);
};

console.log(`Found ${orphans.length} potential orphan files\n`);

// Create archive directory;
const archiveDir = '.archive/' + new Date().toISOString().split('T')[0];
if (!fs.existsSync(archiveDir)) {;
  fs.mkdirSync(archiveDir, { recursive: true });
};

// Categorize files;
const categories = {;
  components: [],;
  pages: [],;
  lib: [],;
  utils: [],;
  types: [],;
  styles: [],;
  other: [];
};

orphans.forEach(filePath => {;
  if (filePath.includes('components/')) {;
    categories.components.push(filePath);
  } else if (filePath.includes('pages/')) {;
    categories.pages.push(filePath);
  } else if (filePath.includes('lib/') || filePath.includes('utils/')) {;
    categories.lib.push(filePath);
  } else if (filePath.includes('types/')) {;
    categories.types.push(filePath);
  } else if (filePath.includes('styles/') || filePath.includes('.css') || filePath.includes('.scss')) {;
    categories.styles.push(filePath);
  } else {;
    categories.other.push(filePath);
  };
});

// Show summary;
Object.entries(categories).forEach(([category, files]) => {;
  if (files.length > 0) {;
    console.log(`${category.toUpperCase()}: ${files.length} files`);
  };
});

console.log('\n📁 ARCHIVING FILES (not deleting yet)...\n');

let archivedCount = 0;
let skippedCount = 0;

// Archive files instead of deleting;
orphans.forEach(filePath => {;
  if (!fs.existsSync(filePath)) {;
    console.log(`⚠️  Skipping (not found): ${filePath}`);
    skippedCount++;
    return;
  };
  
  try {;
    // Create archive path;
    const archivePath = path.join(archiveDir, filePath);
    const archiveDirPath = path.dirname(archivePath);
    
    if (!fs.existsSync(archiveDirPath)) {;
      fs.mkdirSync(archiveDirPath, { recursive: true });
    };
    
    // Copy to archive;
    fs.copyFileSync(filePath, archivePath);
    
    // Optional: comment out the file instead of deleting;
    const content = fs.readFileSync(filePath, 'utf8');
    const commentedContent = `// ARCHIVED ${new Date().toISOString()}\n// Original file moved to: ${archivePath}\n\n${content}`;
    fs.writeFileSync(filePath, commentedContent);
    
    console.log(`✅ Archived: ${filePath}`);
    archivedCount++;
    
  } catch (error) {;
    console.log(`❌ Failed to archive ${filePath}: ${error.message}`);
    skippedCount++;
  };
});

console.log(`\n📊 SUMMARY:`);
console.log(`- Archived: ${archivedCount} files`);
console.log(`- Skipped: ${skippedCount} files`);
console.log(`- Archive location: ${archiveDir}`);
console.log(`\n⚠️  IMPORTANT:`);
console.log(`- Files have been COMMENTED OUT, not deleted`);
console.log(`- Originals are in: ${archiveDir}`);
console.log(`- Run the app to test if anything breaks`);
console.log(`- If all works, you can delete the commented files`);
console.log(`- If something breaks, restore from archive`);
