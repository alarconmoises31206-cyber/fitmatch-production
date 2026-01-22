// PHASE 73 SUCCESS CRITERIA EVALUATOR
// Evaluates whether Phase 73 passes based on founder validation

const fs = require('fs');
const path = require('path');

class Phase73SuccessEvaluator {
    constructor(sessionsPath = './sessions/classified') {
        this.sessionsPath = sessionsPath;
        this.successCriteria = {
            fairnessThreshold: 0.8, // 80% of scenarios must feel fair/explainable
            maxUnexplainedRankings: 0,
            maxConfidenceContradictions: 0,
            requireNoFalseRed: true // All 🔴 must be real logic violations
        };
    }
    
    loadAllSessions() {
        if (!fs.existsSync(this.sessionsPath)) {
            console.log(`❌ Sessions path not found: ${this.sessionsPath}`);
            return [];
        }
        
        const files = fs.readdirSync(this.sessionsPath)
            .filter(file => file.endsWith('.json'))
            .map(file => path.join(this.sessionsPath, file));
        
        const sessions = [];
        files.forEach(file => {
            try {
                const data = fs.readFileSync(file, 'utf8');
                const session = JSON.parse(data);
                sessions.push(session);
            } catch (error) {
                console.log(`❌ Error loading session ${file}: ${error.message}`);
            }
        });
        
        console.log(`📁 Loaded ${sessions.length} completed sessions`);
        return sessions;
    }
    
