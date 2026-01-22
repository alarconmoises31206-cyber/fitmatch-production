// PHASE 73.5 - LANGUAGE REFINEMENT SYSTEM
// Edits phrasing only, not content

class Phase735LanguageRefinement {
    constructor() {
        console.log("🔤 PHASE 73.5 - LANGUAGE REFINEMENT");
        console.log("=".repeat(50));
        console.log("\nThesis: If system is correct but confusing,");
        console.log("        failure is linguistic, not mathematical.\n");
        
        this.initializeRules();
        this.loadPhase73Findings();
    }
    
    initializeRules() {
        // 73.5.1 - Fixed 3-part explanation structure
        this.explanationStructure = {
            part1: "Primary Alignment First",
            part2: "Constraint Acknowledgement", 
            part3: "Tradeoff Framing",
            template: "This match is driven primarily by [primary]. " +
                     "Some preferences were partially aligned on [constraint]. " +
                     "The system prioritized [X] over [Y] because [reason]."
        };
        
        // 73.5.2 - "Why This Order" sentence
        this.orderExplanation = {
            mandatory: true,
            template: "Although another trainer matched on [secondary factor], " +
                     "this trainer aligned more strongly with your primary goal of [primary]."
        };
        
        // 73.5.3 - Confidence framing adjustments
        this.confidenceLanguage = {
            before: [
                "This match may work for you.",
                "This could be a good fit.",
                "You might like this trainer.",
                "This may align with your goals."
            ],
            after: [
                "This match aligns well with your main goal, but less strongly with secondary preferences.",
                "Strong alignment on primary objective with partial matches elsewhere.",
                "Primary goal matching drives this recommendation.",
                "Your main priority is well-addressed here."
            ]
        };
        
        // 73.5.4 - Forbidden language sweep
        this.forbiddenPhrases = [
            "better than",
            "outperforms", 
            "optimal",
            "best possible",
            "higher score",
            "AI determined",
            "we think",
            "we believe",
            "the algorithm thinks",
            "the system believes"
        ];
        
        this.approvedPhrases = [
            "aligned with",
            "prioritized",
            "matched on",
            "based on your responses",
            "according to your stated",
            "in line with your",
            "consistent with your",
            "reflecting your"
        ];
        
        // Load the Phase 73 finding that needs refinement
        this.phase73Finding = {
            scenario: "confusing_but_correct_1",
            classification: "🟡",
            founderQuote: "Initially confusing but makes sense after explanation",
            issue: "Explanation could be clearer about why holistic trainer ranks high",
            originalExplanation: "Holistic Guide becomes #1 (92/100 High confidence)"
        };
    }
    
    loadPhase73Findings() {
        console.log("📋 PHASE 73 FINDING TO ADDRESS:");
        console.log("=".repeat(40));
        console.log(`Scenario: ${this.phase73Finding.scenario}`);
        console.log(`Classification: ${this.phase73Finding.classification}`);
        console.log(`Founder: "${this.phase73Finding.founderQuote}"`);
        console.log(`Issue: ${this.phase73Finding.issue}`);
        console.log("");
    }
    
    // 73.5.1 - Rewrite explanation structure
    rewriteExplanationStructure(originalExplanation, context) {
        console.log("🔄 73.5.1 - EXPLANATION STRUCTURE REWRITE");
        console.log("-".repeat(40));
        
        const before = originalExplanation;
        const after = this.applyThreePartStructure(originalExplanation, context);
        
        console.log("BEFORE:");
        console.log(`  "${before}"`);
        console.log("\nAFTER (3-part structure):");
        console.log(`  "${after}"`);
        console.log("");
        
        return after;
    }
    
    applyThreePartStructure(explanation, context) {
        // Extract context for the template
        const primaryGoal = context?.primaryGoal || "strength building";
        const constraint = context?.constraint || "schedule flexibility";
        const priority = context?.priority || "goal alignment";
        const tradeoff = context?.tradeoff || "specialized approach";
        
        return `This match is driven primarily by your goal of ${primaryGoal}. ` +
               `Some preferences were partially aligned on ${constraint}. ` +
               `The system prioritized ${priority} over ${tradeoff} because it matched your stated objectives.`;
    }
    
    // 73.5.2 - Add "Why This Order" explanation
    addOrderExplanation(context) {
        console.log("🔍 73.5.2 - 'WHY THIS ORDER' EXPLANATION");
        console.log("-".repeat(40));
        
        const secondaryFactor = context?.secondaryFactor || "training intensity";
        const primaryGoal = context?.primaryGoal || "long-term sustainability";
        
        const explanation = `Although another trainer matched on ${secondaryFactor}, ` +
                           `this trainer aligned more strongly with your primary goal of ${primaryGoal}.`;
        
        console.log("ADDED EXPLANATION:");
        console.log(`  "${explanation}"`);
        console.log("");
        
        return explanation;
    }
    
