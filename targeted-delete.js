// targeted-delete.js;
const fs = require('fs');
const path = require('path');

console.log('🎯 TARGETED SAFE DELETE');
console.log('======================\n');

// SAFE patterns - these are definitely test/script/temp files;
const safePatterns = [;
  /scripts[\\\/]test-.*\.js$/i,;
  /scripts[\\\/]create-test-.*\.js$/i,;
  /scripts[\\\/]dev-test-.*\.js$/i,;
  /scripts[\\\/]quick-.*test\.js$/i,;
  /scripts[\\\/]simple-test\.js$/i,;
  /test-.*\.js$/i,;
  /test_api_endpoints\.js$/i,;
  /create-test-user\.js$/i,;
  /temp-fix\.d\.ts$/i,;
  /trace-loader\.js$/i,;
  /forensic-pipeline\.js$/i,;
  /pages[\\\/]test-.*\.tsx$/i,;
  /pages[\\\/]minimal-test\.tsx$/i];

// Load orphans;
const dependencyMap = JSON.parse(fs.readFileSync('.forensic/dependency-map.json', 'utf8'));
const allOrphans = dependencyMap.orphans || [];

// Filter for safe files;
const safeToDelete = allOrphans.filter(filePath => {;
  return safePatterns.some(pattern => pattern.test(filePath));
});

console.log(`Found ${safeToDelete.length} definitely safe files to delete:\n`);

// Show what we'll delete;
safeToDelete.forEach(filePath => {;
  console.log(`🗑️  ${filePath}`);
});

console.log(`\nTotal: ${safeToDelete.length} files`);
console.log('\n⚠️  REVIEW THE LIST ABOVE');
console.log('Press Ctrl+C to cancel, or');
const readline = require('readline');
const rl = readline.createInterface({;
  input: process.stdin,;
  output: process.stdout;
});

rl.question('\nProceed with deletion? (yes/no): ', (answer) => {;
  if (answer.toLowerCase() === 'yes') {;
    console.log('\n🗑️  DELETING FILES...\n');
    
    let deletedCount = 0;
    let failedCount = 0;
    
    safeToDelete.forEach(filePath => {;
      try {;
        if (fs.existsSync(filePath)) {;
          fs.unlinkSync(filePath);
          console.log(`✅ Deleted: ${filePath}`);
          deletedCount++;
        } else {;
          console.log(`⚠️  Not found: ${filePath}`);
        };
      } catch (error) {;
        console.log(`❌ Failed to delete ${filePath}: ${error.message}`);
        failedCount++;
      };
    });
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`- Successfully deleted: ${deletedCount} files`);
    console.log(`- Failed: ${failedCount} files`);
    console.log(`\n🎉 ${deletedCount} files removed from your project!`);
    
  } else {;
    console.log('❌ Deletion cancelled.');
  };
  
  rl.close();
});
