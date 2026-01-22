// Phase 73 Test Scenario Generator
// Creates consistent test cases for founder playtesting

const scenarios = {
    // 73.1: Minor preference tweaks
    minorTweaks: [
        {
            name: "Change frequency from 3x to 4x per week",
            clientChanges: [
                { questionId: "q2", from: "3-4 times per week", to: "4-5 times per week" }
            ],
            expected: "Small ranking shift, similar trainers may swap positions"
        },
        {
            name: "Add mild preference for yoga",
            clientChanges: [
                { questionId: "q4", from: "Prefer trainers who explain exercise science", to: "Prefer trainers who incorporate yoga" }
            ],
            expected: "Yoga-focused trainers move up slightly"
        }
    ],
    
    // 73.2: Major value shifts
    majorShifts: [
        {
            name: "Change from weight loss to strength training",
            clientChanges: [
                { questionId: "q1", from: "Weight loss and improved cardiovascular health", to: "Building maximum strength and power" }
            ],
            expected: "Complete re-ranking, strength trainers dominate"
        },
        {
            name: "Switch from beginner to advanced",
            clientChanges: [
                { questionId: "q3", from: "Beginner", to: "Advanced athlete" }
            ],
            expected: "Beginner-friendly trainers drop, advanced trainers rise"
        }
    ],
    
    // 73.3: Removing requirements
    removeRequirements: [
        {
            name: "Remove schedule constraint",
            clientChanges: [
                { questionId: "q2", from: "Weekday evenings after 6 PM", to: "Any time that works" }
            ],
            expected: "More trainers become available, rankings expand"
        }
    ],
    
    // 73.4: Adding boundaries
    addBoundaries: [
        {
            name: "Add injury restriction",
            clientChanges: [
                { questionId: "q3", from: "No injuries", to: "Recovering from shoulder injury, need modified exercises" }
            ],
            expected: "Trainers without injury experience drop or filter out"
        }
    ],
    
    // 73.5: Vague vs specific
    specificityTests: [
        {
            name: "Change from specific to vague goal",
            clientChanges: [
                { questionId: "q1", from: "Lose 20 pounds in 3 months", to: "Get in better shape" }
            ],
            expected: "Confidence may decrease, rankings become less distinct"
        },
        {
            name: "Change from vague to specific",
            clientChanges: [
                { questionId: "q1", from: "Exercise more", to: "Train for marathon in 6 months" }
            ],
            expected: "Confidence increases, marathon trainers rise"
        }
    ]
};

console.log("Phase 73 Test Scenario Generator");
console.log("================================\n");

console.log("Available scenario categories:");
Object.keys(scenarios).forEach(category => {
    console.log(`\n${category.toUpperCase()}:`);
    scenarios[category].forEach((scenario, index) => {
        console.log(`  ${index + 1}. ${scenario.name}`);
        console.log(`     Changes: ${scenario.clientChanges.map(c => `${c.questionId}: "${c.from}" → "${c.to}"`).join(', ')}`);
        console.log(`     Expected: ${scenario.expected}`);
    });
});

console.log("\nUsage Instructions:");
console.log("1. Founder selects a scenario to test");
console.log("2. Apply the input changes to test client");
console.log("3. Run matching before and after changes");
console.log("4. Observe: ranking shifts, explanation changes, confidence changes");
console.log("5. Log observations in phase73_intuition_log.md");

module.exports = scenarios;
