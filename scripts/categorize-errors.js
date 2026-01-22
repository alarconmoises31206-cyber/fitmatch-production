// scripts/categorize-errors.js
const { execSync } = require('child_process');

console.log('📊 Categorizing TypeScript errors...');

try {
    // Run TypeScript with strict mode to get all errors
    const output = execSync('npx tsc --noEmit --strict 2>&1', { 
        encoding: 'utf8', 
        stdio: 'pipe',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    const lines = output.split('\n');
    const errors = lines.filter(line => line.includes('error TS'));
    
    console.log(`Total errors: ${errors.length}`);
    
    // Categorize by error code
    const categories = {
        'TS7016': 'Missing type definitions',
        'TS7005': 'Implicit any type',
        'TS6133': 'Unused variable',
        'TS2532': 'Object possibly undefined',
        'TS2345': 'Argument type mismatch',
        'TS2307': 'Cannot find module',
        'TS2339': 'Property does not exist',
        'other': 'Other errors'
    };
    
    const counts = {};
    Object.keys(categories).forEach(key => counts[key] = 0);
    
    errors.forEach(error => {
        const match = error.match(/error\s+(TS\d+)/);
        if (match) {
            const code = match[1];
            if (counts[code] !== undefined) {
                counts[code]++;
            } else {
                counts.other++;
            }
        }
    });
    
    console.log('\n📈 Error breakdown:');
    Object.entries(categories).forEach(([code, description]) => {
        if (counts[code] > 0) {
            console.log(`  ${code}: ${counts[code]} - ${description}`);
        }
    });
    
    // Show top 5 most frequent files with errors
    console.log('\n📁 Top files with errors:');
    const fileCounts = {};
    lines.forEach(line => {
        const fileMatch = line.match(/(src\\[^)]+\.(ts|tsx|js|jsx))/);
        if (fileMatch) {
            const file = fileMatch[1];
            fileCounts[file] = (fileCounts[file] || 0) + 1;
        }
    });
    
    const sortedFiles = Object.entries(fileCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    sortedFiles.forEach(([file, count]) => {
        console.log(`  ${file}: ${count} errors`);
    });
    
} catch (error) {
    const output = error.stdout + error.stderr;
    const lines = output.split('\n');
    const errors = lines.filter(line => line.includes('error TS'));
    console.log(`Could not categorize all errors (${errors.length} total)`);
    
    // Just show sample errors
    console.log('\nSample errors:');
    errors.slice(0, 5).forEach(err => console.log(`  ${err}`));
}
