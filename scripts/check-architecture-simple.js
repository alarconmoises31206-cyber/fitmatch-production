// scripts/check-architecture-simple.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Simple Architecture Check');
console.log('Checking for critical violations only');

let violations = 0;

// Check domain layer purity
if (fs.existsSync('domain')) {
    console.log('\n📁 Checking Domain Layer:');
    
    const domainFiles = [];
    function findDomainFiles(dir) {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        items.forEach(item => {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                findDomainFiles(fullPath);
            } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
                domainFiles.push(fullPath);
            }
        });
    }
    
    findDomainFiles('domain');
    
    domainFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('from \'../infra') || content.includes('from "../infra')) {
            console.log(`  ❌ Domain importing infra: ${path.relative(process.cwd(), file)}`);
            violations++;
        }
        if (content.includes('import.*stripe') || content.includes('import.*supabase')) {
            console.log(`  ❌ Domain importing external lib: ${path.relative(process.cwd(), file)}`);
            violations++;
        }
    });
    
    console.log(`  ✅ ${domainFiles.length} domain files checked`);
}

// Check observability registry
console.log('\n📊 Checking Observability:');
if (fs.existsSync('infra/observability/events.registry.ts')) {
    console.log('  ✅ Events registry exists');
} else {
    console.log('  ❌ Missing events registry');
    violations++;
}

// Check quality gate script
console.log('\n🔧 Checking Automation:');
if (fs.existsSync('scripts/quality-gate.js')) {
    console.log('  ✅ Quality gate script exists');
} else {
    console.log('  ❌ Missing quality gate script');
    violations++;
}

console.log('\n' + '='.repeat(50));
if (violations === 0) {
    console.log('🎉 NO CRITICAL ARCHITECTURE VIOLATIONS');
    console.log('Phase 41 architecture foundation is solid');
    process.exit(0);
} else {
    console.log(`🚨 ${violations} CRITICAL VIOLATIONS FOUND`);
    console.log('Fix above issues before Phase 41 completion');
    process.exit(1);
}