    evaluateSession(session) {
        const evaluation = {
            sessionId: session.sessionId,
            sessionName: session.sessionName,
            scenario: session.scenarioId,
            timestamp: session.timestamp,
            classifications: session.classifications || [],
            reactions: session.reactions || [],
            
            // Metrics
            classificationCounts: {},
            reactionAnalysis: {},
            passesCriteria: false,
            issues: []
        };
        
        // Count classifications
        const classificationCodes = ['🟢', '🟡', '🟠', '🔴'];
        classificationCodes.forEach(code => {
            evaluation.classificationCounts[code] = 
                (session.classifications || []).filter(c => c.code === code).length;
        });
        
        // Analyze reactions
        const reactionTypes = {};
        (session.reactions || []).forEach(reaction => {
            reactionTypes[reaction.reactionType] = (reactionTypes[reaction.reactionType] || 0) + 1;
            
            // Check for specific reaction patterns
            const verbatim = reaction.verbatim.toLowerCase();
            if (verbatim.includes("don't understand") || verbatim.includes("confusing")) {
                evaluation.reactionAnalysis.hasConfusion = true;
            }
            if (verbatim.includes("feels right") || verbatim.includes("makes sense")) {
                evaluation.reactionAnalysis.hasPositiveReaction = true;
            }
            if (verbatim.includes("trust") && verbatim.includes("even")) {
                evaluation.reactionAnalysis.hasTrustStatement = true;
            }
        });
        
        evaluation.reactionAnalysis.reactionTypes = reactionTypes;
        
        // Evaluate against criteria
        const totalClassifications = Object.values(evaluation.classificationCounts).reduce((a, b) => a + b, 0);
        
        if (totalClassifications > 0) {
            // Criterion 1: ≥80% feel fair or explainable (🟢 or 🟡)
            const fairOrExplainable = evaluation.classificationCounts['🟢'] + evaluation.classificationCounts['🟡'];
            const fairnessPercentage = (fairOrExplainable / totalClassifications) * 100;
            evaluation.fairnessPercentage = fairnessPercentage;
            evaluation.passesFairness = fairnessPercentage >= this.successCriteria.fairnessThreshold * 100;
            
            if (!evaluation.passesFairness) {
                evaluation.issues.push(`Fairness threshold not met: ${fairnessPercentage.toFixed(1)}% (needs ≥80%)`);
            }
            
            // Criterion 2: 0 unexplained rankings
            // Check if there are any reactions indicating unexplained rankings
            if (evaluation.reactionAnalysis.hasConfusion && evaluation.classificationCounts['🔴'] === 0) {
                // Confusion without red classification might indicate unexplained ranking
                evaluation.hasUnexplainedRanking = true;
                evaluation.issues.push("Potential unexplained ranking (confusion without logic violation)");
            } else {
                evaluation.hasUnexplainedRanking = false;
            }
            
            // Criterion 3: 0 confidence contradictions
            // Check reactions that contradict confidence levels
            const confidenceContradictions = (session.reactions || []).filter(r => {
                const verbatim = r.verbatim.toLowerCase();
                return (verbatim.includes("confidence") && 
                       (verbatim.includes("wrong") || verbatim.includes("contradict") || 
                        verbatim.includes("doesn't match") || verbatim.includes("inappropriate")));
            });
            
            evaluation.confidenceContradictions = confidenceContradictions.length;
            evaluation.passesConfidence = confidenceContradictions.length === 0;
            
            if (confidenceContradictions.length > 0) {
                evaluation.issues.push(`Confidence contradictions: ${confidenceContradictions.length}`);
            }
            
            // Criterion 4: All 🔴 must be real logic violations
            // Check red classifications for proper evidence
            const redClassifications = (session.classifications || []).filter(c => c.code === '🔴');
            const invalidReds = redClassifications.filter(c => 
                !c.evidence || c.evidence.length < 10 || c.evidence.toLowerCase().includes("feel")
            );
            
            evaluation.invalidRedClassifications = invalidReds.length;
            evaluation.passesRedValidation = invalidReds.length === 0;
            
            if (invalidReds.length > 0) {
                evaluation.issues.push(`Invalid red classifications: ${invalidReds.length} (missing evidence or based on feeling)`);
            }
            
            // Overall pass/fail
            evaluation.passesCriteria = 
                evaluation.passesFairness &&
                !evaluation.hasUnexplainedRanking &&
                evaluation.passesConfidence &&
                evaluation.passesRedValidation;
            
            // Trust statement check (qualitative)
            evaluation.hasTrustStatement = evaluation.reactionAnalysis.hasTrustStatement || false;
            
            // Phase 73 completion statement
            if (evaluation.passesCriteria && evaluation.hasTrustStatement) {
                evaluation.phase73Complete = true;
                evaluation.completionStatement = "Founder can say: 'I trust this even when I don't like the result.'";
            } else {
                evaluation.phase73Complete = false;
                if (!evaluation.hasTrustStatement) {
                    evaluation.completionStatement = "Missing founder trust statement";
                }
            }
        } else {
            evaluation.issues.push("No classifications recorded");
            evaluation.passesCriteria = false;
            evaluation.phase73Complete = false;
        }
        
        return evaluation;
    }
    
