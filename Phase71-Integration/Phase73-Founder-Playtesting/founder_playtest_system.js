// Phase 73 - Founder Playtesting Simplified System
// Standalone version for behavioral validation

console.log("Phase 73 - Founder Playtesting System");
console.log("=====================================\n");

// Simple deterministic matching system for founder testing
class FounderTestSystem {
    constructor() {
        this.testClients = [];
        this.testTrainers = [];
        this.setupTestData();
    }
    
    setupTestData() {
        // Test client based on seed data
        this.testClients = [
            {
                userId: 'founder_test_client',
                answers: [
                    { questionId: 'q1', answer: 'Weight loss and improved cardiovascular health' },
                    { questionId: 'q2', answer: 'Weekday evenings after 6 PM' },
                    { questionId: 'q3', answer: 'Beginner, no major injuries' },
                    { questionId: 'q4', answer: 'Prefer trainers who explain exercise science clearly' },
                    { questionId: 'q5', answer: 'Want weekly progress tracking' },
                    { questionId: 'q6', answer: 'Respond best to supportive coaching' }
                ]
            }
        ];
        
        // Test trainers with varied specialties
        this.testTrainers = [
            {
                userId: 'trainer_weight_loss',
                answers: [
                    { questionId: 'q1', answer: 'Weight loss specialist with cardio focus' },
                    { questionId: 'q2', answer: 'Weekday evenings available' },
                    { questionId: 'q3', answer: 'Beginner friendly, injury modifications' },
                    { questionId: 'q4', answer: 'Detailed exercise explanations' },
                    { questionId: 'q5', answer: 'Weekly check-ins and adjustments' },
                    { questionId: 'q6', answer: 'Supportive and encouraging style' }
                ]
            },
            {
                userId: 'trainer_strength',
                answers: [
                    { questionId: 'q1', answer: 'Strength and power building' },
                    { questionId: 'q2', answer: 'Morning sessions only' },
                    { questionId: 'q3', answer: 'Advanced athletes preferred' },
                    { questionId: 'q4', answer: 'Minimal talk, maximum workout' },
                    { questionId: 'q5', answer: 'Monthly assessments' },
                    { questionId: 'q6', answer: 'Direct, challenging feedback' }
                ]
            },
            {
                userId: 'trainer_yoga',
                answers: [
                    { questionId: 'q1', answer: 'Mind-body connection and flexibility' },
                    { questionId: 'q2', answer: 'Weekends and evenings' },
                    { questionId: 'q3', answer: 'All levels welcome' },
                    { questionId: 'q4', answer: 'Philosophical approach to movement' },
                    { questionId: 'q5', answer: 'Intuitive progress tracking' },
                    { questionId: 'q6', answer: 'Gentle, mindful coaching' }
                ]
            },
            {
                userId: 'trainer_sports',
                answers: [
                    { questionId: 'q1', answer: 'Sport-specific training' },
                    { questionId: 'q2', answer: 'Variable schedule' },
                    { questionId: 'q3', answer: 'Intermediate to advanced' },
                    { questionId: 'q4', answer: 'Technical skill breakdowns' },
                    { questionId: 'q5', answer: 'Bi-weekly performance reviews' },
                    { questionId: 'q6', answer: 'Competitive, driven approach' }
                ]
            }
        ];
    }
    
    // Simple embedding function (deterministic)
    generateEmbedding(text) {
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
    
    // Calculate similarity between two embeddings
    cosineSimilarity(vecA, vecB) {
        let dot = 0, magA = 0, magB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dot += vecA[i] * vecB[i];
            magA += vecA[i] * vecA[i];
            magB += vecB[i] * vecB[i];
        }
        return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
    }
    
    // Hard filter check
    checkHardFilters(client, trainer) {
        const issues = [];
        
        // Check availability
        const clientAvailability = client.answers.find(a => a.questionId === 'q2')?.answer || '';
        const trainerAvailability = trainer.answers.find(a => a.questionId === 'q2')?.answer || '';
        
        if (clientAvailability.includes('weekday') && trainerAvailability.includes('weekend') && 
            !trainerAvailability.includes('weekday')) {
            issues.push("Availability mismatch");
        }
        
        // Check experience level
        const clientLevel = client.answers.find(a => a.questionId === 'q3')?.answer || '';
        const trainerLevel = trainer.answers.find(a => a.questionId === 'q3')?.answer || '';
        
        if (clientLevel.includes('Beginner') && trainerLevel.includes('Advanced only')) {
            issues.push("Experience level mismatch");
        }
        
        return {
            passes: issues.length === 0,
            issues
        };
    }
    
    // Calculate match score
    calculateMatch(client, trainer) {
        // Check hard filters first
        const filterCheck = this.checkHardFilters(client, trainer);
        if (!filterCheck.passes) {
            return {
                trainerId: trainer.userId,
                filtered: true,
                filterIssues: filterCheck.issues,
                score: 0,
                confidence: 0
            };
        }
        
        // Calculate embedding similarities
        let totalSimilarity = 0;
        let comparisons = 0;
        
        client.answers.forEach(clientAnswer => {
            const trainerAnswer = trainer.answers.find(a => a.questionId === clientAnswer.questionId);
            if (trainerAnswer) {
                const clientEmbedding = this.generateEmbedding(clientAnswer.answer);
                const trainerEmbedding = this.generateEmbedding(trainerAnswer.answer);
                const similarity = this.cosineSimilarity(clientEmbedding, trainerEmbedding);
                totalSimilarity += similarity;
                comparisons++;
            }
        });
        
        const avgSimilarity = comparisons > 0 ? totalSimilarity / comparisons : 0;
        const score = Math.round(avgSimilarity * 100);
        
        // Determine confidence level
        let confidence = 'Medium';
        if (score >= 80) confidence = 'High';
        if (score <= 30) confidence = 'Low';
        
        return {
            trainerId: trainer.userId,
            filtered: false,
            score,
            confidence,
            explanation: this.generateExplanation(client, trainer, score, confidence)
        };
    }
    
