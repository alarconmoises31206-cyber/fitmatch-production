// Phase 73 - Improved Founder Playtesting System
// Fixed scoring and better behavioral validation

class ImprovedFounderTestSystem {
    constructor() {
        this.setupTestData();
        this.initialize();
    }
    
    initialize() {
        console.log("Phase 73 Founder Playtesting System - Ready");
        console.log("System designed for behavioral validation only");
        console.log("=============================================\n");
    }
    
    setupTestData() {
        // Enhanced test data with clearer differentiation
        this.testClients = [
            {
                userId: 'founder_client_a',
                name: 'Alex - Weight Loss Focus',
                answers: [
                    { questionId: 'q1', answer: 'Lose 20 pounds, improve cardio health' },
                    { questionId: 'q2', answer: 'Weekday evenings, 6-8 PM' },
                    { questionId: 'q3', answer: 'Beginner, sedentary lifestyle' },
                    { questionId: 'q4', answer: 'Need clear explanations and demonstrations' },
                    { questionId: 'q5', answer: 'Weekly check-ins and adjustments' },
                    { questionId: 'q6', answer: 'Encouraging, patient approach' }
                ]
            },
            {
                userId: 'founder_client_b', 
                name: 'Jordan - Strength Athlete',
                answers: [
                    { questionId: 'q1', answer: 'Build muscle, increase max lifts' },
                    { questionId: 'q2', answer: 'Early mornings, 5-7 AM' },
                    { questionId: 'q3', answer: 'Advanced, competition focused' },
                    { questionId: 'q4', answer: 'Just show me the workout' },
                    { questionId: 'q5', answer: 'Monthly strength testing' },
                    { questionId: 'q6', answer: 'Direct, challenging feedback' }
                ]
            }
        ];
        
        this.testTrainers = [
            {
                userId: 'trainer_cardio',
                name: 'Cardio Coach',
                specialty: 'Weight Loss & Cardio',
                answers: [
                    { questionId: 'q1', answer: 'Weight loss through HIIT and cardio' },
                    { questionId: 'q2', answer: 'Evenings and weekends' },
                    { questionId: 'q3', answer: 'Beginner to intermediate' },
                    { questionId: 'q4', answer: 'Detailed exercise science explanations' },
                    { questionId: 'q5', answer: 'Weekly progress photos and measurements' },
                    { questionId: 'q6', answer: 'Supportive, motivational style' }
                ]
            },
            {
                userId: 'trainer_power',
                name: 'Power Trainer',
                specialty: 'Strength & Power',
                answers: [
                    { questionId: 'q1', answer: 'Strength building, power development' },
                    { questionId: 'q2', answer: 'Early mornings only' },
                    { questionId: 'q3', answer: 'Intermediate to advanced' },
                    { questionId: 'q4', answer: 'Minimal talk, heavy lifts' },
                    { questionId: 'q5', answer: 'Monthly 1RM testing' },
                    { questionId: 'q6', answer: 'Tough love, high expectations' }
                ]
            },
            {
                userId: 'trainer_holistic',
                name: 'Holistic Guide',
                specialty: 'Mind-Body Balance',
                answers: [
                    { questionId: 'q1', answer: 'Overall wellness and flexibility' },
                    { questionId: 'q2', answer: 'Flexible schedule' },
                    { questionId: 'q3', answer: 'All levels, injury rehab' },
                    { questionId: 'q4', answer: 'Mindful movement philosophy' },
                    { questionId: 'q5', answer: 'Body awareness tracking' },
                    { questionId: 'q6', answer: 'Gentle, intuitive guidance' }
                ]
            },
            {
                userId: 'trainer_sports',
                name: 'Sports Specialist',
                specialty: 'Sport Performance',
                answers: [
                    { questionId: 'q1', answer: 'Sport-specific conditioning' },
                    { questionId: 'q2', answer: 'Afternoons and evenings' },
                    { questionId: 'q3', answer: 'Athletes only' },
                    { questionId: 'q4', answer: 'Technical skill analysis' },
                    { questionId: 'q5', answer: 'Game performance metrics' },
                    { questionId: 'q6', answer: 'Competitive, driven approach' }
                ]
            }
        ];
    }
    
