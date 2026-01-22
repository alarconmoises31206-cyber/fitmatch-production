# PHASE 67.75 SMOKE TESTS (TRUTH TESTS)
# Created: 2026-01-08
# Purpose: Verify invariants, not implementation

## THESIS
> "These are truth tests, not unit tests."
> Verify Phase 67.75 design locks before proceeding to Phase 68.

## TEST 1: BOUNDARY OVERRIDE PREVENTION
**Purpose:** Verify hard boundaries cannot be overridden by soft similarity.

**Given:** 
- Client constraint conflicts with trainer boundary
- Very high soft similarity in all other areas (95%+ match)

**Then:**
- Match MUST be rejected
- Soft similarity computation MUST NOT occur
- Reason MUST indicate boundary conflict
- Confidence MUST NOT be calculated

**Validation Method:** 
- Manual test with crafted profiles
- Verify pipeline terminates at Stage 2

## TEST 2: ORDER OF OPERATIONS INTEGRITY
**Purpose:** Verify scoring pipeline executes in required order.

**Given:**
- Complete client and trainer profiles
- Mixed hard and soft signals
- All data valid and available

**Then:**
- Eligibility check MUST complete first
- Hard filters MUST evaluate before soft similarity
- Weighted aggregation MUST follow similarity computation
- Confidence adjustment MUST be final step before explanation

**Validation Method:**
- Instrument pipeline stages with logging
- Verify log sequence matches required order

## TEST 3: MISSING EMBEDDINGS DEGRADATION
**Purpose:** Verify graceful degradation when embeddings unavailable.

**Given:**
- Valid profiles with complete data
- Embeddings service unavailable or missing

**Then:**
- System MUST remain operational
- Similarity matching MUST be disabled
- Rule-based matching MUST still work
- Clear degradation notice MUST be presented
- NO silent failures or crashes

**Validation Method:**
- Disable embeddings service
- Attempt match
- Verify fallback behavior and notifications

## TEST 4: VAGUENESS PENALTY APPLICATION
**Purpose:** Verify system penalizes uncertainty appropriately.

**Given:**
- Client provides vague/non-specific answers
- Trainer has specific requirements
- All boundaries compatible

**Then:**
- Match MAY be accepted (if no hard violations)
- Confidence MUST be reduced significantly
- Explanation MUST note answer vagueness
- Score MUST NOT be artificially inflated

**Validation Method:**
- Create profile with vague goal statements
- Match with specific trainer
- Verify confidence penalty applied

## TEST 5: AVOIDANCE LIST ENFORCEMENT
**Purpose:** Verify trainer avoidance lists are absolute.

**Given:**
- Client states need that trainer has marked as "avoid"
- High compatibility in all other areas
- No other boundary conflicts

**Then:**
- Match MUST be rejected
- Reason MUST cite avoidance list
- No consideration of other compatibility areas
- Immediate pipeline termination

**Validation Method:**
- Add client need to trainer avoidance list
- Attempt match
- Verify immediate rejection with correct reason

## TEST 6: SIGNAL ISOLATION
**Purpose:** Verify hard and soft signals remain independent.

**Given:**
- Hard signal failure in one area
- Very strong soft signals in other areas

**Then:**
- Hard signal failure MUST cause rejection
- Soft signals MUST NOT influence decision
- No cross-signal compensation allowed
- Pipeline MUST terminate before soft computation

**Validation Method:**
- Create single hard conflict scenario
- Maximize soft compatibility elsewhere
- Verify rejection occurs without soft signal evaluation

## TEST 7: DETERMINISM GUARANTEE
**Purpose:** Verify identical inputs produce identical outputs.

**Given:**
- Fixed client and trainer profiles
- Identical system state and configuration

**Then:**
- Multiple match attempts MUST produce same result
- Scores MUST be identical (if computed)
- Confidence MUST be identical
- Explanation MUST be consistent

**Validation Method:**
- Run match 10 times with same inputs
- Verify result consistency
- Check for any non-deterministic behavior

## TEST EXECUTION PROTOCOL

### PRE-REQUISITES:
1. All 5 Phase 67.75 artifacts reviewed and approved
2. Test environment with Phase 67.75 invariants implemented
3. Ability to craft specific test profiles
4. Logging enabled for pipeline stages

### EXECUTION ORDER:
1. Run tests in sequence listed above
2. Document results for each test
3. Note any deviations from expected behavior
4. Capture logs for analysis

### ACCEPTANCE CRITERIA:
- All 7 smoke tests MUST pass
- Zero tolerance for invariant violations
- Any failure requires design review before Phase 68

## TEST MAINTENANCE

### WHEN TO UPDATE:
1. New failure mode identified
2. New canonical scenario added
3. Pipeline order modified (breaking change)
4. New signal type introduced

### UPDATE PROCESS:
1. Add/update test case
2. Verify against existing implementation
3. Update documentation
4. Re-run all smoke tests

## PHASE TRANSITION VERIFICATION

Phase 67.75 is complete when:
1. ? All 5 artifacts created and reviewed
2. ? All 7 smoke tests pass
3. ? No open design questions
4. ? Team consensus on invariants
5. ? Phase 68 implementation can proceed mechanically

---
**Phase 67.75 design lock complete. Ready for Phase 68.**
