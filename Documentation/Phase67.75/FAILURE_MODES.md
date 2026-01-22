# FAILURE & DEGRADATION CONTRACT
# Phase 67.75 — Design Lock
# Created: 2026-01-08

## THESIS
> "Prevent silent corruption when embeddings or data fail."
> The system prefers 'I don't know' over 'probably.'

## CORE PRINCIPLE: GRACEFUL DEGRADATION
When components fail, the system must:
1. **Detect** the failure immediately
2. **Contain** the failure to affected components
3. **Degrade** functionality predictably
4. **Communicate** the degradation clearly
5. **Never** silently produce corrupted results

## LOCKED FAILURE BEHAVIORS

### FAILURE MODE 1: MISSING EMBEDDINGS
**Scenario:** Vector embeddings unavailable for one or more profiles.

**Required Behavior:**
- Similarity computation DISABLED for affected profiles
- Match falls back to rule-based scoring only
- System remains operational for exact matches
- Clear logging: "Embeddings unavailable, using rule-based matching only"

**Forbidden Behavior:**
- Attempting to generate or guess embeddings
- Using placeholder or zero vectors
- Silently skipping similarity component

### FAILURE MODE 2: PARTIAL ANSWERS
**Scenario:** Client or trainer has incomplete profile data.

**Required Behavior:**
- Eligibility check: Only require mandatory fields
- Soft scoring: Exclude unanswered questions from similarity
- Confidence penalty: Apply for missing optional data
- Transparency: Report "Incomplete data reduces confidence"

**Forbidden Behavior:**
- Guessing values for missing answers
- Excluding profiles with incomplete optional data
- Hiding data completeness from match results

### FAILURE MODE 3: MODEL VERSION MISMATCH
**Scenario:** Embeddings generated with different model versions.

**Required Behavior:**
- Similarity comparisons INVALIDATED across versions
- Clear error: "Cannot compare embeddings from different model versions"
- Option to recompute embeddings with current model
- Fallback to rule-based matching if recomputation not possible

**Forbidden Behavior:**
- Comparing embeddings across versions without warning
- Attempting version normalization silently
- Producing similarity scores with version skew

### FAILURE MODE 4: EMBEDDINGS UNAVAILABLE (SYSTEM-WIDE)
**Scenario:** Vector database or embedding service down.

**Required Behavior:**
- System remains USABLE for exact rule matching
- All matches marked with "Limited functionality" flag
- Clear user notification: "Advanced matching temporarily unavailable"
- Manual matching still possible

**Forbidden Behavior:**
- System crash or unavailability
- Attempting to proceed with degraded embeddings
- Hiding the degradation from users

### FAILURE MODE 5: CONFIGURATION ERRORS
**Scenario:** Invalid weights, thresholds, or rules configuration.

**Required Behavior:**
- Startup validation fails with specific errors
- System refuses to start with invalid configuration
- Clear error messages pointing to specific config issues
- Safe defaults NEVER automatically applied

**Forbidden Behavior:**
- Silently applying default values
- Partial application of configuration
- Continuing with inconsistent state

### FAILURE MODE 6: DATA CORRUPTION
**Scenario:** Profile data inconsistent or corrupted.

**Required Behavior:**
- Validation at pipeline entry detects corruption
- Affected profiles marked "Needs review"
- Match attempts rejected with "Data quality issue"
- Administrative alerts generated

**Forbidden Behavior:**
- Attempting to clean or fix data automatically
- Proceeding with corrupted data
- Hiding corruption from administrators

## DEGRADATION HIERARCHY

### LEVEL 1: FULL FUNCTIONALITY
- All components operational
- Full similarity matching available
- Maximum accuracy

### LEVEL 2: RULE-BASED ONLY
- Embeddings unavailable
- Similarity matching disabled
- Hard filters and exact matches only
- Clear degradation notice

### LEVEL 3: MANUAL OVERRIDE MODE
- System degradation detected
- Administrative matching only
- Automated matching suspended
- Full transparency to administrators

## MONITORING REQUIREMENTS

### REQUIRED METRICS:
1. Embeddings availability percentage
2. Profile data completeness
3. Model version consistency
4. Configuration validation status
5. Pipeline failure rates by stage

### REQUIRED ALERTS:
1. Embeddings service unavailable > 5 minutes
2. Model version mismatch detected
3. Configuration validation failure
4. Pipeline failure rate > 1%
5. Data corruption detected

## RECOVERY PROCEDURES

### AUTOMATIC RECOVERY (ALLOWED):
- Transient network failures
- Temporary service unavailability
- Cache invalidation and retry

### MANUAL RECOVERY (REQUIRED):
- Model version upgrades
- Configuration changes
- Data corruption resolution
- Schema migrations

## CHANGE CONTROL

Modifications to failure behaviors require:
1. Analysis of impact on system stability
2. Updated recovery procedures
3. Monitoring and alerting updates
4. Documentation of new failure modes
5. Stakeholder approval for degradation changes

## ENFORCEMENT

This contract is enforced by:
- Health checks at system boundaries
- Validation in scoring pipeline entry points
- Monitoring that detects contract violations
- Code reviews focusing on failure handling
- Integration tests simulating failure modes

---
**All 5 required artifacts complete. Next: Smoke tests.**
