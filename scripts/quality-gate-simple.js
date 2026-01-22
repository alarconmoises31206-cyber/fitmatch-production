// scripts/quality-gate-simple.js
const fs = require("fs");
const path = require("path");

console.log("🚀 PHASE 41 - FINAL QUALITY GATE");
console.log("Validating Ship Mode Infrastructure");
console.log("=".repeat(50));

let passed = 0;
let total = 4;

// Test 1: TypeScript compilation
console.log("\n1. TypeScript Compilation");
try {
    const { execSync } = require("child_process");
    execSync("npx tsc --noEmit --project .", { encoding: "utf8", stdio: "pipe" });
    console.log("   ✅ 0 errors (target: ≤20)");
    passed++;
} catch {
    console.log("   ❌ Has errors");
}

// Test 2: Domain purity
console.log("\n2. Domain Layer Purity");
let domainCount = 0;
let pure = true;

function checkDomain(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    items.forEach(item => {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) checkDomain(full);
        else if (item.name.endsWith(".ts") || item.name.endsWith(".tsx")) {
            domainCount++;
            const content = fs.readFileSync(full, "utf8");
            if (content.includes("from '../infra") || content.includes('from "../infra')) {
                console.log(`   ❌ Impure: ${path.relative(process.cwd(), full)}`);
                pure = false;
            }
        }
    });
}

checkDomain("domain");
if (pure && domainCount > 0) {
    console.log(`   ✅ ${domainCount} domain files are pure`);
    passed++;
} else if (domainCount === 0) {
    console.log("   ⚠️  No domain files");
} else {
    console.log("   ❌ Domain has infrastructure imports");
}

// Test 3: Observability
console.log("\n3. Observability Foundation");
if (fs.existsSync("infra/observability/events.registry.ts")) {
    console.log("   ✅ Events registry exists");
    passed++;
} else {
    console.log("   ❌ Missing registry");
}

// Test 4: Architecture structure
console.log("\n4. Architecture Structure");
if (fs.existsSync("domain") && fs.existsSync("app") && fs.existsSync("infra")) {
    console.log("   ✅ Domain/App/Infra layers exist");
    passed++;
} else {
    console.log("   ❌ Missing layers");
}

console.log("\n" + "=".repeat(50));
console.log(`📊 Results: ${passed}/${total} tests passed`);

if (passed === total) {
    console.log("\n🎉 PHASE 41 QUALITY GATES PASS");
    console.log("Ready for Director approval");
    process.exit(0);
} else {
    console.log(`\n⚠️  ${total - passed} tests need attention`);
    process.exit(1);
}
