# SCORING AUTHORITY CONTRACT
# Phase 67.75 — Design Lock
# Created: 2026-01-08

## THESIS
> "Similarity math is not allowed to invent meaning."
> Scoring authority defines WHO is allowed to influence match outcomes.

## LOCKED RULES

### ? AI DOES NOT DECIDE
- Weights or scoring coefficients
- Thresholds for acceptance/rejection
- Inclusion or exclusion of signals
- Interpretation of human intent

### ? HUMANS DEFINE
- Question intent and purpose
- Hard vs. soft signal classification
- Maximum influence per question/signal
- Failure conditions and boundaries
- Business logic constraints

### ? CODE ENFORCES
- Order of operations (non-negotiable pipeline)
- Failure behavior and degradation modes
- Deterministic outcomes given same inputs
- Invariant preservation across all computations
- Explainability assembly

## AUTHORITY BOUNDARIES

1. **Math as Tool, Not Arbiter**
   - Similarity calculations are measurement tools only
   - Scores cannot override human-defined boundaries
   - Mathematical elegance cannot replace explicit logic

2. **Human Sovereignty Over Business Rules**
   - Client constraints are absolute when marked as hard
   - Trainer boundaries are absolute when marked as hard
   - No mathematical compensation for violated hard rules

3. **Transparency Requirement**
   - All scoring decisions must be traceable to human-defined rules
   - No "black box" scoring components
   - All weights and thresholds must be explicitly configured

## ENFORCEMENT MECHANISMS

This contract is enforced by:
- Compile-time validation where possible
- Runtime assertions for invariant checking
- Code reviews referencing this document
- Test suite verifying authority boundaries

## CHANGE CONTROL

Modifications to scoring authority require:
1. Explicit update to this document
2. Review by project leads
3. Verification that Phase 67.75 invariants remain intact
4. Smoke test updates

---
**Next Artifact:** SIGNAL_INVARIANTS.md
