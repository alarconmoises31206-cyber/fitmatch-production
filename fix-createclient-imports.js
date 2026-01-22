// This script fixes createClient -> createSupabaseClient imports
const fs = require('fs');
const path = require('path');

function fixCreateClientImports(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Fix: import { createClient } from '@/lib/supabase'
        // To: import { createSupabaseClient } from '@/lib/supabase'
        content = content.replace(
            /import\s*{([^}]*)\bcreateClient\b([^}]*)}from\s*['"]@\/lib\/supabase['"]/g,
            'import {} from "@/lib/supabase"'
        );
        
        // Fix: import { createClient } from '../../lib/supabase'
        content = content.replace(
            /import\s*{([^}]*)\bcreateClient\b([^}]*)}from\s*['"](\.\.\/)+lib\/supabase['"]/g,
            (match, p1, p2, p3) => {
                return \import {\createSupabaseClient\} from "\lib/supabase"\;
            }
        );
        
        // Also fix usage: createClient() -> createSupabaseClient()
        content = content.replace(/\bcreateClient\(\)/g, 'createSupabaseClient()');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(\Fixed: \\);
            return true;
        }
        return false;
    } catch (error) {
        console.error(\Error fixing \: \, error.message);
        return false;
    }
}

// Find all TypeScript/JavaScript files
const files = [];
function findFiles(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            // Skip node_modules
            if (item !== 'node_modules' && !item.startsWith('.')) {
                findFiles(fullPath);
            }
        } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
            files.push(fullPath);
        }
    }
}

findFiles('.');
let fixedCount = 0;
for (const file of files) {
    if (fixCreateClientImports(file)) {
        fixedCount++;
    }
}

console.log(\Fixed \ files.\);
