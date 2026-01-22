// PHASE 73 - COMPLETE TESTING SYSTEM
// Implements all 5 scenario categories per Phase 73 specification

class Phase73TestingSystem {
    constructor() {
        this.sessionCount = 0;
        this.scenarios = [];
        this.results = [];
        this.initializeScenarios();
    }
    
    initializeScenarios() {
        console.log("🚀 PHASE 73 - FOUNDER BEHAVIORAL VALIDATION");
        console.log("===========================================\n");
        console.log("Purpose: Validate felt correctness without changing engine");
        console.log("Method: Observation-only, read-only truth discovery\n");
        
        // 5 Scenario Categories per Phase 73 spec
        this.scenarios = [
            // 1️⃣ Obvious Match - "This should clearly work."
            {
                id: "obvious_match_1",
                category: "Obvious Match",
                description: "Weight loss client with cardio-focused trainer",
                client: {
                    userId: "client_obvious_weight_loss",
                    answers: [
                        { questionId: "q1", answer: "Lose 20 pounds, improve cardiovascular health" },
                        { questionId: "q2", answer: "Consistent weekday evenings" },
                        { questionId: "q3", answer: "Beginner, needs gradual progress" },
                        { questionId: "q4", answer: "Clear explanations preferred" },
                        { questionId: "q5", answer: "Weekly check-ins" },
                        { questionId: "q6", answer: "Supportive, encouraging style" }
                    ]
                },
                trainers: [
                    {
                        userId: "trainer_cardio_specialist",
                        answers: [
                            { questionId: "q1", answer: "Weight loss through cardio and nutrition" },
                            { questionId: "q2", answer: "Evening availability" },
                            { questionId: "q3", answer: "Beginner friendly approach" },
                            { questionId: "q4", answer: "Detailed exercise explanations" },
                            { questionId: "q5", answer: "Weekly progress tracking" },
                            { questionId: "q6", answer: "Motivational, patient coaching" }
                        ]
                    },
                    {
                        userId: "trainer_strength_only",
                        answers: [
                            { questionId: "q1", answer: "Powerlifting and strength only" },
                            { questionId: "q2", answer: "Morning sessions" },
                            { questionId: "q3", answer: "Advanced athletes" },
                            { questionId: "q4", answer: "Minimal instruction" },
                            { questionId: "q5", answer: "Monthly assessments" },
                            { questionId: "q6", answer: "Tough, demanding approach" }
                        ]
                    }
                ],
                validationQuestions: [
                    "Is the top match unsurprising?",
                    "Does the explanation say the obvious thing?",
                    "Does confidence feel appropriately high?"
                ]
            },
            
            // 2️⃣ Acceptable but Not Ideal - "This works, but it's not exciting."
            {
                id: "acceptable_not_ideal_1",
                category: "Acceptable but Not Ideal",
                description: "Client with vague goals matches with generalist trainer",
                client: {
                    userId: "client_vague_goals",
                    answers: [
                        { questionId: "q1", answer: "Get in better shape, more energy" },
                        { questionId: "q2", answer: "Whenever available" },
                        { questionId: "q3", answer: "Some experience but inconsistent" },
                        { questionId: "q4", answer: "Not sure what I need" },
                        { questionId: "q5", answer: "Maybe monthly check-ins" },
                        { questionId: "q6", answer: "Something not too intense" }
                    ]
                },
                trainers: [
                    {
                        userId: "trainer_generalist",
                        answers: [
                            { questionId: "q1", answer: "General fitness improvement" },
                            { questionId: "q2", answer: "Flexible scheduling" },
                            { questionId: "q3", answer: "All experience levels" },
                            { questionId: "q4", answer: "Adapts to client needs" },
                            { questionId: "q5", answer: "Adjusts based on preference" },
                            { questionId: "q6", answer: "Moderate intensity" }
                        ]
                    },
                    {
                        userId: "trainer_specialized",
                        answers: [
                            { questionId: "q1", answer: "Marathon training specialist" },
                            { questionId: "q2", answer: "Strict morning schedule" },
                            { questionId: "q3", answer: "Dedicated runners only" },
                            { questionId: "q4", answer: "Technical running form" },
                            { questionId: "q5", answer: "Detailed running metrics" },
                            { questionId: "q6", answer: "High intensity training" }
                        ]
                    }
                ],
                validationQuestions: [
                    "Does the system avoid overselling?",
                    "Is disappointment calm, not confusing?",
                    "Does the explanation avoid comparison language?"
                ]
            },
            
            // 3️⃣ Confusing but Technically Correct - "I didn't expect this, but I can see why."
            {
                id: "confusing_but_correct_1",
                category: "Confusing but Technically Correct",
                description: "Strength-focused client matches with holistic trainer due to shared values",
                client: {
                    userId: "client_strength_focus",
                    answers: [
                        { questionId: "q1", answer: "Build maximum strength" },
                        { questionId: "q2", answer: "Early mornings" },
                        { questionId: "q3", answer: "Intermediate, wants to push" },
                        { questionId: "q4", answer: "Direct, clear instructions" },
                        { questionId: "q5", answer: "Strength progress tracking" },
                        { questionId: "q6", answer: "Challenging but fair feedback" }
                    ]
                },
                trainers: [
                    {
                        userId: "trainer_holistic_strength",
                        answers: [
                            { questionId: "q1", answer: "Functional strength for life" },
                            { questionId: "q2", answer: "Morning availability" },
                            { questionId: "q3", answer: "Intermediate to advanced" },
                            { questionId: "q4", answer: "Clear movement patterns" },
                            { questionId: "q5", answer: "Comprehensive progress tracking" },
                            { questionId: "q6", answer: "Constructive, honest feedback" }
                        ]
                    },
                    {
                        userId: "trainer_powerlifter",
                        answers: [
                            { questionId: "q1", answer: "Maximize powerlifting totals" },
                            { questionId: "q2", answer: "Weekends only" },
                            { questionId: "q3", answer: "Competitive powerlifters" },
                            { questionId: "q4", answer: "Technical lift breakdowns" },
                            { questionId: "q5", answer: "1RM testing monthly" },
                            { questionId: "q6", answer: "Extremely demanding" }
                        ]
                    }
                ],
                validationQuestions: [
                    "Can the explanation resolve confusion?",
                    "Does trust increase after reading?",
                    "Does it feel honest rather than defensive?"
                ]
            },
            
            // 4️⃣ Hard Rejection - "This should not match."
            {
                id: "hard_rejection_1",
                category: "Hard Rejection",
                description: "Beginner client with injury history and advanced competition trainer",
                client: {
                    userId: "client_injury_beginner",
                    answers: [
                        { questionId: "q1", answer: "Gentle movement, avoid re-injury" },
                        { questionId: "q2", answer: "Afternoons only" },
                        { questionId: "q3", answer: "Beginner, previous knee injury" },
                        { questionId: "q4", answer: "Need careful modifications" },
                        { questionId: "q5", answer: "Frequent check-ins for safety" },
                        { questionId: "q6", answer: "Very gentle, cautious approach" }
                    ]
                },
                trainers: [
                    {
                        userId: "trainer_competition",
                        answers: [
                            { questionId: "q1", answer: "Competition preparation" },
                            { questionId: "q2", answer: "Morning training only" },
                            { questionId: "q3", answer: "Advanced competitors only" },
                            { questionId: "q4", answer: "Push through limits" },
                            { questionId: "q5", answer: "Competition results focused" },
                            { questionId: "q6", answer: "Aggressive, demanding style" }
                        ]
                    },
                    {
                        userId: "trainer_rehab_specialist",
                        answers: [
                            { questionId: "q1", answer: "Injury rehabilitation" },
                            { questionId: "q2", answer: "Afternoon sessions" },
                            { questionId: "q3", answer: "All levels, injury experience" },
                            { questionId: "q4", answer: "Safe movement patterns" },
                            { questionId: "q5", answer: "Safety monitoring" },
                            { questionId: "q6", answer: "Patient, safety-first approach" }
                        ]
                    }
                ],
                validationQuestions: [
                    "Is the rejection clear and non-judgmental?",
                    "Does the system avoid implying fault?",
                    "Are next steps suggested correctly?"
                ]
            },
            
            // 5️⃣ Edge / Degenerate Case - Missing answers, vague text, low data
            {
                id: "edge_case_1",
                category: "Edge / Degenerate Case",
                description: "Client with minimal, vague answers and incomplete information",
                client: {
                    userId: "client_minimal_info",
                    answers: [
                        { questionId: "q1", answer: "Exercise" },
                        { questionId: "q2", answer: "" },
                        { questionId: "q3", answer: "Maybe beginner" },
                        { questionId: "q4", answer: "Not sure" },
                        { questionId: "q5", answer: "" },
                        { questionId: "q6", answer: "OK" }
                    ]
                },
                trainers: [
                    {
                        userId: "trainer_requires_clarity",
                        answers: [
                            { questionId: "q1", answer: "Specific goal setting required" },
                            { questionId: "q2", answer: "Set schedule needed" },
                            { questionId: "q3", answer: "Clear experience level" },
                            { questionId: "q4", answer: "Defined learning style" },
                            { questionId: "q5", answer: "Structured tracking" },
                            { questionId: "q6", answer: "Direct communication" }
                        ]
                    },
                    {
                        userId: "trainer_flexible_approach",
                        answers: [
                            { questionId: "q1", answer: "Discover goals together" },
                            { questionId: "q2", answer: "Flexible scheduling" },
                            { questionId: "q3", answer: "All levels welcome" },
                            { questionId: "q4", answer: "Adaptive teaching" },
                            { questionId: "q5", answer: "Casual check-ins" },
                            { questionId: "q6", answer: "Easygoing style" }
                        ]
                    }
                ],
                validationQuestions: [
                    "Does the system admit uncertainty?",
                    "Does confidence drop appropriately?",
                    "Does it avoid hallucinated certainty?"
                ]
            }
        ];
        
        console.log(`📋 Loaded ${this.scenarios.length} scenario categories:`);
        this.scenarios.forEach((scenario, index) => {
            console.log(`  ${index + 1}. ${scenario.category}: ${scenario.description}`);
        });
        console.log("");
    }
    
