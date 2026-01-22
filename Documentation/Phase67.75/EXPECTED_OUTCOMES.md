# EXPECTED OUTCOME SCENARIOS (CANONICAL CASES)
# Phase 67.75 — Design Lock
# Created: 2026-01-08

## THESIS
> "Make system behavior predictable *before* numbers exist."
> These canonical cases define what must always happen, regardless of implementation details.

## CANONICAL SCENARIOS (MINIMAL SET)

### SCENARIO 1: ALIGNED GOAL + INCOMPATIBLE BOUNDARY
**Description:** Client and trainer share goals but have conflicting hard boundaries.

**Given:**
- Client seeks "weight loss coaching"
- Trainer offers "weight loss coaching" 
- Client constraint: "Only female trainers"
- Trainer boundary: "Male trainer only"

**Pipeline Execution:**
1. ? Eligibility check passes
2. ? Hard filter evaluation: Boundary conflict detected
3. ?? Pipeline terminates at Stage 2

**Expected Outcome:** 
- Match REJECTED
- Reason: "Gender preference boundary conflict"
- No soft similarity computation performed
- Confidence: N/A (not reached)

### SCENARIO 2: STRONG STYLE MATCH + LOW READINESS
**Description:** Communication styles align perfectly but client readiness level is low.

**Given:**
- Client readiness: "Just exploring" (low)
- Trainer preference: "Committed clients only" (medium threshold)
- Communication style: High similarity (95% match)
- All hard boundaries compatible

**Pipeline Execution:**
1. ? Eligibility check passes
2. ? Hard filter evaluation passes (no boundary conflicts)
3. ? Soft similarity: High style match computed
4. ? Weighted aggregation: Readiness penalty applied
5. ? Confidence adjustment: Low readiness reduces confidence
6. ? Explainability assembled

**Expected Outcome:**
- Match ACCEPTED with MEDIUM compatibility
- Confidence: LOW (due to readiness mismatch)
- Explanation highlights: "Strong communication alignment but readiness mismatch"
- Score reduced due to readiness penalty

### SCENARIO 3: VAGUE CLIENT ANSWERS
**Description:** Client provides non-specific responses to key questions.

**Given:**
- Client goal: "Get healthier" (vague)
- Trainer specialty: "Marathon training" (specific)
- All hard boundaries compatible
- Multiple vague answers across profile

**Pipeline Execution:**
1. ? Eligibility check passes
2. ? Hard filter evaluation passes
3. ? Soft similarity: Computed but with uncertainty
4. ? Weighted aggregation: Normal scores
5. ? Confidence adjustment: Significant penalty for vagueness
6. ? Explainability assembled

**Expected Outcome:**
- Match ACCEPTED with MEDIUM compatibility  
- Confidence: VERY LOW (due to answer vagueness)
- Explanation: "Limited specificity in client goals reduces match confidence"
- Note: System doesn't guess meaning from vague answers

### SCENARIO 4: TRAINER AVOIDS CLIENT'S STATED NEED
**Description:** Trainer has explicitly marked avoidance of client's primary need.

**Given:**
- Client need: "Eating disorder recovery support"
- Trainer avoidance list: Includes "eating disorders"
- Other areas: High compatibility
- All other boundaries compatible

**Pipeline Execution:**
1. ? Eligibility check passes
2. ? Hard filter evaluation: Avoidance list match detected
3. ?? Pipeline terminates at Stage 2

**Expected Outcome:**
- Match REJECTED
- Reason: "Trainer avoids this client need area"
- No consideration of other compatibility areas
- Immediate termination

### SCENARIO 5: PARAPHRASED INTENT
**Description:** Client and trainer express same intent with different wording.

**Given:**
- Client goal: "Build consistent exercise habits"
- Trainer description: "Help clients establish workout routines"
- Semantic similarity: High (same meaning, different words)
- All boundaries compatible

**Pipeline Execution:**
1. ? Eligibility check passes
2. ? Hard filter evaluation passes
3. ? Soft similarity: High semantic match detected
4. ? Weighted aggregation: Full credit for aligned intent
5. ? Confidence adjustment: Normal (clear intent)
6. ? Explainability assembled

**Expected Outcome:**
- Match ACCEPTED with HIGH compatibility
- Confidence: HIGH (clear intent expressed)
- Explanation: "Goals align despite different phrasing"
- Semantic understanding rewarded

### SCENARIO 6: OPPOSITE INTENT
**Description:** Client and trainer have fundamentally different approaches.

**Given:**
- Client preference: "Gentle, intuitive eating approach"
- Trainer approach: "Strict calorie counting and macros"
- Semantic similarity: Low (opposing philosophies)
- All boundaries technically compatible

**Pipeline Execution:**
1. ? Eligibility check passes
2. ? Hard filter evaluation passes (no hard conflicts)
3. ? Soft similarity: Low match computed
4. ? Weighted aggregation: Low compatibility score
5. ? Confidence adjustment: Normal
6. ? Explainability assembled

**Expected Outcome:**
- Match ACCEPTED with LOW compatibility
- Confidence: MEDIUM (clear but opposing preferences)
- Explanation: "Different approaches to nutrition"
- System doesn't judge philosophy, just reports mismatch

## SCENARIO VERIFICATION REQUIREMENTS

Each canonical scenario must be:
1. **Representative:** Covers common real-world cases
2. **Minimal:** No redundant scenarios
3. **Clear:** Unambiguous inputs and expected outcomes
4. **Actionable:** Can be translated to test cases
5. **Stable:** Remains valid across implementation changes

## USAGE IN DEVELOPMENT

1. **Design Validation:** Check proposed algorithms against these scenarios
2. **Testing:** Create integration tests from these scenarios
3. **Debugging:** Compare actual outcomes to expected outcomes
4. **Documentation:** Explain system behavior to stakeholders

## CHANGE CONTROL

Adding or modifying canonical scenarios requires:
1. Justification of new edge case coverage
2. Verification no existing scenario covers the case
3. Update to all related test suites
4. Documentation of behavioral expectations

---
**Next Artifact:** FAILURE_MODES.md