    // Improved embedding with better differentiation
    generateEmbedding(text) {
        if (!text || text.trim().length === 0) {
            return [0.1, 0.1, 0.1, 0.1]; // Neutral small vector
        }
        
        // Create more distinctive embeddings based on keywords
        const keywords = {
            'weight loss': [0.9, 0.1, 0.1, 0.1],
            'cardio': [0.8, 0.2, 0.1, 0.1],
            'strength': [0.1, 0.9, 0.1, 0.1],
            'power': [0.1, 0.8, 0.2, 0.1],
            'beginner': [0.2, 0.1, 0.9, 0.1],
            'advanced': [0.1, 0.2, 0.1, 0.9],
            'flexibility': [0.1, 0.1, 0.8, 0.2],
            'sport': [0.2, 0.2, 0.2, 0.8]
        };
        
        let embedding = [0.5, 0.5, 0.5, 0.5]; // Neutral starting point
        let matches = 0;
        
        Object.keys(keywords).forEach(keyword => {
            if (text.toLowerCase().includes(keyword)) {
                for (let i = 0; i < 4; i++) {
                    embedding[i] = (embedding[i] + keywords[keyword][i]) / 2;
                }
                matches++;
            }
        });
        
        // If no keywords matched, use deterministic hash
        if (matches === 0) {
            const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            embedding = [
                0.5 + Math.sin(hash * 0.1) * 0.3,
                0.5 + Math.cos(hash * 0.2) * 0.3,
                0.5 + Math.sin(hash * 0.3) * 0.3,
                0.5 + Math.cos(hash * 0.4) * 0.3
            ];
        }
        
        return embedding;
    }
    