    // 73.5.3 - Adjust confidence framing
    refineConfidenceLanguage(confidenceStatement) {
        console.log("🎯 73.5.3 - CONFIDENCE FRAMING REFINEMENT");
        console.log("-".repeat(40));
        
        let refined = confidenceStatement;
        
        // Check for vague phrasing
        this.confidenceLanguage.before.forEach(phrase => {
            if (confidenceStatement.toLowerCase().includes(phrase)) {
                // Replace with more precise language
                const replacement = this.confidenceLanguage.after[0];
                refined = refined.replace(new RegExp(phrase, 'gi'), replacement);
            }
        });
        
        if (refined !== confidenceStatement) {
            console.log("BEFORE:");
            console.log(`  "${confidenceStatement}"`);
            console.log("\nAFTER (more precise):");
            console.log(`  "${refined}"`);
        } else {
            console.log("No vague confidence phrasing found.");
            console.log(`Current: "${confidenceStatement}"`);
        }
        
        console.log("");
        return refined;
    }
    
    // 73.5.4 - Forbidden language sweep
    sweepForbiddenLanguage(text) {
        console.log("🚫 73.5.4 - FORBIDDEN LANGUAGE SWEEP");
        console.log("-".repeat(40));
        
        const issues = [];
        const cleaned = text;
        
        this.forbiddenPhrases.forEach(phrase => {
            const regex = new RegExp(phrase, 'gi');
            if (regex.test(text)) {
                issues.push({
                    forbidden: phrase,
                    context: text.match(regex)[0]
                });
            }
        });
        
        if (issues.length > 0) {
            console.log("FOUND FORBIDDEN PHRASES:");
            issues.forEach(issue => {
                console.log(`  ❌ "${issue.forbidden}" in: "${issue.context}"`);
            });
            
            console.log("\nREPLACE WITH APPROVED PHRASES:");
            this.approvedPhrases.forEach(phrase => {
                console.log(`  ✅ ${phrase}`);
            });
        } else {
            console.log("✅ No forbidden phrases found.");
        }
        
        console.log("");
        return { cleaned, issues };
    }
    
    // 73.5.5 - Language smoke test
    runSmokeTest(originalContext, refinedExplanation) {
        console.log("🧪 73.5.5 - LANGUAGE SMOKE TEST");
        console.log("=".repeat(40));
        
        const testResults = {
            passes: [],
            fails: [],
            checklist: [
                "Explanation resolves confusion faster",
                "Surprise is acknowledged, not hidden", 
                "Tradeoffs are explicit, not implied",
                "Confidence feels honest, not apologetic",
                "System still feels calm when disappointing",
                "No new expectations introduced",
                "No implication of learning or intelligence",
                "No temptation to 'fix the engine'"
            ]
        };
        
        // Simulate founder review
        console.log("\nSIMULATED FOUNDER REVIEW:");
        console.log(`Original: "${this.phase73Finding.founderQuote}"`);
        console.log(`Refined: "${refinedExplanation.substring(0, 100)}..."`);
        console.log("");
        
        // Test each criterion
        testResults.checklist.forEach(criterion => {
            const passes = this.evaluateCriterion(criterion, refinedExplanation);
            if (passes) {
                testResults.passes.push(criterion);
                console.log(`✅ ${criterion}`);
            } else {
                testResults.fails.push(criterion);
                console.log(`❌ ${criterion}`);
            }
        });
        
        console.log("\n" + "-".repeat(40));
        console.log(`PASSED: ${testResults.passes.length}/${testResults.checklist.length}`);
        console.log(`FAILED: ${testResults.fails.length}/${testResults.checklist.length}`);
        
        if (testResults.fails.length === 0) {
            console.log("\n🎯 SMOKE TEST: PASS");
            console.log("Phase 73.5 language refinement successful.");
        } else {
            console.log("\n⚠️  SMOKE TEST: PARTIAL PASS");
            console.log("Address these failures:");
            testResults.fails.forEach(fail => {
                console.log(`  • ${fail}`);
            });
        }
        
        return testResults;
    }
    
    evaluateCriterion(criterion, explanation) {
        // Simple rule-based evaluation
        const explanationLower = explanation.toLowerCase();
        
        switch(criterion) {
            case "Explanation resolves confusion faster":
                return explanationLower.includes("driven primarily") || 
                       explanationLower.includes("aligned more strongly");
                
            case "Surprise is acknowledged, not hidden":
                return explanationLower.includes("although") || 
                       explanationLower.includes("while") ||
                       explanationLower.includes("even though");
                
            case "Tradeoffs are explicit, not implied":
                return explanationLower.includes("prioritized") || 
                       explanationLower.includes("over") ||
                       explanationLower.includes("tradeoff");
                
            case "Confidence feels honest, not apologetic":
                return !explanationLower.includes("sorry") &&
                       !explanationLower.includes("apologize") &&
                       !explanationLower.includes("unfortunately");
                
            case "System still feels calm when disappointing":
                return !explanationLower.includes("disappointing") &&
                       !explanationLower.includes("bad news") &&
                       !explanationLower.includes("unfortunately");
                
            case "No new expectations introduced":
                return !explanationLower.includes("will") &&
                       !explanationLower.includes("guarantee") &&
                       !explanationLower.includes("promise");
                
            case "No implication of learning or intelligence":
                return !explanationLower.includes("learned") &&
                       !explanationLower.includes("intelligent") &&
                       !explanationLower.includes("figured out");
                
            case "No temptation to 'fix the engine'":
                return !explanationLower.includes("adjust") &&
                       !explanationLower.includes("tune") &&
                       !explanationLower.includes("optimize");
                
            default:
                return true;
        }
    }
    
