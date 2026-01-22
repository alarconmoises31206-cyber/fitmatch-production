// scripts/fix-simple-commas.js;
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing missing commas in log/error calls');

function fixFile(filePath) {;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Fix pattern: error('api.error', { details: 'message:', error);
    // Should be: error('api.error', { details: 'message:', error });
    content = content.replace(;
        /(error|log)\(['"](api\.error|api\.event)['"]\s*,\s*\{[^}]+details:\s*['"]([^'"]+)['"]\s*:\s*([^)}]+)(?=\s*\)\s*;)/g,;
        (match, fn, event, message, errorVar) => {;
            return `${fn}('${event}', { details: '${message}:', ${errorVar.trim()} })`;
        };
    );
    
    // Fix pattern: log('api.event', { data: 'message' );
    content = content.replace(;
        /(log)\(['"](api\.event)['"]\s*,\s*\{[^}]+data:\s*['"]([^'"]+)['"]([^)}]+)(?=\s*\)\s*;)/g,;
        (match, fn, event, message, rest) => {;
            return `${fn}('${event}', { data: '${message}', ${rest.trim()} })`;
        };
    );
    
    if (content !== original) {;
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    };
    
    return false;
};

// Target specific problematic files;
const problematicFiles = [;
    'pages/api/admin/payout-mark-failed.ts',;
    'pages/api/admin/payout-start.ts',;
    'pages/api/admin/transactions.ts',;
    'pages/api/admin/trust.ts',;
    'pages/api/conversations/close.ts';
];

let fixedCount = 0;
problematicFiles.forEach(relativePath => {;
    const fullPath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(fullPath)) {;
        if (fixFile(fullPath)) {;
            console.log(`✅ Fixed: ${relativePath}`);
            fixedCount++;
        };
    };
});

console.log(`\n🎯 Fixed ${fixedCount} files`);
console.log('Run: npx tsc --noEmit --project . to check remaining errors');