    cosineSimilarity(vecA, vecB) {
        let dot = 0, magA = 0, magB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dot += vecA[i] * vecB[i];
            magA += vecA[i] * vecA[i];
            magB += vecB[i] * vecB[i];
        }
        const similarity = magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
        // Normalize to 0-1 range (cosine similarity ranges from -1 to 1)
        return (similarity + 1) / 2;
    }
    
    checkHardFilters(client, trainer) {
        const issues = [];
        
        // Availability filter
        const clientAvail = client.answers.find(a => a.questionId === 'q2')?.answer || '';
        const trainerAvail = trainer.answers.find(a => a.questionId === 'q2')?.answer || '';
        
        if (clientAvail.includes('evenings') && trainerAvail.includes('mornings') && 
            !trainerAvail.includes('evenings')) {
            issues.push("Schedule mismatch: client needs evenings, trainer only mornings");
        }
        
        if (clientAvail.includes('mornings') && trainerAvail.includes('evenings') &&
            !trainerAvail.includes('mornings')) {
            issues.push("Schedule mismatch: client needs mornings, trainer only evenings");
        }
        
        // Experience level filter
        const clientLevel = client.answers.find(a => a.questionId === 'q3')?.answer || '';
        const trainerLevel = trainer.answers.find(a => a.questionId === 'q3')?.answer || '';
        
        if (clientLevel.includes('Beginner') && trainerLevel.includes('athletes only')) {
            issues.push("Experience mismatch: beginner client, trainer works with athletes only");
        }
        
        if (clientLevel.includes('Advanced') && trainerLevel.includes('beginner to')) {
            // Not a hard filter, but might affect score
        }
        
        return {
            passes: issues.length === 0,
            issues
        };
    }
    
    calculateMatch(client, trainer) {
        // Hard filters first
        const filterCheck = this.checkHardFilters(client, trainer);
        if (!filterCheck.passes) {
            return {
                trainerId: trainer.userId,
                trainerName: trainer.name,
                specialty: trainer.specialty,
                filtered: true,
                filterIssues: filterCheck.issues,
                score: 0,
                confidence: 'Filtered'
            };
        }
        
        // Calculate similarity for each question
        let totalScore = 0;
        let questionScores = [];
        
        client.answers.forEach(clientAnswer => {
            const trainerAnswer = trainer.answers.find(a => a.questionId === clientAnswer.questionId);
            if (trainerAnswer) {
                const clientEmbed = this.generateEmbedding(clientAnswer.answer);
                const trainerEmbed = this.generateEmbedding(trainerAnswer.answer);
                const similarity = this.cosineSimilarity(clientEmbed, trainerEmbed);
                const questionScore = Math.round(similarity * 25); // 0-25 per question
                
                questionScores.push({
                    questionId: clientAnswer.questionId,
                    score: questionScore,
                    clientAnswer: clientAnswer.answer.substring(0, 40) + (clientAnswer.answer.length > 40 ? '...' : ''),
                    trainerAnswer: trainerAnswer.answer.substring(0, 40) + (trainerAnswer.answer.length > 40 ? '...' : '')
                });
                
                totalScore += questionScore;
            }
        });
        
        // Normalize to 0-100 scale
        const maxPossible = 25 * 6; // 6 questions, max 25 each
        const normalizedScore = Math.round((totalScore / maxPossible) * 100);
        
        // Determine confidence
        let confidence = 'Medium';
        if (normalizedScore >= 75) confidence = 'High';
        if (normalizedScore <= 30) confidence = 'Low';
        if (normalizedScore <= 10) confidence = 'Very Low';
        
        return {
            trainerId: trainer.userId,
            trainerName: trainer.name,
            specialty: trainer.specialty,
            filtered: false,
            score: normalizedScore,
            confidence,
            questionScores,
            explanation: this.generateExplanation(client, trainer, normalizedScore, confidence, questionScores)
        };
    }
    
    generateExplanation(client, trainer, score, confidence, questionScores) {
        // Find strongest matching areas
        const strongMatches = questionScores
            .filter(q => q.score >= 20)
            .map(q => this.getQuestionExplanation(q.questionId));
        
        // Find weak areas
        const weakMatches = questionScores
            .filter(q => q.score <= 10)
            .map(q => this.getQuestionExplanation(q.questionId));
        
        const explanations = [];
        
        if (strongMatches.length > 0) {
            explanations.push(`Strong alignment on: ${strongMatches.slice(0, 2).join(', ')}`);
        }
        
        if (weakMatches.length > 0 && score < 70) {
            explanations.push(`Different approaches to: ${weakMatches.slice(0, 2).join(', ')}`);
        }
        
        // Add specialty match if relevant
        const clientGoal = client.answers.find(a => a.questionId === 'q1')?.answer || '';
        if (clientGoal.toLowerCase().includes('weight') && trainer.specialty.toLowerCase().includes('weight')) {
            explanations.push("Specializes in weight loss goals");
        }
        if (clientGoal.toLowerCase().includes('strength') && trainer.specialty.toLowerCase().includes('strength')) {
            explanations.push("Specializes in strength training");
        }
        
        return {
            summary: `${trainer.name} (${trainer.specialty}) - ${confidence} Confidence Match`,
            score: `${score}/100`,
            confidence,
            details: explanations,
            note: confidence === 'High' ? 'Strong overall alignment' :
                   confidence === 'Medium' ? 'Moderate alignment with some differences' :
                   'Limited alignment, consider other options'
        };
    }
    
    getQuestionExplanation(questionId) {
        const explanations = {
            'q1': 'fitness goals',
            'q2': 'schedule availability',
            'q3': 'experience level',
            'q4': 'teaching style',
            'q5': 'progress tracking',
            'q6': 'coaching approach'
        };
        return explanations[questionId] || 'this area';
    }
    
    runFounderTest(clientIndex = 0, changes = []) {
        console.log("\n" + "=".repeat(70));
        console.log("FOUNDER PLAYTEST SESSION");
        console.log("=".repeat(70));
        
        // Get client
        let client = JSON.parse(JSON.stringify(this.testClients[clientIndex]));
        const originalClient = JSON.parse(JSON.stringify(client));
        
        // Apply changes if any
        if (changes.length > 0) {
            console.log("\n📝 APPLYING CLIENT CHANGES:");
            changes.forEach(change => {
                const answer = client.answers.find(a => a.questionId === change.questionId);
                if (answer) {
                    console.log(`  ${change.questionId}:`);
                    console.log(`    Before: "${answer.answer}"`);
                    console.log(`    After:  "${change.newAnswer}"`);
                    answer.answer = change.newAnswer;
                }
            });
        }
        
        console.log(`\n🧑 CLIENT: ${client.name}`);
        console.log("Profile:");
        client.answers.forEach(a => {
            console.log(`  ${a.questionId}: ${a.answer}`);
        });
        
        console.log("\n" + "-".repeat(70));
        console.log("MATCHING RESULTS:");
        console.log("-".repeat(70));
        
        // Calculate matches
        const results = this.testTrainers.map(trainer => 
            this.calculateMatch(client, trainer)
        );
        
        // Separate filtered and ranked
        const filtered = results.filter(r => r.filtered);
        const ranked = results.filter(r => !r.filtered)
            .sort((a, b) => b.score - a.score);
        
        // Display filtered
        if (filtered.length > 0) {
            console.log("\n🚫 FILTERED OUT (Hard Constraints):");
            filtered.forEach(t => {
                console.log(`\n  ${t.trainerName} (${t.specialty})`);
                t.filterIssues.forEach(issue => {
                    console.log(`    ❌ ${issue}`);
                });
            });
        }
        
        // Display ranked
        console.log("\n🏆 RANKED MATCHES:");
        ranked.forEach((trainer, index) => {
            console.log(`\n${index + 1}. ${trainer.trainerName} (${trainer.specialty})`);
            console.log(`   Score: ${trainer.score}/100 | Confidence: ${trainer.confidence}`);
            console.log(`   ${trainer.explanation.summary}`);
            console.log(`   ${trainer.explanation.note}`);
            
            if (trainer.explanation.details.length > 0) {
                console.log(`   Key factors:`);
                trainer.explanation.details.forEach(detail => {
                    console.log(`     • ${detail}`);
                });
            }
            
            // Show top and bottom question scores
            const topQuestions = [...trainer.questionScores]
                .sort((a, b) => b.score - a.score)
                .slice(0, 2);
            const bottomQuestions = [...trainer.questionScores]
                .sort((a, b) => a.score - b.score)
                .slice(0, 2);
            
            console.log(`   Strongest areas: ${topQuestions.map(q => `${this.getQuestionExplanation(q.questionId)} (${q.score}/25)`).join(', ')}`);
            console.log(`   Weakest areas: ${bottomQuestions.map(q => `${this.getQuestionExplanation(q.questionId)} (${q.score}/25)`).join(', ')}`);
        });
        
        console.log("\n" + "=".repeat(70));
        console.log("FOUNDER REVIEW QUESTIONS:");
        console.log("=".repeat(70));
        console.log("1. Does the ranking order feel intuitive?");
        console.log("2. Do explanations match what changed in the inputs?");
        console.log("3. Are confidence levels appropriate for the scores?");
        console.log("4. Any outputs feel confusing or misleading?");
        console.log("\nLog observations in phase73_intuition_log.md");
        
        return {
            client: originalClient,
            changes,
            results: {
                filtered,
                ranked
            }
        };
    }
    
    // Helper to run a specific scenario
    runScenario(scenarioName, changes) {
        console.log(`\n🎬 SCENARIO: ${scenarioName}`);
        console.log("-".repeat(50));
        return this.runFounderTest(0, changes);
    }
}

// Create and export system
const founderSystem = new ImprovedFounderTestSystem();

// Demo if run directly
if (require.main === module) {
    console.log("PHASE 73 - FOUNDER PLAYTESTING DEMONSTRATION\n");
    
    // Test 1: Baseline
    founderSystem.runScenario("Baseline - Weight Loss Client", []);
    
    // Test 2: Change to strength focus
    founderSystem.runScenario("Changed to Strength Training", [
        { questionId: 'q1', newAnswer: 'Build muscle, increase strength' },
        { questionId: 'q3', newAnswer: 'Intermediate, some gym experience' },
        { questionId: 'q6', newAnswer: 'Direct, challenging feedback preferred' }
    ]);
    
    // Test 3: Change schedule constraint
    founderSystem.runScenario("Changed Availability", [
        { questionId: 'q2', newAnswer: 'Early mornings before work' }
    ]);
}

module.exports = ImprovedFounderTestSystem;