    // Core matching logic (deterministic, from Phase 72 verification)
    generateEmbedding(text) {
        if (!text || text.trim().length === 0) {
            return [0.1, 0.1, 0.1, 0.1];
        }
        
        const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return [
            0.5 + Math.sin(hash * 0.1) * 0.3,
            0.5 + Math.cos(hash * 0.2) * 0.3,
            0.5 + Math.sin(hash * 0.3) * 0.3,
            0.5 + Math.cos(hash * 0.4) * 0.3
        ];
    }
    
    cosineSimilarity(vecA, vecB) {
        let dot = 0, magA = 0, magB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dot += vecA[i] * vecB[i];
            magA += vecA[i] * vecA[i];
            magB += vecB[i] * vecB[i];
        }
        const similarity = magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
        return (similarity + 1) / 2; // Normalize to 0-1
    }
    
    checkHardFilters(client, trainer) {
        const issues = [];
        
        // Empty answer handling
        const clientAnswers = client.answers.filter(a => a.answer && a.answer.trim()).length;
        const trainerAnswers = trainer.answers.filter(a => a.answer && a.answer.trim()).length;
        
        if (clientAnswers < 3) {
            issues.push("Client has insufficient information");
        }
        
        if (trainerAnswers < 4) {
            issues.push("Trainer profile incomplete");
        }
        
        // Experience mismatch (hard filter example)
        const clientExp = client.answers.find(a => a.questionId === 'q3')?.answer || '';
        const trainerExp = trainer.answers.find(a => a.questionId === 'q3')?.answer || '';
        
        if (clientExp.includes('beginner') && trainerExp.includes('advanced only')) {
            issues.push("Experience level mismatch: beginner client, advanced-only trainer");
        }
        
        // Injury vs competition mismatch
        if (clientExp.includes('injury') && trainerExp.includes('competition')) {
            issues.push("Safety concern: injury history with competition-focused trainer");
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
                filtered: true,
                filterIssues: filterCheck.issues,
                score: 0,
                confidence: 'Filtered',
                explanation: {
                    summary: `Not available: ${filterCheck.issues.join(', ')}`,
                    note: "Hard constraints prevent matching"
                }
            };
        }
        
        // Calculate similarity
        let totalScore = 0;
        let comparisons = 0;
        
        client.answers.forEach(clientAnswer => {
            const trainerAnswer = trainer.answers.find(a => a.questionId === clientAnswer.questionId);
            if (trainerAnswer && clientAnswer.answer && clientAnswer.answer.trim()) {
                const clientEmbed = this.generateEmbedding(clientAnswer.answer);
                const trainerEmbed = this.generateEmbedding(trainerAnswer.answer);
                const similarity = this.cosineSimilarity(clientEmbed, trainerEmbed);
                totalScore += similarity;
                comparisons++;
            }
        });
        
        const avgSimilarity = comparisons > 0 ? totalScore / comparisons : 0;
        const score = Math.round(avgSimilarity * 100);
        
        // Determine confidence based on data quality and score
        let confidence = 'Medium';
        let confidenceReasons = [];
        
        if (score >= 80) {
            confidence = 'High';
            confidenceReasons.push("Strong alignment across multiple factors");
        } else if (score <= 30) {
            confidence = 'Low';
            confidenceReasons.push("Limited alignment or significant differences");
        }
        
        // Adjust for data quality
        const clientDataQuality = client.answers.filter(a => a.answer && a.answer.trim().length > 5).length / 6;
        if (clientDataQuality < 0.5) {
            confidence = 'Low';
            confidenceReasons.push("Limited client information available");
        }
        
        // Generate explanation
        const explanation = this.generateExplanation(client, trainer, score, confidence, confidenceReasons);
        
        return {
            trainerId: trainer.userId,
            filtered: false,
            score,
            confidence,
            confidenceReasons,
            explanation,
            dataQuality: clientDataQuality
        };
    }
    
    generateExplanation(client, trainer, score, confidence, confidenceReasons) {
        const explanations = [];
        
        // Find strongest matching question
        let bestMatch = { score: 0, questionId: '' };
        client.answers.forEach(clientAnswer => {
            const trainerAnswer = trainer.answers.find(a => a.questionId === clientAnswer.questionId);
            if (trainerAnswer && clientAnswer.answer && clientAnswer.answer.trim()) {
                const clientEmbed = this.generateEmbedding(clientAnswer.answer);
                const trainerEmbed = this.generateEmbedding(trainerAnswer.answer);
                const similarity = this.cosineSimilarity(clientEmbed, trainerEmbed);
                if (similarity > bestMatch.score) {
                    bestMatch = { score: similarity, questionId: clientAnswer.questionId };
                }
            }
        });
        
        // Add explanation based on best match
        if (bestMatch.score > 0.7) {
            const questionMap = {
                'q1': 'fitness goals',
                'q2': 'schedule availability',
                'q3': 'experience level',
                'q4': 'learning style',
                'q5': 'progress tracking',
                'q6': 'coaching approach'
            };
            explanations.push(`Aligns on ${questionMap[bestMatch.questionId] || 'key factors'}`);
        }
        
        // Add data quality note if low
        const clientDataQuality = client.answers.filter(a => a.answer && a.answer.trim().length > 5).length / 6;
        if (clientDataQuality < 0.5) {
            explanations.push("Based on limited information provided");
        }
        
        // Add confidence explanation
        if (confidence === 'Low' && score > 50) {
            explanations.push("Match has potential but more information would help");
        }
        
        return {
            summary: `${trainer.userId}: ${confidence} confidence (${score}/100)`,
            details: explanations,
            confidence,
            score,
            note: confidence === 'High' ? 'Strong match' :
                  confidence === 'Medium' ? 'Moderate match' :
                  'Limited match - consider providing more information'
        };
    }
    
    runScenario(scenarioId) {
        const scenario = this.scenarios.find(s => s.id === scenarioId);
        if (!scenario) {
            console.log(`❌ Scenario ${scenarioId} not found`);
            return null;
        }
        
        this.sessionCount++;
        console.log(`\n🎬 SESSION ${this.sessionCount}: ${scenario.category.toUpperCase()}`);
        console.log("=" .repeat(60));
        console.log(`📝 ${scenario.description}\n`);
        
        console.log("👤 CLIENT PROFILE:");
        scenario.client.answers.forEach((answer, index) => {
            console.log(`  ${answer.questionId}: ${answer.answer || "(empty)"}`);
        });
        
        console.log("\n🤼 TRAINERS BEING CONSIDERED:");
        scenario.trainers.forEach(trainer => {
            console.log(`  • ${trainer.userId}`);
        });
        
        console.log("\n" + "=" .repeat(60));
        console.log("🧮 MATCHING RESULTS:\n");
        
        // Calculate matches
        const results = scenario.trainers.map(trainer => 
            this.calculateMatch(scenario.client, trainer)
        );
        
        // Separate filtered and ranked
        const filtered = results.filter(r => r.filtered);
        const ranked = results.filter(r => !r.filtered)
            .sort((a, b) => b.score - a.score);
        
        // Display filtered
        if (filtered.length > 0) {
            console.log("🚫 FILTERED OUT:");
            filtered.forEach(trainer => {
                console.log(`\n  ${trainer.trainerId}`);
                trainer.filterIssues.forEach(issue => {
                    console.log(`    ❌ ${issue}`);
                });
                console.log(`    ${trainer.explanation.note}`);
            });
            console.log("");
        }
        
        // Display ranked
        if (ranked.length > 0) {
            console.log("🏆 AVAILABLE MATCHES:");
            ranked.forEach((trainer, index) => {
                console.log(`\n${index + 1}. ${trainer.trainerId}`);
                console.log(`   Score: ${trainer.score}/100`);
                console.log(`   Confidence: ${trainer.confidence}`);
                if (trainer.confidenceReasons.length > 0) {
                    console.log(`   Confidence reasons: ${trainer.confidenceReasons.join(', ')}`);
                }
                console.log(`   ${trainer.explanation.summary}`);
                if (trainer.explanation.details.length > 0) {
                    console.log(`   Explanation:`);
                    trainer.explanation.details.forEach(detail => {
                        console.log(`     • ${detail}`);
                    });
                }
                console.log(`   Note: ${trainer.explanation.note}`);
            });
        } else {
            console.log("📭 No available matches after filtering");
        }
        
        console.log("\n" + "=" .repeat(60));
        console.log("🎯 VALIDATION QUESTIONS:");
        scenario.validationQuestions.forEach((question, index) => {
            console.log(`  ${index + 1}. ${question}`);
        });
        
        console.log("\n🔍 FOUNDER OBSERVATION REQUIRED:");
        console.log("   Capture verbatim reaction");
        console.log("   Classify any issues (🟡🟠🔴🟢)");
        
        const result = {
            sessionId: this.sessionCount,
            scenario: scenario,
            timestamp: new Date().toISOString(),
            results: {
                filtered,
                ranked
            },
            validationQuestions: scenario.validationQuestions
        };
        
        this.results.push(result);
        return result;
    }
    
    runAllScenarios() {
        console.log("🏃 RUNNING ALL 5 SCENARIO CATEGORIES");
        console.log("=" .repeat(60));
        
        const allResults = [];
        this.scenarios.forEach(scenario => {
            const result = this.runScenario(scenario.id);
            if (result) {
                allResults.push(result);
                console.log("\n" + "═" .repeat(60) + "\n");
            }
        });
        
        return allResults;
    }
    
    generateSessionReport() {
        console.log("\n📊 PHASE 73 SESSION SUMMARY");
        console.log("=" .repeat(60));
        
        console.log(`\nSessions completed: ${this.sessionCount}`);
        console.log(`Scenarios tested: ${this.scenarios.length}`);
        
        let classificationCount = {
            green: 0,
            yellow: 0,
            orange: 0,
            red: 0,
            pending: this.sessionCount
        };
        
        console.log("\n📋 CLASSIFICATION STATUS:");
        console.log("  🟢 Confirmed Correct: -- (awaiting founder)");
        console.log("  🟡 Language/Framing: -- (awaiting founder)");
        console.log("  🟠 Missing Signal: -- (awaiting founder)");
        console.log("  🔴 Logic Violation: -- (awaiting founder)");
        
        console.log("\n🎯 SUCCESS CRITERIA:");
        console.log("  • ≥80% of scenarios feel fair or explainable");
        console.log("  • 0 unexplained rankings");
        console.log("  • 0 confidence contradictions");
        console.log("  • All 🔴 violations are real (not emotional)");
        
        console.log("\n📝 NEXT STEPS:");
        console.log("  1. Founder reviews each scenario output");
        console.log("  2. Captures verbatim reactions");
        console.log("  3. Applies classification tags");
        console.log("  4. Determines Phase 73 outcome");
    }
}

// Export and demo
const system = new Phase73TestingSystem();

if (require.main === module) {
    console.log("PHASE 73 - COMPLETE TESTING SYSTEM DEMONSTRATION\n");
    console.log("Running first scenario as example...\n");
    
    system.runScenario("obvious_match_1");
    
    console.log("\n" + "★" .repeat(60));
    console.log("SYSTEM READY FOR FOUNDER VALIDATION SESSIONS");
    console.log("★" .repeat(60));
    console.log("\nTo run all scenarios: system.runAllScenarios()");
    console.log("To run specific scenario: system.runScenario('scenario_id')");
}

module.exports = Phase73TestingSystem;