    evaluateAllSessions() {
        const sessions = this.loadAllSessions();
        const evaluations = sessions.map(session => this.evaluateSession(session));
        
        console.log(`\n📊 PHASE 73 COMPREHENSIVE EVALUATION`);
        console.log("=" .repeat(60));
        console.log(`Evaluating ${evaluations.length} sessions...\n`);
        
        // Aggregate results
        const aggregate = {
            totalSessions: evaluations.length,
            passedSessions: evaluations.filter(e => e.passesCriteria).length,
            completedSessions: evaluations.filter(e => e.phase73Complete).length,
            scenarioCategories: new Set(),
            classificationTotals: { '🟢': 0, '🟡': 0, '🟠': 0, '🔴': 0 },
            issuesByType: {},
            recommendations: []
        };
        
        // Process each evaluation
        evaluations.forEach(evaluation => {
            aggregate.scenarioCategories.add(evaluation.scenario);
            
            // Sum classifications
            Object.keys(aggregate.classificationTotals).forEach(code => {
                aggregate.classificationTotals[code] += evaluation.classificationCounts[code] || 0;
            });
            
            // Track issues
            evaluation.issues.forEach(issue => {
                aggregate.issuesByType[issue] = (aggregate.issuesByType[issue] || 0) + 1;
            });
            
            // Generate recommendations for failed sessions
            if (!evaluation.passesCriteria) {
                if (!evaluation.passesFairness) {
                    aggregate.recommendations.push(`Session ${evaluation.sessionId}: Need more 🟢/🟡 classifications`);
                }
                if (evaluation.hasUnexplainedRanking) {
                    aggregate.recommendations.push(`Session ${evaluation.sessionId}: Address unexplained rankings`);
                }
                if (!evaluation.passesConfidence) {
                    aggregate.recommendations.push(`Session ${evaluation.sessionId}: Review confidence contradictions`);
                }
                if (!evaluation.passesRedValidation) {
                    aggregate.recommendations.push(`Session ${evaluation.sessionId}: Validate 🔴 classifications`);
                }
            }
        });
        
        // Calculate overall metrics
        const totalClassifications = Object.values(aggregate.classificationTotals).reduce((a, b) => a + b, 0);
        if (totalClassifications > 0) {
            const greenYellow = aggregate.classificationTotals['🟢'] + aggregate.classificationTotals['🟡'];
            aggregate.fairnessPercentage = (greenYellow / totalClassifications) * 100;
        } else {
            aggregate.fairnessPercentage = 0;
        }
        
        aggregate.passRate = (aggregate.passedSessions / aggregate.totalSessions) * 100;
        aggregate.completionRate = (aggregate.completedSessions / aggregate.totalSessions) * 100;
        
        // Determine Phase 73 outcome
        aggregate.phase73Outcome = this.determinePhaseOutcome(aggregate);
        
        // Generate report
        const report = this.generateEvaluationReport(aggregate, evaluations);
        
        return {
            aggregate,
            evaluations,
            report
        };
    }
    
    determinePhaseOutcome(aggregate) {
        const outcomes = [];
        
        if (aggregate.fairnessPercentage >= 80) {
            outcomes.push("✅ Fairness threshold met");
        } else {
            outcomes.push(`❌ Fairness threshold not met: ${aggregate.fairnessPercentage.toFixed(1)}%`);
        }
        
        if (aggregate.passRate >= 80) {
            outcomes.push("✅ Session pass rate acceptable");
        } else {
            outcomes.push(`❌ Session pass rate low: ${aggregate.passRate.toFixed(1)}%`);
        }
        
        if (aggregate.completionRate >= 80) {
            outcomes.push("✅ Completion rate acceptable");
        } else {
            outcomes.push(`❌ Completion rate low: ${aggregate.completionRate.toFixed(1)}%`);
        }
        
        // Check for logic violations
        if (aggregate.classificationTotals['🔴'] > 0) {
            outcomes.push(`⚠️  Logic violations found: ${aggregate.classificationTotals['🔴']}`);
        } else {
            outcomes.push("✅ No logic violations found");
        }
        
        // Determine next phase
        if (aggregate.fairnessPercentage >= 80 && 
            aggregate.passRate >= 80 && 
            aggregate.completionRate >= 80 &&
            aggregate.classificationTotals['🔴'] === 0) {
            
            if (aggregate.classificationTotals['🟡'] > 0) {
                return {
                    nextPhase: "Phase 73.5 - Language Refinement",
                    status: "Partial Success",
                    outcomes,
                    recommendation: "Proceed with explanation language refinement"
                };
            } else if (aggregate.classificationTotals['🟠'] > 0) {
                return {
                    nextPhase: "Phase 74 - Signal Expansion",
                    status: "Partial Success",
                    outcomes,
                    recommendation: "Proceed with additional signal collection"
                };
            } else {
                return {
                    nextPhase: "Phase 74 - UI Work & Scaling",
                    status: "Full Success",
                    outcomes,
                    recommendation: "Green light for UI development and scaling"
                };
            }
        } else if (aggregate.classificationTotals['🔴'] > 0) {
            return {
                nextPhase: "Surgical Engine Correction",
                status: "Logic Defects Found",
                outcomes,
                recommendation: "Address logic violations before proceeding"
            };
        } else {
            return {
                nextPhase: "Additional Validation Needed",
                status: "Incomplete",
                outcomes,
                recommendation: "Run more founder sessions or refine testing approach"
            };
        }
    }
    
