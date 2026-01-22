# SCORING ORDER OF OPERATIONS (NON-NEGOTIABLE)
# Phase 67.75 — Design Lock
# Created: 2026-01-08

## THESIS
> "Freeze the evaluation pipeline so future code cannot reorder logic."
> This order prevents mathematical compensation and preserves authority boundaries.

## REQUIRED ORDER (NON-NEGOTIABLE)

### STAGE 1: ELIGIBILITY CHECK
**Purpose:** Verify match can proceed at most basic level
**Timing:** First, before any scoring
**Outcome:** Continue or terminate pipeline

**Operations:**
1. Validate client and trainer roles exist and are active
2. Verify required profile data is present and valid
3. Check system requirements (embeddings available, models loaded)
4. Confirm no administrative holds or manual overrides

**Failure Behavior:** 
- Missing requirements ? pipeline termination with "ineligible" status
- No partial evaluation

### STAGE 2: HARD FILTER EVALUATION
**Purpose:** Apply non-negotiable boundaries
**Timing:** Second, immediately after eligibility
**Outcome:** Match proceeds or is rejected

**Operations:**
1. Evaluate all hard-coded business rules
2. Check client constraints against trainer boundaries
3. Validate past friction and avoidance lists
4. Apply any role-specific prohibitions

**Failure Behavior:**
- Any hard filter violation ? immediate rejection
- No further computation performed
- Clear reason documented for rejection

### STAGE 3: SOFT SIMILARITY COMPUTATION
**Purpose:** Calculate compatibility measurements
**Timing:** Third, only if all hard filters pass
**Outcome:** Raw similarity scores per question

**Operations:**
1. Compute similarity for each soft-signal question
2. Apply per-question normalization if needed
3. No weighting or aggregation at this stage
4. Store raw scores for traceability

**Rules:**
- Each question scored independently
- No cross-question compensation
- No influence from hard filter outcomes

### STAGE 4: WEIGHTED AGGREGATION
**Purpose:** Combine soft scores with human-defined weights
**Timing:** Fourth, after all raw scores computed
**Outcome:** Single compatibility score

**Operations:**
1. Apply human-configured weights to each soft score
2. Sum weighted scores
3. Apply any caps or bounds per signal type
4. Normalize to standardized range (e.g., 0-100)

**Invariants:**
- Weights are configuration, not learned
- Caps prevent any single signal from dominating
- Aggregation formula is fixed and documented

### STAGE 5: CONFIDENCE ADJUSTMENT
**Purpose:** Penalize uncertainty and missing data
**Timing:** Fifth, after aggregated score computed
**Outcome:** Final score with confidence modifier

**Operations:**
1. Assess answer completeness and clarity
2. Apply vagueness penalty if answers lack specificity
3. Adjust for missing optional data
4. Compute final confidence score

**Rules:**
- Confidence cannot increase score, only decrease
- Clear penalty schedule for missing data
- Uncertainty reduces confidence, not compatibility

### STAGE 6: EXPLAINABILITY ASSEMBLY
**Purpose:** Generate human-readable reasoning
**Timing:** Final, after all computations complete
**Outcome:** Match decision with explanations

**Operations:**
1. Assemble rejection reasons (if applicable)
2. Document contributing factors for acceptance
3. Highlight strongest alignment areas
4. Note any confidence-reducing factors

## PIPELINE INTEGRITY GUARANTEES

### GUARANTEE 1: STAGE ISOLATION
No stage can influence the inputs or operations of earlier stages.

### GUARANTEE 2: FAILURE PROPAGATION
Pipeline terminates at earliest failure point; later stages never execute.

### GUARANTEE 3: DETERMINISM
Same inputs ? same pipeline execution path ? same outputs.

### GUARANTEE 4: AUDIT TRAIL
Each stage produces immutable artifacts for debugging and validation.

## CHANGE CONTROL

**Pipeline reordering is a breaking change** requiring:
1. Full impact analysis
2. Business justification
3. Documentation of previous vs. new order
4. Migration plan for existing data
5. Smoke test updates
6. Stakeholder approval

## ENFORCEMENT

This pipeline order is enforced by:
- Architecture review checkpoints
- Code organization that mirrors this structure
- Integration tests verifying stage order
- Monitoring that detects pipeline violations

---
**Next Artifact:** EXPECTED_OUTCOMES.md
