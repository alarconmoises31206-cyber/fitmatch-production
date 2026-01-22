# HARD VS SOFT SIGNAL INVARIANTS
# Phase 67.75 - Design Lock
# Created: 2026-01-08

## THESIS
> "Soft similarity cannot overpower safety or boundaries."
> Signal classification prevents mathematical compensation for violations.

## HARD SIGNAL INVARIANTS

### DEFINITION
Hard signals represent **non-negotiable boundaries** that must be respected for any match to proceed.

### PROPERTIES
- **Evaluated FIRST** in scoring pipeline
- **Binary outcome**: PASS or FAIL only
- **One violation ? immediate match rejection**
- **Cannot be compensated** by any soft score
- **No partial credit** or weighted consideration

### EXAMPLES
- Client constraint vs. trainer boundary conflict
- Past friction vs. trainer avoidance requirement
- Role validity or eligibility requirements
- Required data missing or invalid

### ENFORCEMENT
\\\pseudocode
if (any_hard_signal_fails):
    match_rejected()
    exit_scoring_pipeline()
\\\

## SOFT SIGNAL INVARIANTS

### DEFINITION
Soft signals represent **preferences and compatibility measurements** that influence match quality.

### PROPERTIES
- **Evaluated ONLY if all hard signals pass**
- **Additive, not multiplicative** scoring
- **Capped contribution** per question/signal
- **Cannot exceed** predefined influence bands
- **Must remain** within human-defined bounds

### EXAMPLES
- Style similarity measurements
- Readiness level alignment
- Communication preference matching
- Goal paraphrasing similarity

### ENFORCEMENT
\\\pseudocode
if (all_hard_signals_pass):
    soft_score = calculate_soft_signals()
    soft_score = apply_caps_and_bounds(soft_score)
    return soft_score
\\\

## BOUNDARY PROTECTION RULES

### RULE 1: NO CROSS-COMPENSATION
A high soft score cannot compensate for a hard signal failure.
\\\pseudocode
# FORBIDDEN:
total_score = hard_score * 0.1 + soft_score * 0.9
if total_score > threshold: accept()

# REQUIRED:
if hard_score == FAIL: reject()
\\\

### RULE 2: ORDER PRESERVATION
Hard signals must complete evaluation before any soft signal computation begins.

### RULE 3: CAPACITY LIMITS
Each soft signal has a maximum contribution percentage defined by humans, not by data patterns.

### RULE 4: TRANSPARENCY REQUIREMENT
The classification (hard vs. soft) for each signal must be explicitly documented and auditable.

## SIGNAL CLASSIFICATION MATRIX

| Signal Type | When Evaluated | Outcome Type | Compensation Allowed | Failure Result |
|-------------|----------------|--------------|----------------------|----------------|
| Hard        | First          | Binary       | No                   | Immediate reject |
| Soft        | Second         | Continuous   | Within bounds only   | Score reduction |

## CHANGE CONTROL

Signal classification changes require:
1. Business justification for reclassification
2. Impact analysis on existing matches
3. Documentation update
4. Smoke test verification

---
**Next Artifact:** SCORING_PIPELINE.md
