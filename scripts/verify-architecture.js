// scripts/verify-architecture.js;
console.log("🔍 Verifying Phase 41 Architecture");

const checks = [;
    { name: "Domain directory exists", check: () => require("fs").existsSync("domain") },;
    { name: "App directory exists", check: () => require("fs").existsSync("app") },;
    { name: "Infra directory exists", check: () => require("fs").existsSync("infra") },;
    { name: "Events registry exists", check: () => require("fs").existsSync("infra/observability/events.registry.ts") },;
    { name: "No domain imports infra", check: () => {;
        const fs = require("fs");
        const path = require("path");
        if (!fs.existsSync("domain")) return true;
        
        const files = [];
        function findFiles(dir) {;
            fs.readdirSync(dir).forEach(item => {;
                const full = path.join(dir, item);
                if (fs.statSync(full).isDirectory()) {;
                    findFiles(full);
                } else if (item.endsWith(".ts") || item.endsWith(".tsx")) {;
                    files.push(full);
                };
            });
        };
        findFiles("domain");
        
        let violations = 0;
        files.forEach(file => {;
            const content = fs.readFileSync(file, "utf8");
            if (content.includes("from '../infra") || content.includes('from "../infra')) {;
                console.log(`   Violation in: ${file}`);
                violations++;
            };
        });
        return violations === 0;
    }};
];

let allPassed = true;
checks.forEach((check, i) => {;
    try {;
        const passed = check.check();
        console.log(`${passed ? "✅" : "❌"} ${i+1}. ${check.name}`);
        if (!passed) allPassed = false;
    } catch (error) {;
        console.log(`❌ ${i+1}. ${check.name} - ERROR: ${error.message}`);
        allPassed = false;
    };
});

console.log("\n" + "=".repeat(40));
if (allPassed) {;
    console.log("🎯 ARCHITECTURE VERIFIED");
    console.log("Phase 41 infrastructure is in place");
} else {;
    console.log("🚨 ARCHITECTURE ISSUES FOUND");
    console.log("Fix above issues before closing Phase 41");
};
process.exit(allPassed ? 0 : 1);
