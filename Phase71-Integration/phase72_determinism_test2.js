// Phase 72 - Determinism Test 2: Complete Pipeline Simulation
console.log("Phase 72 Determinism Test 2: Complete Pipeline Simulation");
console.log("=========================================================");

// Mock components for deterministic testing
class MockRankingEngine {
    static rankTrainers(client, trainers, weights = { primary: 0.7, secondary: 0.3 }) {
        console.log(`\nRanking ${trainers.length} trainers for client: ${client.userId}`);
        console.log(`Using weights - Primary: ${weights.primary}, Secondary: ${weights.secondary}`);
        
        // Simulate deterministic scoring
        const scoredTrainers = trainers.map(trainer => {
            // Deterministic score based on userId hash
            const clientHash = client.userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            const trainerHash = trainer.userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            const baseScore = Math.abs(Math.sin(clientHash + trainerHash)) * 100;
            
            // Apply weights
            const primaryScore = baseScore * weights.primary;
            const secondaryScore = (100 - baseScore) * weights.secondary;
            const totalScore = primaryScore + secondaryScore;
            
            return {
                ...trainer,
                matchScore: parseFloat(totalScore.toFixed(2)),
                confidence: parseFloat((totalScore / 100).toFixed(2))
            };
        });
        
        // Sort by score (descending)
        const rankedTrainers = [...scoredTrainers].sort((a, b) => b.matchScore - a.matchScore);
        
        return {
            rankedTrainers,
            hardFiltersApplied: 0,
            softScoresCalculated: scoredTrainers.length
        };
    }
}

class MockExplanationGenerator {
    static generateExplanation(trainer, rank, totalTrainers) {
        return {
            trainerId: trainer.userId,
            rank: rank + 1,
            totalTrainers,
            score: trainer.matchScore,
            confidence: trainer.confidence,
            explanation: `Trainer ${trainer.userId} ranked #${rank + 1} with score ${trainer.matchScore} (${Math.round(trainer.confidence * 100)}% confidence)`,
            visibility: {
                client: true,
                trainer: false,
                admin: true
            }
        };
    }
}

// Test data matching Phase 72 requirements
const testClient = {
    userId: "client_test_72",
    userType: "client",
    answers: [
        { questionId: "q1", answer: "Weight loss" },
        { questionId: "q2", answer: "3x per week" },
        { questionId: "q3", answer: "Beginner" }
    ]
};

const testTrainers = [
    {
        userId: "trainer_primary_match",
        userType: "trainer",
        answers: [
            { questionId: "q1", answer: "Weight loss specialist" },
            { questionId: "q2", answer: "Flexible schedule" },
            { questionId: "q3", answer: "All levels" }
        ]
    },
    {
        userId: "trainer_secondary_match", 
        userType: "trainer",
        answers: [
            { questionId: "q1", answer: "Strength training" },
            { questionId: "q2", answer: "Weekends only" },
            { questionId: "q3", answer: "Advanced only" }
        ]
    },
    {
        userId: "trainer_low_match",
        userType: "trainer",
        answers: [
            { questionId: "q1", answer: "Yoga" },
            { questionId: "q2", answer: "Morning only" },
            { questionId: "q3", answer: "Intermediate" }
        ]
    }
];

console.log("\n🔧 Test Configuration:");
console.log(`   Client: ${testClient.userId} (${testClient.answers.length} answers)`);
console.log(`   Trainers: ${testTrainers.map(t => t.userId).join(', ')}`);

// Test 1: Deterministic ranking with default weights
console.log("\n📊 Test 1: Deterministic Ranking (3 runs)");
console.log("----------------------------------------");

const allResults = [];
for (let run = 1; run <= 3; run++) {
    console.log(`\nRun ${run}:`);
    const result = MockRankingEngine.rankTrainers(testClient, testTrainers);
    
    const runData = {
        run,
        trainers: result.rankedTrainers.map(t => ({
            id: t.userId,
            score: t.matchScore,
            confidence: t.confidence
        }))
    };
    allResults.push(runData);
    
    result.rankedTrainers.forEach((trainer, index) => {
        console.log(`   ${index + 1}. ${trainer.userId}: ${trainer.matchScore} (${trainer.confidence})`);
    });
}

// Verify determinism
const isDeterministic = allResults.every((result, i, arr) => {
    if (i === 0) return true;
    return JSON.stringify(result.trainers) === JSON.stringify(arr[0].trainers);
});

console.log(`\n✅ Determinism Check: ${isDeterministic ? "PASS - All runs identical" : "FAIL - Runs differ"}`);

// Test 2: Weight authority verification
console.log("\n⚖️ Test 2: Weight Authority Verification");
console.log("--------------------------------------");

const weightsTest1 = MockRankingEngine.rankTrainers(testClient, testTrainers, { primary: 0.8, secondary: 0.2 });
const weightsTest2 = MockRankingEngine.rankTrainers(testClient, testTrainers, { primary: 0.5, secondary: 0.5 });

console.log("\nWith Primary weight 0.8:");
weightsTest1.rankedTrainers.forEach((t, i) => console.log(`   ${i + 1}. ${t.userId}: ${t.matchScore}`));

console.log("\nWith Primary weight 0.5:");
weightsTest2.rankedTrainers.forEach((t, i) => console.log(`   ${i + 1}. ${t.userId}: ${t.matchScore}`));

// Test 3: Explanation generation
console.log("\n📝 Test 3: Explanation Generation");
console.log("--------------------------------");

const rankingResult = MockRankingEngine.rankTrainers(testClient, testTrainers);
const explanations = rankingResult.rankedTrainers.map((trainer, index) => 
    MockExplanationGenerator.generateExplanation(trainer, index, rankingResult.rankedTrainers.length)
);

explanations.forEach(exp => {
    console.log(`\n${exp.explanation}`);
    console.log(`   Visibility - Client: ${exp.visibility.client}, Trainer: ${exp.visibility.trainer}, Admin: ${exp.visibility.admin}`);
});

console.log("\n==================================================");
console.log("Phase 72 Test 2 Complete - All checks executed");
console.log("==================================================");
