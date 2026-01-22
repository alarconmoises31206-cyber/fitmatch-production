// PHASE 73 - MAIN EXECUTION SCRIPT
// Complete implementation package for founder behavioral validation

const Phase73TestingSystem = require('./phase73_complete_system.js');
const Phase73SessionManager = require('./session_manager.js');
const Phase73SuccessEvaluator = require('./success_evaluator.js');
const fs = require('fs');
const path = require('path');

class Phase73MainExecutor {
    constructor(config = {}) {
        this.config = {
            sessionsPath: './phase73_sessions',
            scenariosPath: './scenarios',
            reportsPath: './reports',
            ...config
        };
        
        this.testingSystem = null;
        this.sessionManager = null;
        this.successEvaluator = null;
        
        this.ensureDirectories();
        this.initializeSystems();
    }
    
    ensureDirectories() {
        Object.values(this.config).forEach(dirPath => {
            if (typeof dirPath === 'string') {
                const fullPath = path.resolve(dirPath);
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                    console.log(`📁 Created directory: ${fullPath}`);
                }
            }
        });
    }
    
    initializeSystems() {
        console.log("🚀 INITIALIZING PHASE 73 SYSTEMS...\n");
        
        // Initialize testing system
        this.testingSystem = new Phase73TestingSystem();
        console.log("✅ Testing system initialized");
        console.log(`   Loaded ${this.testingSystem.scenarios.length} scenario categories`);
        
        // Initialize session manager
        this.sessionManager = new Phase73SessionManager(this.config.sessionsPath);
        console.log("✅ Session manager initialized");
        
        // Initialize success evaluator
        this.successEvaluator = new Phase73SuccessEvaluator(
            path.join(this.config.sessionsPath, 'classified')
        );
        console.log("✅ Success evaluator initialized");
        
        console.log("\n" + "=".repeat(60));
        console.log("PHASE 73 IMPLEMENTATION PACKAGE READY");
        console.log("=".repeat(60));
    }
    
    printWelcome() {
        console.log("\n🎯 PHASE 73 - FOUNDER BEHAVIORAL VALIDATION");
        console.log("=".repeat(60));
        console.log("\nPurpose: Validate felt correctness without changing engine");
        console.log("Thesis: If system is logically correct but feels wrong,");
        console.log("        the issue is meaning, not math.\n");
        
        console.log("🔒 NON-NEGOTIABLE CONSTRAINTS:");
        console.log("  ❌ No code changes during sessions");
        console.log("  ❌ No UI polish");
        console.log("  ❌ No re-ranking");
        console.log("  ❌ No weight tuning");
        console.log("  ❌ No prompt tweaks");
        console.log("  ❌ No 'just one small fix'");
        console.log("\n  Phase 73 is read-only truth discovery.\n");
        
        console.log("📋 5 SCENARIO CATEGORIES:");
        this.testingSystem.scenarios.forEach((scenario, index) => {
            console.log(`  ${index + 1}. ${scenario.category}`);
            console.log(`     ${scenario.description}`);
        });
        
        console.log("\n🏷️  CLASSIFICATION SYSTEM:");
        Object.entries(this.sessionManager.classificationSystem).forEach(([code, info]) => {
            console.log(`  ${code} ${info.name}: ${info.description}`);
        });
        
        console.log("\n📊 SUCCESS CRITERIA:");
        console.log(`  • ≥80% of scenarios feel fair or explainable`);
        console.log(`  • 0 unexplained rankings`);
        console.log(`  • 0 confidence contradictions`);
        console.log(`  • All 🔴 violations are real (not emotional)`);
        
        console.log("\n" + "=".repeat(60));
    }
    
    listScenarios() {
        console.log("\n📋 AVAILABLE SCENARIOS:");
        console.log("=".repeat(40));
        
        this.testingSystem.scenarios.forEach((scenario, index) => {
            console.log(`\n${index + 1}. ${scenario.category.toUpperCase()}`);
            console.log(`   ID: ${scenario.id}`);
            console.log(`   ${scenario.description}`);
            console.log(`   Validation Questions:`);
            scenario.validationQuestions.forEach((q, i) => {
                console.log(`     ${i + 1}. ${q}`);
            });
        });
        
        return this.testingSystem.scenarios;
    }
    
    runScenarioInteractive(scenarioId) {
        if (!scenarioId) {
            console.log("\nPlease select a scenario:");
            const scenarios = this.listScenarios();
            console.log("\nEnter scenario ID (e.g., 'obvious_match_1'):");
            return { scenarios }; // In real implementation, would await input
        }
        
        const scenario = this.testingSystem.scenarios.find(s => s.id === scenarioId);
        if (!scenario) {
            console.log(`❌ Scenario '${scenarioId}' not found`);
            return null;
        }
        
        console.log(`\n🎬 RUNNING SCENARIO: ${scenario.category}`);
        console.log("=".repeat(60));
        
        // Run the complete workflow
        const session = this.sessionManager.runCompleteWorkflow(
            this.testingSystem,
            scenarioId,
            `Session_${scenario.category}_${Date.now()}`
        );
        
        return {
            scenario,
            session,
            manager: this.sessionManager
        };
    }
    
    runSingleSession(scenarioId, sessionName) {
        console.log(`\n🔧 RUNNING SINGLE SESSION: ${sessionName || 'Unnamed Session'}`);
        console.log("=".repeat(60));
        
        const scenario = this.testingSystem.scenarios.find(s => s.id === scenarioId);
        if (!scenario) {
            console.log(`❌ Scenario '${scenarioId}' not found`);
            return null;
        }
        
        // Start session
        const session = this.sessionManager.startNewSession(
            sessionName || `Session_${scenarioId}_${Date.now()}`,
            scenarioId,
            this.testingSystem
        );
        
        console.log("\n📝 SESSION READY FOR FOUNDER VALIDATION");
        console.log("The scenario output is shown above.");
        console.log("\nNext steps:");
        console.log("  1. Founder reviews output");
        console.log("  2. Capture reactions with captureFounderReaction()");
        console.log("  3. Classify issues with classifyIssue()");
        console.log("  4. End session with endSession()");
        
        return {
            scenario,
            session,
            manager: this.sessionManager
        };
    }
    
    simulateFounderSession(scenarioId, reactions = [], classifications = []) {
        console.log(`\n🤖 SIMULATING FOUNDER SESSION: ${scenarioId}`);
        console.log("=".repeat(60));
        
        const sessionName = `Simulated_${scenarioId}_${Date.now()}`;
        
        // Start session
        const session = this.sessionManager.startNewSession(
            sessionName,
            scenarioId,
            this.testingSystem
        );
        
        // Apply simulated reactions
        reactions.forEach(reaction => {
            this.sessionManager.captureFounderReaction(
                reaction.type,
                reaction.verbatim,
                reaction.notes
            );
        });
        
        // Apply simulated classifications
        classifications.forEach(classification => {
            this.sessionManager.classifyIssue(
                classification.code,
                classification.issue,
                classification.evidence,
                classification.action
            );
        });
        
        // End session
        const completedSession = this.sessionManager.endSession(
            "Automated simulation completed"
        );
        
        console.log("\n✅ SIMULATION COMPLETE");
        console.log(`Session: ${sessionName}`);
        console.log(`Reactions: ${reactions.length}`);
        console.log(`Classifications: ${classifications.length}`);
        
        return completedSession;
    }
    
    runAllScenariosSimulation() {
        console.log("\n🤖 RUNNING COMPLETE SIMULATION OF ALL SCENARIOS");
        console.log("=".repeat(60));
        
        const scenarios = this.testingSystem.scenarios;
        const results = [];
        
        // Define typical reactions for each scenario type
        const scenarioReactions = {
            'obvious_match': [
                { type: 'feels_right', verbatim: 'This makes perfect sense', notes: 'Expected match is #1' }
            ],
            'acceptable_not_ideal': [
                { type: 'acceptable', verbatim: 'This works but nothing special', notes: 'System correctly avoids overselling' }
            ],
            'confusing_but_correct': [
                { type: 'initial_confusion', verbatim: 'I didnt expect this match', notes: 'Initial reaction' },
                { type: 'resolution', verbatim: 'Actually I can see why after reading explanation', notes: 'After explanation' }
            ],
            'hard_rejection': [
                { type: 'clear_rejection', verbatim: 'Should not match, and it doesnt', notes: 'Hard filter working correctly' }
            ],
            'edge_case': [
                { type: 'uncertainty', verbatim: 'Not enough information to be confident', notes: 'System appropriately uncertain' }
            ]
        };
        
        const scenarioClassifications = {
            'obvious_match': [
                { code: '🟢', issue: 'Behavior aligns with intuition', evidence: 'Top match is obvious choice', action: 'None needed' }
            ],
            'acceptable_not_ideal': [
                { code: '🟢', issue: 'System avoids overselling', evidence: 'Confidence appropriate, no hype', action: 'None needed' }
            ],
            'confusing_but_correct': [
                { code: '🟡', issue: 'Initial explanation could be clearer', evidence: 'Founder initially confused', action: 'Refine explanation language' }
            ],
            'hard_rejection': [
                { code: '🟢', issue: 'Hard filters work correctly', evidence: 'Clear rejection with safety reasoning', action: 'None needed' }
            ],
            'edge_case': [
                { code: '🟠', issue: 'Need more client information', evidence: 'System appropriately uncertain with minimal data', action: 'Add optional clarifying questions' }
            ]
        };
        
        scenarios.forEach((scenario, index) => {
            console.log(`\n${index + 1}/${scenarios.length}: ${scenario.category}`);
            console.log("-".repeat(40));
            
            // Get scenario type from ID
            let scenarioType = 'obvious_match';
            if (scenario.id.includes('acceptable')) scenarioType = 'acceptable_not_ideal';
            if (scenario.id.includes('confusing')) scenarioType = 'confusing_but_correct';
            if (scenario.id.includes('rejection')) scenarioType = 'hard_rejection';
            if (scenario.id.includes('edge')) scenarioType = 'edge_case';
            
            const reactions = scenarioReactions[scenarioType] || [];
            const classifications = scenarioClassifications[scenarioType] || [];
            
            const result = this.simulateFounderSession(
                scenario.id,
                reactions,
                classifications
            );
            
            results.push(result);
        });
        
        console.log("\n✅ COMPLETE SIMULATION FINISHED");
        console.log(`Processed ${results.length} scenarios`);
        
        // Evaluate results
        console.log("\n📊 EVALUATING SIMULATION RESULTS...");
        const evaluation = this.successEvaluator.printQuickSummary();
        
        return {
            results,
            evaluation
        };
    }
    
    generatePhase73Report() {
        console.log("\n📄 GENERATING PHASE 73 COMPREHENSIVE REPORT");
        console.log("=".repeat(60));
        
        const evaluation = this.successEvaluator.evaluateAllSessions();
        
        console.log("\n🎯 PHASE 73 STATUS:");
        console.log(`${'-'.repeat(30)}`);
        console.log(`Status: ${evaluation.aggregate.phase73Outcome.status}`);
        console.log(`Next Phase: ${evaluation.aggregate.phase73Outcome.nextPhase}`);
        console.log(`\nRecommendation: ${evaluation.aggregate.phase73Outcome.recommendation}`);
        
        console.log("\n📈 KEY METRICS:");
        console.log(`${'-'.repeat(30)}`);
        console.log(`Sessions: ${evaluation.aggregate.totalSessions}`);
        console.log(`Pass Rate: ${evaluation.aggregate.passRate.toFixed(1)}%`);
        console.log(`Fairness: ${evaluation.aggregate.fairnessPercentage.toFixed(1)}%`);
        console.log(`Completion: ${evaluation.aggregate.completionRate.toFixed(1)}%`);
        
        console.log("\n🔧 RECOMMENDED ACTIONS:");
        console.log(`${'-'.repeat(30)}`);
        
        if (evaluation.aggregate.phase73Outcome.nextPhase.includes("73.5")) {
            console.log("1. Refine explanation language based on 🟡 classifications");
            console.log("2. Test revised explanations with founder");
            console.log("3. Re-evaluate Phase 73 success criteria");
        } else if (evaluation.aggregate.phase73Outcome.nextPhase.includes("74")) {
            console.log("1. Identify missing signals from 🟠 classifications");
            console.log("2. Design additional data collection");
            console.log("3. Implement signal expansion");
        } else if (evaluation.aggregate.phase73Outcome.nextPhase.includes("Surgical")) {
            console.log("1. Review 🔴 logic violations");
            console.log("2. Fix engine-level defects");
            console.log("3. Re-run Phase 73 validation");
        } else if (evaluation.aggregate.phase73Outcome.nextPhase.includes("Green light")) {
            console.log("1. Proceed with UI development");
            console.log("2. Begin Phase 74 - Signal expansion planning");
            console.log("3. Document Phase 73 learnings");
        } else {
            console.log("1. Run additional founder sessions");
            console.log("2. Refine scenario design");
            console.log("3. Re-evaluate success criteria");
        }
        
        console.log(`\n📁 Reports saved to: ${this.config.reportsPath}`);
        
        return evaluation;
    }
    
    printQuickStartGuide() {
        console.log("\n🚀 QUICK START GUIDE");
        console.log("=".repeat(40));
        
        console.log("\n1. INITIALIZE:");
        console.log('   const executor = new Phase73MainExecutor();');
        console.log('   executor.printWelcome();');
        
        console.log("\n2. RUN A SESSION:");
        console.log('   // Method 1: Interactive');
        console.log('   executor.runScenarioInteractive("obvious_match_1");');
        console.log('');
        console.log('   // Method 2: Programmatic');
        console.log('   const session = executor.runSingleSession(');
        console.log('     "obvious_match_1",');
        console.log('     "Founder Session 1"');
        console.log('   );');
        console.log('');
        console.log('   // Then capture founder reactions:');
        console.log('   executor.sessionManager.captureFounderReaction(');
        console.log('     "feels_right",');
        console.log('     "This makes sense"');
        console.log('   );');
        
        console.log("\n3. CLASSIFY ISSUES:");
        console.log('   executor.sessionManager.classifyIssue(');
        console.log('     "🟢",');
        console.log('     "Behavior aligns with intuition",');
        console.log('     "Top match is expected choice",');
        console.log('     "None needed"');
        console.log('   );');
        
        console.log("\n4. END SESSION:");
        console.log('   executor.sessionManager.endSession(');
        console.log('     "Session complete - founder satisfied"');
        console.log('   );');
        
        console.log("\n5. EVALUATE RESULTS:");
        console.log('   executor.generatePhase73Report();');
        
        console.log("\n6. RUN SIMULATION (for testing):");
        console.log('   executor.runAllScenariosSimulation();');
        
        console.log("\n" + "=".repeat(40));
        console.log("READY FOR FOUNDER VALIDATION SESSIONS");
    }
}

