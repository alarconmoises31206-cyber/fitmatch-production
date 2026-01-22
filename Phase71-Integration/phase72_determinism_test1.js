// Phase 72 - Determinism Test 1: Embedding Consistency
console.log("Phase 72 Determinism Test 1: Embedding Consistency");
console.log("==================================================");

// Same embedding function as in phase71_integration.ts
function generateEmbedding(text) {
    if (!text || text.trim().length === 0) {
        return [0, 0, 0, 0];
    }
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return [
        Math.sin(hash * 0.1),
        Math.cos(hash * 0.2),
        Math.sin(hash * 0.3),
        Math.cos(hash * 0.4)
    ];
}

// Test 1: Same input should produce same output
const testText = "Weight loss and muscle gain";
console.log(`\nTest 1: Input: "${testText}"`);

// Run 5 times
const results = [];
for (let i = 0; i < 5; i++) {
    const embedding = generateEmbedding(testText);
    results.push(embedding);
    console.log(`  Run ${i + 1}: ${JSON.stringify(embedding)}`);
}

// Check if all results are identical
const allEqual = results.every((embedding, i, arr) => 
    JSON.stringify(embedding) === JSON.stringify(arr[0])
);

console.log(`\nResult: ${allEqual ? "✅ PASS - All embeddings identical" : "❌ FAIL - Embeddings differ"}`);

// Test 2: Empty string handling
console.log(`\nTest 2: Empty string handling`);
const emptyEmbedding = generateEmbedding("");
console.log(`  Empty string embedding: ${JSON.stringify(emptyEmbedding)}`);
console.log(`  Expected: [0,0,0,0]`);
console.log(`  Result: ${JSON.stringify(emptyEmbedding) === JSON.stringify([0,0,0,0]) ? "✅ PASS" : "❌ FAIL"}`);

// Test 3: Different inputs produce different embeddings
console.log(`\nTest 3: Different inputs produce different embeddings`);
const text1 = "Weight loss";
const text2 = "Muscle gain";
const embedding1 = generateEmbedding(text1);
const embedding2 = generateEmbedding(text2);
console.log(`  Input 1: "${text1}" -> ${JSON.stringify(embedding1)}`);
console.log(`  Input 2: "${text2}" -> ${JSON.stringify(embedding2)}`);
console.log(`  Result: ${JSON.stringify(embedding1) !== JSON.stringify(embedding2) ? "✅ PASS - Different embeddings" : "❌ FAIL - Same embeddings"}`);