    generateEvaluationReport(aggregate, evaluations) {
        const timestamp = new Date().toISOString();
        const reportId = `phase73_eval_${Date.now()}`;
        
        const report = {
            reportId,
            timestamp,
            summary: {
                totalSessions: aggregate.totalSessions,
                passedSessions: aggregate.passedSessions,
                passRate: `${aggregate.passRate.toFixed(1)}%`,
                completedSessions: aggregate.completedSessions,
                completionRate: `${aggregate.completionRate.toFixed(1)}%`,
                fairnessPercentage: `${aggregate.fairnessPercentage.toFixed(1)}%`,
                classificationBreakdown: aggregate.classificationTotals,
                scenarioCategories: Array.from(aggregate.scenarioCategories)
            },
            
            phaseOutcome: aggregate.phase73Outcome,
            
            sessionDetails: evaluations.map(eval => ({
                sessionId: eval.sessionId,
                scenario: eval.scenario,
                passesCriteria: eval.passesCriteria,
                phase73Complete: eval.phase73Complete,
                fairnessPercentage: eval.fairnessPercentage,
                issues: eval.issues,
                hasTrustStatement: eval.hasTrustStatement
            })),
            
            issuesSummary: aggregate.issuesByType,
            recommendations: aggregate.recommendations,
            
            successCriteria: this.successCriteria,
            evaluationTimestamp: timestamp
        };
        
        // Save report
        const reportPath = path.join(path.dirname(this.sessionsPath), '..', 'reports', `${reportId}.json`);
        const reportDir = path.dirname(reportPath);
        
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        
        fs.writeFileSync(
            reportPath,
            JSON.stringify(report, null, 2),
            'utf8'
        );
        
        // Generate readable text report
        const textReport = this.generateTextReport(report);
        const textReportPath = path.join(reportDir, `${reportId}.txt`);
        fs.writeFileSync(textReportPath, textReport, 'utf8');
        
        console.log(`📄 Evaluation report saved: ${reportPath}`);
        console.log(`📝 Text report: ${textReportPath}`);
        
        return {
            json: reportPath,
            text: textReportPath,
            data: report
        };
    }
    