// Main execution
if (require.main === module) {
    console.log("PHASE 73 - COMPLETE IMPLEMENTATION PACKAGE");
    console.log("=".repeat(60));
    
    const executor = new Phase73MainExecutor();
    
    // Show welcome message
    executor.printWelcome();
    
    // Show quick start guide
    executor.printQuickStartGuide();
    
    console.log("\n🔧 To begin founder sessions:");
    console.log("   node phase73_main.js --scenario obvious_match_1");
    console.log("   node phase73_main.js --simulate");
    console.log("   node phase73_main.js --report");
    
    console.log("\n" + "=".repeat(60));
    console.log("IMPLEMENTATION PACKAGE READY FOR DEPLOYMENT");
}

// Command line interface
const args = process.argv.slice(2);
if (args.length > 0 && require.main === module) {
    const executor = new Phase73MainExecutor();
    
    if (args.includes('--welcome') || args.includes('-w')) {
        executor.printWelcome();
    } else if (args.includes('--list') || args.includes('-l')) {
        executor.listScenarios();
    } else if (args.includes('--simulate') || args.includes('-s')) {
        executor.runAllScenariosSimulation();
    } else if (args.includes('--report') || args.includes('-r')) {
        executor.generatePhase73Report();
    } else if (args.includes('--scenario') || args.includes('-sc')) {
        const scenarioIndex = args.indexOf('--scenario') !== -1 ? 
            args.indexOf('--scenario') : args.indexOf('-sc');
        const scenarioId = args[scenarioIndex + 1];
        if (scenarioId) {
            executor.runSingleSession(scenarioId, `CLI_Session_${scenarioId}`);
        } else {
            console.log("❌ Please provide a scenario ID");
            executor.listScenarios();
        }
    } else if (args.includes('--help') || args.includes('-h')) {
        console.log("\nPHASE 73 COMMAND LINE USAGE:");
        console.log("  node phase73_main.js --welcome        Show Phase 73 overview");
        console.log("  node phase73_main.js --list           List all scenarios");
        console.log("  node phase73_main.js --simulate       Run simulation of all scenarios");
        console.log("  node phase73_main.js --report         Generate comprehensive report");
        console.log("  node phase73_main.js --scenario ID    Run specific scenario");
        console.log("  node phase73_main.js --help           Show this help");
    } else {
        console.log("❌ Unknown argument. Use --help for usage.");
    }
}

module.exports = Phase73MainExecutor;