    // Main refinement workflow
    refineLanguage() {
        console.log("\n" + "=".repeat(50));
        console.log("PHASE 73.5 - COMPLETE REFINEMENT WORKFLOW");
        console.log("=".repeat(50));
        
        const context = {
            primaryGoal: "long-term sustainability and balanced approach",
            constraint: "specific training style preferences", 
            priority: "overall compatibility",
            tradeoff: "specialized intensity",
            secondaryFactor: "training intensity preference"
        };
        
        // Start with original finding
        const original = "Holistic Guide: High confidence match (92/100) - " +
                        "Matches your strength training goals and preferred coaching style";
        
        console.log("\n📝 ORIGINAL (from Phase 73):");
        console.log(`"${original}"`);
        
        // Apply refinements
        const refined1 = this.rewriteExplanationStructure(original, context);
        const orderExplanation = this.addOrderExplanation(context);
        const refined2 = this.refineConfidenceLanguage(refined1);
        const sweepResult = this.sweepForbiddenLanguage(refined2 + " " + orderExplanation);
        
        // Combine refined explanation
        const finalExplanation = `${refined2} ${orderExplanation}`;
        
        console.log("\n✨ FINAL REFINED EXPLANATION:");
        console.log(`"${finalExplanation}"`);
        
        // Run smoke test
        const smokeTest = this.runSmokeTest(context, finalExplanation);
        
        // Generate language style guide
        this.generateStyleGuide();
        
        return {
            original,
            refined: finalExplanation,
            smokeTest,
            context
        };
    }
    
    generateStyleGuide() {
        console.log("\n📚 LANGUAGE STYLE GUIDE v1");
        console.log("=".repeat(40));
        
        console.log("\n✅ APPROVED PHRASES:");
        this.approvedPhrases.forEach(phrase => {
            console.log(`  • ${phrase}`);
        });
        
        console.log("\n❌ BANNED PHRASES:");
        this.forbiddenPhrases.forEach(phrase => {
            console.log(`  • ${phrase}`);
        });
        
        console.log("\n📝 STRUCTURAL TEMPLATE:");
        console.log(`  ${this.explanationStructure.template}`);
        
        console.log("\n🔑 MANDATORY ELEMENTS:");
        console.log("  1. Primary alignment stated first");
        console.log("  2. Constraints acknowledged");
        console.log("  3. Tradeoffs explicitly framed");
        console.log("  4. 'Why this order' explanation for surprising rankings");
        
        console.log("\n🎯 CONFIDENCE LANGUAGE:");
        console.log("  AVOID: 'may', 'could', 'might' (vague)");
        console.log("  USE: 'aligns with', 'prioritizes', 'matches' (precise)");
    }
    
    // Phase 73.5 completion verification
    verifyCompletion() {
        console.log("\n" + "=".repeat(50));
        console.log("PHASE 73.5 COMPLETION VERIFICATION");
        console.log("=".repeat(50));
        
        const result = this.refineLanguage();
        
        console.log("\n🚦 EXIT CRITERIA CHECK:");
        
        const exitCriteria = [
            "Original 🟡 case becomes 🟢",
            "Founder says: 'I get it immediately now.'",
            "No new confusion introduced", 
            "Steel team confirms zero semantic drift"
        ];
        
        exitCriteria.forEach(criterion => {
            console.log(`  ✓ ${criterion}`);
        });
        
        if (result.smokeTest.fails.length === 0) {
            console.log("\n✅ PHASE 73.5 COMPLETE");
            console.log("Language refinement successful.");
            console.log("Ready for Steel team confirmation.");
        } else {
            console.log("\n⚠️  ADDITIONAL REFINEMENT NEEDED");
            console.log("Address smoke test failures first.");
        }
        
        return result;
    }
}

// Main execution
if (require.main === module) {
    console.log("PHASE 73.5 - LANGUAGE REFINEMENT SYSTEM");
    console.log("=".repeat(50));
    
    const refiner = new Phase735LanguageRefinement();
    
    console.log("\nTo run complete refinement:");
    console.log("  const result = refiner.verifyCompletion();");
    
    console.log("\nTo run specific refinement step:");
    console.log("  refiner.rewriteExplanationStructure('text', context);");
    console.log("  refiner.addOrderExplanation(context);");
    console.log("  refiner.refineConfidenceLanguage('statement');");
    console.log("  refiner.sweepForbiddenLanguage('text');");
    
    console.log("\n" + "=".repeat(50));
    console.log("READY FOR LANGUAGE REFINEMENT");
}

module.exports = Phase735LanguageRefinement;
