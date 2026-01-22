// scripts/check-tailwind.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing Tailwind CSS Config Error');

const configPath = path.join(__dirname, 'tailwind.config.js');

try {
    const content = fs.readFileSync(configPath, 'utf8');
    console.log(`✅ Config file exists (${content.length} bytes)`);
    
    // Check for specific syntax around line 3, column 10
    const lines = content.split('\n');
    if (lines.length >= 3) {
        console.log(`\nLine 3: "${lines[2]}"`);
        console.log(`Column 10 character: "${lines[2].charAt(9) || 'end of line'}"`);
        
        // Common issue: Using TypeScript syntax in JS file
        if (lines[2].includes(':') && !lines[2].includes('=')) {
            console.log('⚠️  Possible TypeScript syntax (:) in JavaScript file');
        }
        
        // Check for arrow functions without parentheses
        if (lines[2].includes('=>') && !lines[2].includes('(')) {
            console.log('⚠️  Arrow function might be missing parentheses');
        }
    }
    
    // Try to parse it as JavaScript
    try {
        // Remove any import/export statements for parsing
        const testContent = content
            .replace(/^import.*from.*;?$/gm, '')
            .replace(/^export default/, 'module.exports =')
            .replace(/^export /, '');
            
        eval('(function() { ' + testContent + ' })()');
        console.log('✅ Config parses as JavaScript');
    } catch (parseError) {
        console.log('❌ JavaScript parse error:', parseError.message);
        console.log('Line number might be off due to imports/exports');
    }
    
} catch (err) {
    console.log('❌ Cannot read config:', err.message);
}

// Check package.json for Tailwind version
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const tailwindVersion = packageJson.dependencies?.tailwindcss || 
                           packageJson.devDependencies?.tailwindcss;
    console.log(`\n📦 Tailwind CSS version: ${tailwindVersion || 'Not found in package.json'}`);
} catch (err) {
    console.log('Cannot read package.json');
}

console.log('\n💡 Common fixes:');
console.log('1. Ensure tailwind.config.js is valid CommonJS (not pure ESM)');
console.log('2. Check for missing commas in object definitions');
console.log('3. Look for TypeScript types (:) in JavaScript file');
console.log('4. Check arrow function syntax');
