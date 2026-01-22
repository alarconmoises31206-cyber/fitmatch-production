# AI System Boundaries - Phase 79

## Overview
This document defines the strict boundaries for the AI-assisted compatibility engine implemented in Phase 79. These boundaries ensure the system remains an **interpretive lens** rather than a **recommender system**.

## Core Principle
> "What you're building is not a recommender system. You are building an AI-assisted interpretive lens."

## 1. Input Boundaries

### Eligible Inputs (Canonical Input Contract)
Only these open-ended text fields may be used for embeddings:

**Client Fields:**
- personalMotivation
- medicalNotes (if consented & surfaced post-match only)
- communicationPreferences
- free-text goal elaboration (if present)

**Trainer Fields:**
- bio
- trainingPhilosophy (if separate field)
- specialties_description (free text, not tags)
- communicationStyleNotes

### Explicit Exclusions
❌ Numeric fields (age, price, experience years)
❌ Categorical filters (gender, availability, pricing tier)
❌ Anything marked used_now: 'filter' in truth-map
❌ Structured data of any kind

**Why:** Embeddings operate only on language, not structure. Filters remain deterministic.

## 2. Computation Boundaries

### What This System Does NOT Do:
- ❌ Optimize for engagement
- ❌ Claim objective truth
- ❌ Replace explicit filters
- ❌ Hide AI behavior
- ❌ Make medical inferences
- ❌ Make mental health inferences
- ❌ Predict outcomes
- ❌ Score trainer quality
- ❌ Learn from feedback (no training loop)
- ❌ Rank matches as "best" to "worst"

### What This System Does Do:
- ✅ Compute explainable semantic similarity
- ✅ Respect declared system boundaries
- ✅ Produce a defensible "compatibility signal"
- ✅ Provide transparent explanations
- ✅ Degrade gracefully when embeddings unavailable
- ✅ Maintain audit trails

## 3. Output Boundaries

### Compatibility Signal Properties:
- **Label:** Always "Compatibility Signal"
- **Range:** 0-100 (bounded score)
- **Nature:** Static similarity function output
- **Persistence:** Temporary (expires after 30 days)
- **Authority:** Non-authoritative interpretive signal

### Explanation Requirements:
- Must be human-readable
- Must not contain "AI thinks" or "AI believes"
- Must not make psychological claims
- Must not hide the underlying logic
- Must reinforce "signal to explore, not a decision"

## 4. UI Integration Boundaries

### Display Rules:
1. **Label:** Always shown as "Compatibility Signal"
2. **Tooltip:** Always visible explaining what it is
3. **Sorting:** Never sorted by "best" compatibility
4. **Default:** Never shown as default authority
5. **Optional:** User can hide the signal
6. **Context:** Always shown alongside explicit filters

### Required UI Text:
- "This is a signal to explore, not a decision."
- "Based on semantic similarity in profile descriptions."
- "Does not indicate match quality or guarantee success."

## 5. Safety Boundaries

### Hard Constraints:
1. **No Medical Inference:** Never analyze or infer medical conditions
2. **No Mental Health Inference:** Never analyze or infer mental state
3. **No Outcome Prediction:** Never predict success or failure
4. **No Quality Scoring:** Never score trainer skill or value
5. **No Epistemic Inflation:** Never claim to "know" or "understand"
6. **No Optimization:** Never optimize for any engagement metric

### Audit Requirements:
- Store all similarity inputs
- Store all output scores
- Store all explanation text
- Maintain versioning for model changes
- Log all boundary validation checks

## 6. System Integrity Boundaries

### Data Lifecycle:
- Embeddings are never mutated, only regenerated
- Compatibility scores expire after 30 days
- No permanent "recommendation" storage
- No feedback loops into the system

### Version Control:
- Embeddings are versioned by model
- Compatibility engine is versioned
- All outputs include version metadata
- Backward compatibility maintained for data

## 7. Future Extensibility Boundaries

### Allowed Extensions:
- New embedding models (with versioning)
- Additional eligible text fields (if open-ended)
- Enhanced explanation templates
- Additional UI display options

### Forbidden Extensions:
- Turning into a recommender system
- Adding optimization objectives
- Removing explanation requirements
- Hiding AI involvement
- Adding permanent scoring
- Creating feedback loops

## 8. Success Criteria Validation

The system is successful only if:
✅ AI is real (not fake/placeholder)
✅ Claims match behavior (no misrepresentation)
✅ Users are not misled (clear boundaries)
✅ No epistemic inflation (stays in lane)
✅ Future extensibility preserved (boundaries respected)

## Change Control
Any changes to these boundaries require:
1. Review against Phase 79 principles
2. User experience impact assessment
3. Safety boundary validation
4. Documentation updates
5. Version increment

---
*Document version: Phase79-v1.0*
*Last updated: 2026-01-20*