    generateTextReport(report) {
        let text = `PHASE 73 COMPREHENSIVE EVALUATION REPORT\n`;
        text += `=${'='.repeat(60)}\n\n`;
        
        text += `Report ID: ${report.reportId}\n`;
        text += `Generated: ${new Date(report.timestamp).toLocaleString()}\n\n`;
        
        text += `EXECUTIVE SUMMARY\n`;
        text += `${'-'.repeat(30)}\n`;
        text += `Total Sessions: ${report.summary.totalSessions}\n`;
        text += `Passed Sessions: ${report.summary.passedSessions} (${report.summary.passRate})\n`;
        text += `Completed Sessions: ${report.summary.completedSessions} (${report.summary.completionRate})\n`;
        text += `Fairness Percentage: ${report.summary.fairnessPercentage}\n\n`;
        
        text += `CLASSIFICATION BREAKDOWN\n`;
        text += `${'-'.repeat(30)}\n`;
        Object.entries(report.summary.classificationBreakdown).forEach(([code, count]) => {
            const codeNames = {
                '🟢': 'Confirmed Correct',
                '🟡': 'Language/Framing',
                '🟠': 'Missing Signal',
                '🔴': 'Logic Violation'
            };
            text += `${code} ${codeNames[code] || code}: ${count}\n`;
        });
        
        text += `\nPHASE OUTCOME\n`;
        text += `${'-'.repeat(30)}\n`;
        text += `Status: ${report.phaseOutcome.status}\n`;
        text += `Next Phase: ${report.phaseOutcome.nextPhase}\n`;
        text += `Recommendation: ${report.phaseOutcome.recommendation}\n\n`;
        
        text += `OUTCOME DETAILS:\n`;
        report.phaseOutcome.outcomes.forEach(outcome => {
            text += `  ${outcome}\n`;
        });
        
        if (Object.keys(report.issuesSummary).length > 0) {
            text += `\nISSUES SUMMARY\n`;
            text += `${'-'.repeat(30)}\n`;
            Object.entries(report.issuesSummary).forEach(([issue, count]) => {
                text += `${count}x ${issue}\n`;
            });
        }
        
        if (report.recommendations.length > 0) {
            text += `\nRECOMMENDATIONS\n`;
            text += `${'-'.repeat(30)}\n`;
            report.recommendations.forEach(rec => {
                text += `• ${rec}\n`;
            });
        }
        
        text += `\nSUCCESS CRITERIA\n`;
        text += `${'-'.repeat(30)}\n`;
        text += `Fairness Threshold: ≥${this.successCriteria.fairnessThreshold * 100}%\n`;
        text += `Max Unexplained Rankings: ${this.successCriteria.maxUnexplainedRankings}\n`;
        text += `Max Confidence Contradictions: ${this.successCriteria.maxConfidenceContradictions}\n`;
        text += `Require No False Red: ${this.successCriteria.requireNoFalseRed}\n`;
        
        text += `\nSCENARIO CATEGORIES TESTED:\n`;
        text += `${'-'.repeat(30)}\n`;
        report.summary.scenarioCategories.forEach(category => {
            text += `• ${category}\n`;
        });
        
        text += `\n${'='.repeat(62)}\n`;
        text += `PHASE 73 - FOUNDER BEHAVIORAL VALIDATION\n`;
        text += `="${'='.repeat(62)}\n`;
        
        return text;
    }
    
    printQuickSummary() {
        const result = this.evaluateAllSessions();
        
        console.log("\n📈 QUICK SUMMARY:");
        console.log(`${'-'.repeat(40)}`);
        console.log(`Sessions: ${result.aggregate.totalSessions}`);
        console.log(`Pass Rate: ${result.aggregate.passRate.toFixed(1)}%`);
        console.log(`Fairness: ${result.aggregate.fairnessPercentage.toFixed(1)}%`);
        console.log(`Completion: ${result.aggregate.completionRate.toFixed(1)}%`);
        
        console.log("\n🏷️  Classifications:");
        Object.entries(result.aggregate.classificationTotals).forEach(([code, count]) => {
            const codeNames = {
                '🟢': 'Correct',
                '🟡': 'Language',
                '🟠': 'Signal',
                '🔴': 'Logic'
            };
            console.log(`  ${code} ${codeNames[code]}: ${count}`);
        });
        
        console.log("\n🎯 PHASE OUTCOME:");
        console.log(`  ${result.aggregate.phase73Outcome.status}`);
        console.log(`  Next: ${result.aggregate.phase73Outcome.nextPhase}`);
        console.log(`  ${result.aggregate.phase73Outcome.recommendation}`);
        
        return result;
    }
}

// Demo
if (require.main === module) {
    console.log("PHASE 73 SUCCESS EVALUATOR\n");
    
    const evaluator = new Phase73SuccessEvaluator();
    
    console.log("Success Criteria:");
    console.log(`  • Fairness threshold: ≥${evaluator.successCriteria.fairnessThreshold * 100}%`);
    console.log(`  • Max unexplained rankings: ${evaluator.successCriteria.maxUnexplainedRankings}`);
    console.log(`  • Max confidence contradictions: ${evaluator.successCriteria.maxConfidenceContradictions}`);
    console.log(`  • No false red classifications: ${evaluator.successCriteria.requireNoFalseRed}`);
    
    console.log("\nTo evaluate sessions:");
    console.log("  const result = evaluator.evaluateAllSessions();");
    console.log("  const summary = evaluator.printQuickSummary();");
    
    console.log("\n📊 System ready for Phase 73 evaluation.");
}

module.exports = Phase73SuccessEvaluator;
