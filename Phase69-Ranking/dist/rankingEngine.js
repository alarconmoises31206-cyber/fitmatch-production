"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingEngine = void 0;
// Step 69.1: Candidate Pool Assembly
class RankingEngine {
    constructor(clientData, allTrainers, hardFilterRules, weightClasses) {
        this.clientData = clientData;
        this.allTrainers = allTrainers;
        this.hardFilterRules = hardFilterRules;
        this.weightClasses = weightClasses;
    }
    // 69.1 - Assemble trainers eligible for evaluation
    assembleCandidatePool() {
        console.log('Step 69.1: Assembling candidate pool...');
        const eligibleTrainers = this.allTrainers.filter(trainer => {
            // Check 1: Trainer has completed questionnaires
            if (!trainer.questionnaireResponses || Object.keys(trainer.questionnaireResponses).length === 0) {
                return false;
            }
            // Check 2: Trainer has active availability
            if (!trainer.availability) {
                return false;
            }
            // Check 3: Trainer has all required responses
            const missingResponses = trainer.requiredResponses?.filter(questionId => !(questionId in trainer.questionnaireResponses));
            if (missingResponses && missingResponses.length > 0) {
                return false;
            }
            return true;
        });
        console.log(`Candidate pool assembled: ${eligibleTrainers.length} eligible trainers out of ${this.allTrainers.length}`);
        return eligibleTrainers;
    }
    // 69.2 - Hard Filter Elimination Pass
    applyHardFilters(candidates) {
        console.log('Step 69.2: Applying hard filters...');
        const passed = [];
        const failed = [];
        for (const trainer of candidates) {
            let hasFailed = false;
            let failureReason = '';
            for (const rule of this.hardFilterRules) {
                if (!this.checkHardFilter(trainer, rule)) {
                    hasFailed = true;
                    failureReason = rule.failureReason;
                    break;
                }
            }
            if (hasFailed) {
                failed.push({ trainer, reason: failureReason });
            }
            else {
                passed.push(trainer);
            }
        }
        console.log(`Hard filters applied: ${passed.length} passed, ${failed.length} failed`);
        return { passed, failed };
    }
    // Helper method for hard filter checking
    checkHardFilter(trainer, rule) {
        const trainerValue = trainer.questionnaireResponses[rule.field];
        switch (rule.operator) {
            case 'equals':
                return trainerValue === rule.value;
            case 'notEquals':
                return trainerValue !== rule.value;
            case 'greaterThan':
                return trainerValue > rule.value;
            case 'lessThan':
                return trainerValue < rule.value;
            case 'contains':
                return Array.isArray(trainerValue)
                    ? trainerValue.includes(rule.value)
                    : String(trainerValue).includes(String(rule.value));
            case 'notContains':
                return Array.isArray(trainerValue)
                    ? !trainerValue.includes(rule.value)
                    : !String(trainerValue).includes(String(rule.value));
            default:
                return true;
        }
    }
    // 69.3 - Per-Trainer Score Calculation
    calculateDeterministicScore(trainer) {
        console.log(`Calculating score for trainer: ${trainer.trainerId}`);
        let primaryScore = 0;
        let secondaryScore = 0;
        let penalties = 0;
        const explanationTokens = [];
        // Get weight classes
        const primaryWeights = this.weightClasses.filter(w => w.type === 'primary');
        const secondaryWeights = this.weightClasses.filter(w => w.type === 'secondary');
        // Calculate primary alignment scores
        for (const weightClass of primaryWeights) {
            for (const questionId of weightClass.questionIds) {
                const score = this.calculateQuestionSimilarity(questionId, trainer);
                if (score !== null) {
                    const weightedScore = score * weightClass.weight;
                    primaryScore += weightedScore;
                    if (weightedScore > 0) {
                        explanationTokens.push(`Strong alignment on primary question: ${questionId}`);
                    }
                }
                else {
                    penalties += 0.1; // Penalty for missing embedding
                    explanationTokens.push(`Missing embedding for primary question: ${questionId}`);
                }
            }
        }
        // Calculate secondary alignment scores
        for (const weightClass of secondaryWeights) {
            for (const questionId of weightClass.questionIds) {
                const score = this.calculateQuestionSimilarity(questionId, trainer);
                if (score !== null) {
                    const weightedScore = score * weightClass.weight;
                    secondaryScore += weightedScore;
                    if (weightedScore > 0) {
                        explanationTokens.push(`Alignment on secondary question: ${questionId}`);
                    }
                }
                else {
                    penalties += 0.05; // Smaller penalty for secondary
                }
            }
        }
        // Apply additional penalties for vague answers
        penalties += this.calculateVaguenessPenalty(trainer);
        const totalScore = primaryScore + secondaryScore - penalties;
        // Calculate confidence based on completeness
        const confidence = this.calculateConfidence(trainer, primaryWeights, secondaryWeights);
        return {
            trainerId: trainer.trainerId,
            totalScore,
            confidence,
            breakdown: {
                primary: primaryScore,
                secondary: secondaryScore,
                penalties
            },
            explanationTokens
        };
    }
    // Calculate cosine similarity between client and trainer embeddings for a question
    calculateQuestionSimilarity(questionId, trainer) {
        const clientEmbedding = this.clientData.questionEmbeddings[questionId];
        const trainerEmbedding = trainer.questionEmbeddings[questionId];
        // If embeddings are disabled or missing, return null
        if (!clientEmbedding || !trainerEmbedding) {
            return null;
        }
        // Validate embeddings have same dimensions
        if (clientEmbedding.length !== trainerEmbedding.length) {
            console.warn(`Embedding dimension mismatch for question ${questionId}`);
            return null;
        }
        // Calculate cosine similarity
        let dotProduct = 0;
        let clientMagnitude = 0;
        let trainerMagnitude = 0;
        for (let i = 0; i < clientEmbedding.length; i++) {
            dotProduct += clientEmbedding[i] * trainerEmbedding[i];
            clientMagnitude += clientEmbedding[i] * clientEmbedding[i];
            trainerMagnitude += trainerEmbedding[i] * trainerEmbedding[i];
        }
        clientMagnitude = Math.sqrt(clientMagnitude);
        trainerMagnitude = Math.sqrt(trainerMagnitude);
        if (clientMagnitude === 0 || trainerMagnitude === 0) {
            return 0;
        }
        const cosineSimilarity = dotProduct / (clientMagnitude * trainerMagnitude);
        // Normalize to 0-1 range (cosine similarity is already -1 to 1, but we want 0 to 1)
        return (cosineSimilarity + 1) / 2;
    }
    // Calculate penalty for vague answers
    calculateVaguenessPenalty(trainer) {
        let penalty = 0;
        // Check for short/vague responses
        for (const [questionId, response] of Object.entries(trainer.questionnaireResponses)) {
            if (typeof response === 'string' && response.trim().length < 10) {
                penalty += 0.05;
            }
            // Add more vagueness checks as needed
        }
        return penalty;
    }
    // Calculate confidence based on data completeness
    calculateConfidence(trainer, primaryWeights, secondaryWeights) {
        let totalQuestions = 0;
        let answeredQuestions = 0;
        // Count primary questions
        for (const weightClass of primaryWeights) {
            for (const questionId of weightClass.questionIds) {
                totalQuestions++;
                if (questionId in trainer.questionEmbeddings &&
                    this.clientData.questionEmbeddings[questionId]) {
                    answeredQuestions++;
                }
            }
        }
        // Count secondary questions
        for (const weightClass of secondaryWeights) {
            for (const questionId of weightClass.questionIds) {
                totalQuestions++;
                if (questionId in trainer.questionEmbeddings &&
                    this.clientData.questionEmbeddings[questionId]) {
                    answeredQuestions++;
                }
            }
        }
        if (totalQuestions === 0)
            return 0;
        return answeredQuestions / totalQuestions;
    }
    // 69.4 - Stable Ranking Sort
    sortTrainersByScore(scores) {
        console.log('Step 69.4: Performing stable ranking sort...');
        return scores.sort((a, b) => {
            // Primary: totalScore (descending)
            if (b.totalScore !== a.totalScore) {
                return b.totalScore - a.totalScore;
            }
            // Secondary: confidence (descending)
            if (b.confidence !== a.confidence) {
                return b.confidence - a.confidence;
            }
            // Tertiary: trainerId (lexicographic - stability)
            return a.trainerId.localeCompare(b.trainerId);
        });
    }
    // 69.5 - Explainability Preservation
    generateExplanation(trainerScore, nextTrainerScore, hardFilterPassed) {
        const explanations = [];
        // Add hard filter confirmation
        explanations.push(`Hard filters: ${hardFilterPassed ? 'PASSED' : 'FAILED'}`);
        // Add score breakdown explanation
        if (trainerScore.breakdown.primary > 0) {
            explanations.push(`Primary alignment score: ${trainerScore.breakdown.primary.toFixed(2)}`);
        }
        if (trainerScore.breakdown.secondary > 0) {
            explanations.push(`Secondary alignment score: ${trainerScore.breakdown.secondary.toFixed(2)}`);
        }
        if (trainerScore.breakdown.penalties > 0) {
            explanations.push(`Applied penalties: ${trainerScore.breakdown.penalties.toFixed(2)}`);
        }
        // Add comparison explanation if there's a next trainer
        if (nextTrainerScore) {
            const primaryDiff = trainerScore.breakdown.primary - nextTrainerScore.breakdown.primary;
            const secondaryDiff = trainerScore.breakdown.secondary - nextTrainerScore.breakdown.secondary;
            if (primaryDiff > 0) {
                explanations.push(`Higher primary alignment than next trainer by ${primaryDiff.toFixed(2)}`);
            }
            if (secondaryDiff > 0) {
                explanations.push(`Higher secondary alignment than next trainer by ${secondaryDiff.toFixed(2)}`);
            }
            if (primaryDiff <= 0 && secondaryDiff <= 0 && trainerScore.totalScore > nextTrainerScore.totalScore) {
                explanations.push('Ranked higher due to lower penalties');
            }
        }
        // Add custom explanation tokens from score calculation
        explanations.push(...trainerScore.explanationTokens.slice(0, 3)); // Limit to top 3
        return explanations;
    }
    // 69.6 - Failure Mode Handling
    handleFailureModes(viableTrainers, scores) {
        console.log('Step 69.6: Handling failure modes...');
        const rankedTrainers = [];
        // If no viable trainers, return empty
        if (viableTrainers.length === 0) {
            console.log('No viable trainers found');
            return {
                rankedTrainers: [],
                metadata: {
                    filteredCount: 0,
                    rankedCount: 0,
                    confidenceLevel: 'low',
                    reason: 'No trainers passed hard filters'
                }
            };
        }
        // Sort the scores
        const sortedScores = this.sortTrainersByScore(scores);
        // Convert to RankedTrainer format with explanations
        for (let i = 0; i < sortedScores.length; i++) {
            const currentScore = sortedScores[i];
            const nextScore = i < sortedScores.length - 1 ? sortedScores[i + 1] : null;
            const explanation = this.generateExplanation(currentScore, nextScore, true);
            // Label low confidence matches
            if (currentScore.confidence < 0.5) {
                explanation.push('Low confidence match: Missing response data');
            }
            rankedTrainers.push({
                trainerId: currentScore.trainerId,
                totalScore: currentScore.totalScore,
                confidence: currentScore.confidence,
                breakdown: currentScore.breakdown,
                hardFilterStatus: 'PASSED',
                explanation
            });
        }
        // Determine confidence level
        let confidenceLevel = 'medium';
        if (rankedTrainers.length > 0) {
            const avgConfidence = rankedTrainers.reduce((sum, t) => sum + t.confidence, 0) / rankedTrainers.length;
            if (avgConfidence > 0.7)
                confidenceLevel = 'high';
            else if (avgConfidence < 0.3)
                confidenceLevel = 'low';
        }
        else {
            confidenceLevel = 'low';
        }
        return {
            rankedTrainers,
            metadata: {
                filteredCount: this.allTrainers.length - viableTrainers.length,
                rankedCount: rankedTrainers.length,
                confidenceLevel
            }
        };
    }
    // Complete ranking method
    rankTrainers() {
        console.log('Starting Phase 69 Ranking Process...');
        // Step 69.1: Assemble candidate pool
        const candidates = this.assembleCandidatePool();
        // Step 69.2: Apply hard filters
        const { passed: viableTrainers } = this.applyHardFilters(candidates);
        // Step 69.3: Calculate scores for viable trainers
        const scores = [];
        for (const trainer of viableTrainers) {
            const score = this.calculateDeterministicScore(trainer);
            scores.push(score);
        }
        // Steps 69.4-69.6: Sort, explain, and handle failures
        return this.handleFailureModes(viableTrainers, scores);
    }
}
exports.RankingEngine = RankingEngine;
//# sourceMappingURL=rankingEngine.js.map