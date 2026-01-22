// PHASE 73 SESSION MANAGER & DOCUMENTATION SYSTEM
// Handles founder sessions, reaction capture, and classification

const fs = require('fs');
const path = require('path');

class Phase73SessionManager {
    constructor(basePath = './sessions') {
        this.basePath = basePath;
        this.currentSession = null;
        this.classificationSystem = {
            '🟢': { code: 'green', name: 'Confirmed Correct', description: 'Behavior aligns with intuition' },
            '🟡': { code: 'yellow', name: 'Language/Framing Issue', description: 'Explanation wording needs refinement' },
            '🟠': { code: 'orange', name: 'Missing Signal', description: 'Need additional input signals' },
            '🔴': { code: 'red', name: 'Logic Violation', description: 'Engine-level defect found' }
        };
        
        // Ensure directories exist
        this.ensureDirectories();
    }
    
    ensureDirectories() {
        const dirs = [
            this.basePath,
            path.join(this.basePath, 'raw'),
            path.join(this.basePath, 'classified'),
            path.join(this.basePath, 'reports')
        ];
        
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    
    startNewSession(sessionName, scenarioId, testingSystem) {
        const sessionId = `session_${Date.now()}`;
        const timestamp = new Date().toISOString();
        
        this.currentSession = {
            sessionId,
            sessionName,
            scenarioId,
            timestamp,
            startTime: timestamp,
            founderPresent: null,
            notes: [],
            reactions: [],
            classifications: [],
            status: 'in_progress'
        };
        
        console.log(`\n🎬 STARTING PHASE 73 SESSION: ${sessionName}`);
        console.log(`Session ID: ${sessionId}`);
        console.log(`Time: ${new Date(timestamp).toLocaleString()}`);
        console.log("=" .repeat(60));
        
        // Run the scenario
        const scenarioResult = testingSystem.runScenario(scenarioId);
        
        if (scenarioResult) {
            this.currentSession.scenarioResult = scenarioResult;
            
            // Save raw session data
            this.saveSessionData('raw', this.currentSession);
            
            console.log("\n📝 SESSION DATA CAPTURE READY");
            console.log("Awaiting founder reactions and classification...");
        }
        
        return this.currentSession;
    }
    
    captureFounderReaction(reactionType, verbatim, notes = '') {
        if (!this.currentSession) {
            console.log("❌ No active session. Start a session first.");
            return null;
        }
        
        const reaction = {
            id: `reaction_${this.currentSession.reactions.length + 1}`,
            timestamp: new Date().toISOString(),
            reactionType,
            verbatim,
            notes,
            scenarioId: this.currentSession.scenarioId
        };
        
        this.currentSession.reactions.push(reaction);
        
        console.log(`\n📝 CAPTURED FOUNDER REACTION:`);
        console.log(`Type: ${reactionType}`);
        console.log(`Verbatim: "${verbatim}"`);
        if (notes) console.log(`Notes: ${notes}`);
        
        return reaction;
    }
    
    classifyIssue(classificationCode, issueDescription, evidence = '', suggestedAction = '') {
        if (!this.currentSession) {
            console.log("❌ No active session. Start a session first.");
            return null;
        }
        
        if (!this.classificationSystem[classificationCode]) {
            console.log(`❌ Invalid classification code. Use: ${Object.keys(this.classificationSystem).join(', ')}`);
            return null;
        }
        
        const classification = this.classificationSystem[classificationCode];
        const classificationRecord = {
            id: `classification_${this.currentSession.classifications.length + 1}`,
            timestamp: new Date().toISOString(),
            code: classificationCode,
            name: classification.name,
            description: classification.description,
            issueDescription,
            evidence,
            suggestedAction,
            scenarioId: this.currentSession.scenarioId
        };
        
        this.currentSession.classifications.push(classificationRecord);
        
        console.log(`\n🏷️  APPLIED CLASSIFICATION:`);
        console.log(`${classificationCode} ${classification.name}`);
        console.log(`Issue: ${issueDescription}`);
        if (evidence) console.log(`Evidence: ${evidence}`);
        if (suggestedAction) console.log(`Suggested: ${suggestedAction}`);
        
        return classificationRecord;
    }
    
    endSession(completionNotes = '') {
        if (!this.currentSession) {
            console.log("❌ No active session.");
            return null;
        }
        
        this.currentSession.endTime = new Date().toISOString();
        this.currentSession.status = 'completed';
        this.currentSession.completionNotes = completionNotes;
        
        // Calculate session duration
        const start = new Date(this.currentSession.startTime);
        const end = new Date(this.currentSession.endTime);
        this.currentSession.durationMinutes = Math.round((end - start) / 60000);
        
        // Save completed session
        this.saveSessionData('classified', this.currentSession);
        
        // Generate report
        const report = this.generateSessionReport();
        
        console.log(`\n✅ SESSION COMPLETED: ${this.currentSession.sessionName}`);
        console.log(`Duration: ${this.currentSession.durationMinutes} minutes`);
        console.log(`Reactions captured: ${this.currentSession.reactions.length}`);
        console.log(`Classifications: ${this.currentSession.classifications.length}`);
        
        if (completionNotes) {
            console.log(`Notes: ${completionNotes}`);
        }
        
        console.log("\n📊 SESSION SUMMARY:");
        this.printClassificationSummary();
        
        const completedSession = this.currentSession;
        this.currentSession = null;
        
        return completedSession;
    }
    
    saveSessionData(subdirectory, sessionData) {
        const filename = `${sessionData.sessionId}.json`;
        const filepath = path.join(this.basePath, subdirectory, filename);
        
        fs.writeFileSync(
            filepath,
            JSON.stringify(sessionData, null, 2),
            'utf8'
        );
        
        console.log(`💾 Session data saved: ${filepath}`);
        return filepath;
    }
    
    generateSessionReport() {
        if (!this.currentSession) {
            console.log("❌ No active session.");
            return null;
        }
        
        const session = this.currentSession;
        const report = {
            sessionId: session.sessionId,
            sessionName: session.sessionName,
            date: session.timestamp,
            duration: session.durationMinutes,
            scenario: session.scenarioId,
            
            reactions: session.reactions.map(r => ({
                type: r.reactionType,
                verbatim: r.verbatim,
                notes: r.notes
            })),
            
            classifications: session.classifications.map(c => ({
                code: c.code,
                name: c.name,
                issue: c.issueDescription,
                evidence: c.evidence,
                action: c.suggestedAction
            })),
            
            classificationSummary: this.getClassificationCounts(),
            
            validationQuestions: session.scenarioResult?.validationQuestions || [],
            
            matchResults: session.scenarioResult?.results ? {
                filteredCount: session.scenarioResult.results.filtered.length,
                rankedCount: session.scenarioResult.results.ranked.length,
                topMatch: session.scenarioResult.results.ranked[0] || null
            } : null,
            
            notes: session.completionNotes || '',
            status: session.status
        };
        
        // Save report
        const filename = `report_${session.sessionId}.json`;
        const filepath = path.join(this.basePath, 'reports', filename);
        
        fs.writeFileSync(
            filepath,
            JSON.stringify(report, null, 2),
            'utf8'
        );
        
        // Also create a readable text version
        const textReport = this.generateTextReport(report);
        const textFilepath = path.join(this.basePath, 'reports', `report_${session.sessionId}.txt`);
        fs.writeFileSync(textFilepath, textReport, 'utf8');
        
        console.log(`📄 Report generated: ${filepath}`);
        console.log(`📝 Text report: ${textFilepath}`);
        
        return report;
    }
    
    generateTextReport(report) {
        let text = `PHASE 73 SESSION REPORT\n`;
        text += `=${'='.repeat(50)}\n\n`;
        
        text += `SESSION: ${report.sessionName}\n`;
        text += `ID: ${report.sessionId}\n`;
        text += `Date: ${new Date(report.date).toLocaleString()}\n`;
        text += `Duration: ${report.duration} minutes\n`;
        text += `Scenario: ${report.scenario}\n\n`;
        
        text += `REACTIONS CAPTURED:\n`;
        text += `${'-'.repeat(30)}\n`;
        report.reactions.forEach((r, i) => {
            text += `${i + 1}. [${r.type}] "${r.verbatim}"\n`;
            if (r.notes) text += `   Notes: ${r.notes}\n`;
        });
        
        text += `\nCLASSIFICATIONS:\n`;
        text += `${'-'.repeat(30)}\n`;
        report.classifications.forEach((c, i) => {
            text += `${i + 1}. ${c.code} ${c.name}\n`;
            text += `   Issue: ${c.issue}\n`;
            if (c.evidence) text += `   Evidence: ${c.evidence}\n`;
            if (c.action) text += `   Action: ${c.action}\n`;
        });
        
        text += `\nCLASSIFICATION SUMMARY:\n`;
        text += `${'-'.repeat(30)}\n`;
        Object.entries(report.classificationSummary).forEach(([code, count]) => {
            const classification = this.classificationSystem[code];
            text += `${code} ${classification.name}: ${count}\n`;
        });
        
        if (report.matchResults) {
            text += `\nMATCH RESULTS:\n`;
            text += `${'-'.repeat(30)}\n`;
            text += `Filtered out: ${report.matchResults.filteredCount}\n`;
            text += `Ranked matches: ${report.matchResults.rankedCount}\n`;
            if (report.matchResults.topMatch) {
                text += `Top match: ${report.matchResults.topMatch.trainerId} `;
                text += `(${report.matchResults.topMatch.score}/100 ${report.matchResults.topMatch.confidence})\n`;
            }
        }
        
        if (report.notes) {
            text += `\nNOTES:\n`;
            text += `${'-'.repeat(30)}\n`;
            text += `${report.notes}\n`;
        }
        
        text += `\n${'='.repeat(52)}\n`;
        text += `PHASE 73 - FOUNDER BEHAVIORAL VALIDATION\n`;
        text += `${'='.repeat(52)}\n`;
        
        return text;
    }
    
    getClassificationCounts() {
        if (!this.currentSession) return {};
        
        const counts = {};
        Object.keys(this.classificationSystem).forEach(code => {
            counts[code] = 0;
        });
        
        this.currentSession.classifications.forEach(c => {
            if (counts[c.code] !== undefined) {
                counts[c.code]++;
            }
        });
        
        return counts;
    }
    
    printClassificationSummary() {
        const counts = this.getClassificationCounts();
        
        console.log("\n🏷️  CLASSIFICATION SUMMARY:");
        Object.entries(counts).forEach(([code, count]) => {
            const classification = this.classificationSystem[code];
            console.log(`  ${code} ${classification.name}: ${count}`);
        });
        
        // Calculate Phase 73 success metrics
        const totalClassifications = Object.values(counts).reduce((a, b) => a + b, 0);
        if (totalClassifications > 0) {
            const greenPercentage = (counts['🟢'] / totalClassifications) * 100;
            const redCount = counts['🔴'];
            
            console.log("\n📊 PHASE 73 METRICS:");
            console.log(`  🟢 Confirmed Correct: ${greenPercentage.toFixed(1)}%`);
            console.log(`  🔴 Logic Violations: ${redCount}`);
            
            if (greenPercentage >= 80 && redCount === 0) {
                console.log("  ✅ MEETS PHASE 73 SUCCESS CRITERIA");
            } else {
                console.log("  ⚠️  REVIEW REQUIRED");
            }
        }
    }
    
    runCompleteWorkflow(testingSystem, scenarioId, sessionName) {
        console.log("🔧 RUNNING COMPLETE PHASE 73 WORKFLOW");
        console.log("=" .repeat(60));
        
        // 1. Start session
        this.startNewSession(sessionName, scenarioId, testingSystem);
        
        console.log("\n📋 WORKFLOW INSTRUCTIONS:");
        console.log("1. Founder reviews the scenario output above");
        console.log("2. Capture reactions using captureFounderReaction()");
        console.log("3. Classify issues using classifyIssue()");
        console.log("4. End session with endSession()");
        
        console.log("\n🛠️  AVAILABLE COMMANDS:");
        console.log('manager.captureFounderReaction("feels_right", "This makes sense")');
        console.log('manager.classifyIssue("🟢", "Behavior aligns", "Top match expected", "None")');
        console.log('manager.endSession("Session complete")');
        
        return this.currentSession;
    }
    
    // Batch processing for multiple scenarios
    runBatchValidation(testingSystem, scenarios) {
        console.log("📦 RUNNING BATCH VALIDATION");
        console.log("=" .repeat(60));
        
        const results = [];
        const batchId = `batch_${Date.now()}`;
        
        scenarios.forEach((scenario, index) => {
            console.log(`\n${index + 1}/${scenarios.length}: ${scenario.name}`);
            console.log("-".repeat(40));
            
            const session = this.startNewSession(
                `Batch-${batchId}-${scenario.id}`,
                scenario.id,
                testingSystem
            );
            
            console.log("\n[Simulated founder review...]");
            
            // Simulate some reactions (in real use, founder would provide these)
            this.captureFounderReaction(
                "initial_reaction",
                "Reviewing the output...",
                "Automatic batch processing"
            );
            
            const completedSession = this.endSession(
                `Batch processed scenario ${scenario.id}`
            );
            
            results.push(completedSession);
        });
        
        console.log("\n✅ BATCH PROCESSING COMPLETE");
        console.log(`Processed ${results.length} scenarios`);
        
        return results;
    }
}

// Demo usage
if (require.main === module) {
    console.log("PHASE 73 SESSION MANAGER - DEMONSTRATION\n");
    
    // Create instance
    const manager = new Phase73SessionManager('./phase73_sessions');
    
    console.log("Classification system ready:");
    Object.entries(manager.classificationSystem).forEach(([code, info]) => {
        console.log(`  ${code} - ${info.name}: ${info.description}`);
    });
    
    console.log("\n📁 Session directories created");
    console.log("System ready for founder validation sessions.");
}

module.exports = Phase73SessionManager;