    // Generate explanation
    generateExplanation(client, trainer, score, confidence) {
        const explanations = [
            `Matches your focus on ${this.getMainGoal(client)}`,
            `Aligns with your preferred ${this.getCoachingStyle(client)} coaching style`,
            `Fits your ${this.getExperienceLevel(client)} experience level`,
            `Available during your preferred ${this.getAvailability(client)} times`,
            `Offers ${this.getTrackingStyle(trainer)} progress tracking`
        ];
        
        // Select top 2-3 explanations based on score
        const selectedExplanations = explanations.slice(0, Math.max(2, Math.floor(score / 30)));
        
        return {
            summary: `${trainer.userId} is a ${confidence.toLowerCase()} confidence match (${score}/100)`,
            reasons: selectedExplanations,
            confidence,
            score
        };
    }
    
    // Helper methods
    getMainGoal(client) {
        const answer = client.answers.find(a => a.questionId === 'q1')?.answer || '';
        if (answer.includes('weight loss')) return 'weight loss goals';
        if (answer.includes('strength')) return 'strength building';
        if (answer.includes('cardio')) return 'cardiovascular health';
        return 'fitness goals';
    }
    
    getCoachingStyle(client) {
        const answer = client.answers.find(a => a.questionId === 'q6')?.answer || '';
        if (answer.includes('supportive')) return 'supportive';
        if (answer.includes('direct')) return 'direct';
        return 'coaching';
    }
    
    getExperienceLevel(client) {
        const answer = client.answers.find(a => a.questionId === 'q3')?.answer || '';
        if (answer.includes('Beginner')) return 'beginner';
        if (answer.includes('Advanced')) return 'advanced';
        return 'current';
    }
    
    getAvailability(client) {
        const answer = client.answers.find(a => a.questionId === 'q2')?.answer || '';
        if (answer.includes('weekday')) return 'weekday';
        if (answer.includes('weekend')) return 'weekend';
        if (answer.includes('morning')) return 'morning';
        return 'available';
    }
    
    getTrackingStyle(trainer) {
        const answer = trainer.answers.find(a => a.questionId === 'q5')?.answer || '';
        if (answer.includes('weekly')) return 'weekly';
        if (answer.includes('monthly')) return 'monthly';
        return 'regular';
    }
    
    // Run a test
    runTest(clientChanges = []) {
        console.log("Running Founder Playtest\n");
        
        // Get the test client
        let client = JSON.parse(JSON.stringify(this.testClients[0]));
        
        // Apply changes if any
        if (clientChanges.length > 0) {
            console.log("Applying client changes:");
            clientChanges.forEach(change => {
                const answer = client.answers.find(a => a.questionId === change.questionId);
                if (answer) {
                    console.log(`  ${change.questionId}: "${answer.answer}" → "${change.newAnswer}"`);
                    answer.answer = change.newAnswer;
                }
            });
            console.log();
        }
        
        // Run matching
        console.log(`Matching client: ${client.userId}`);
        console.log("Current answers:");
        client.answers.forEach(a => {
            console.log(`  ${a.questionId}: "${a.answer}"`);
        });
        console.log("\n" + "=".repeat(50) + "\n");
        
        const results = this.testTrainers.map(trainer => 
            this.calculateMatch(client, trainer)
        );
        
        // Separate filtered and ranked results
        const filtered = results.filter(r => r.filtered);
        const ranked = results.filter(r => !r.filtered)
            .sort((a, b) => b.score - a.score);
        
        // Display results
        if (filtered.length > 0) {
            console.log("FILTERED OUT (Hard Filters):");
            filtered.forEach(trainer => {
                console.log(`  ${trainer.trainerId}: ${trainer.filterIssues.join(', ')}`);
            });
            console.log();
        }
        
        console.log("RANKED MATCHES:");
        ranked.forEach((trainer, index) => {
            console.log(`\n${index + 1}. ${trainer.trainerId}`);
            console.log(`   Score: ${trainer.score}/100`);
            console.log(`   Confidence: ${trainer.confidence}`);
            console.log(`   Explanation: ${trainer.explanation.summary}`);
            console.log(`   Reasons:`);
            trainer.explanation.reasons.forEach(reason => {
                console.log(`     • ${reason}`);
            });
        });
        
        console.log("\n" + "=".repeat(50));
        
        return {
            client,
            filtered,
            ranked,
            clientChanges
        };
    }
}

// Export for use in founder testing
const system = new FounderTestSystem();

// If run directly, show a demo
if (require.main === module) {
    console.log("Demo: Initial client profile\n");
    system.runTest();
    
    console.log("\n\nDemo: After changing goal to strength training\n");
    system.runTest([
        { questionId: 'q1', newAnswer: 'Building maximum strength and power' },
        { questionId: 'q3', newAnswer: 'Intermediate, want to push limits' }
    ]);
}

module.exports = FounderTestSystem;
