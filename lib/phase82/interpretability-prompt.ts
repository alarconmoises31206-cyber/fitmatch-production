/**
 * Phase 82: Interpretability Prompt Module (IPM)
 * 
 * Purpose: Elicit user interpretation, not opinion or satisfaction.
 * Constraints:
 * - Triggered after user action (never before)
 * - Shown to =10% of users
 * - Once per user max
 * - Optional skip always visible
 * - Canonical Question Set (choose ONE per user)
 */

// Phase 82 prompt variants (locked canonical questions)
export const PHASE82_PROMPT_VARIANTS = {
  INTERPRETATION_QUESTION: {
    id: "interpretation-question-v1",
    question: "What did the compatibility signal mean to you?",
    responses: [
      "A suggestion to explore",
      "Advice I should probably follow",
      "A recommendation",
      "A ranking of who's best",
      "I'm not sure"
    ] as const
  },
  INFLUENCE_QUESTION: {
    id: "influence-question-v1",
    question: "How much did the compatibility signal influence your decision?",
    responses: [
      "Not at all",
      "A little",
      "Somewhat",
      "A lot"
    ] as const
  }
} as const;

export type PromptVariantId = keyof typeof PHASE82_PROMPT_VARIANTS;
export type InterpretationResponse = typeof PHASE82_PROMPT_VARIANTS.INTERPRETATION_QUESTION.responses[number];
export type InfluenceResponse = typeof PHASE82_PROMPT_VARIANTS.INFLUENCE_QUESTION.responses[number];
export type PromptResponse = InterpretationResponse | InfluenceResponse;

/**
 * Phase 82 Sampling Logic
 * 
 * Rules:
 * - Show to =10% of users (configurable)
 * - Once per user max (based on session)
 * - Random selection
 */
export class InterpretabilityPromptModule {
  private readonly sampleRate: number;
  private shownToSessions: Set<string> = new Set();

  constructor(sampleRate: number = 0.1) {
    // Phase 82 constraint: =10% of users
    this.sampleRate = Math.min(sampleRate, 0.1);
  }

  /**
   * Determines if a prompt should be shown to this session
   */
  shouldShowPrompt(sessionId: string): boolean {
    // Phase 82: Once per user max
    if (this.shownToSessions.has(sessionId)) {
      return false;
    }

    // Phase 82: =10% sampling
    const shouldSample = Math.random() < this.sampleRate;
    
    if (shouldSample) {
      this.shownToSessions.add(sessionId);
    }
    
    return shouldSample;
  }

  /**
   * Selects a prompt variant for this session
   * Phase 82: Choose ONE per user
   */
  selectPromptVariant(): PromptVariantId {
    const variants = Object.keys(PHASE82_PROMPT_VARIANTS) as PromptVariantId[];
    const randomIndex = Math.floor(Math.random() * variants.length);
    return variants[randomIndex];
  }

  /**
   * Gets the prompt configuration for a variant
   */
  getPrompt(variantId: PromptVariantId) {
    return PHASE82_PROMPT_VARIANTS[variantId];
  }

  /**
   * Validates a response against the prompt variant
   */
  validateResponse(variantId: PromptVariantId, response: string): boolean {
    const prompt = this.getPrompt(variantId);
    return (prompt.responses as readonly string[]).includes(response);
  }

  /**
   * Logs an interpretability event
   */
  async logInterpretationEvent(
    sessionId: string,
    signalVisibilityState: "visible" | "hidden" | "unknown",
    promptVariantId: string,
    selectedResponse: string
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      const response = await fetch("/api/phase82/log-interpretation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          signalVisibilityState,
          promptVariantId,
          selectedResponse
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.warn("Phase 82 interpretability logging failed:", data.error);
        return { success: false, error: data.error };
      }

      return { success: true, eventId: data.eventId };
    } catch (error) {
      console.error("Phase 82 interpretability logging error:", error);
      return { success: false, error: "Network error" };
    }
  }

  /**
   * Phase 82 Interpretation Pattern Analysis
   * Categorizes responses for audit report
   */
  static categorizeInterpretation(response: string): 
    "authority_interpretation" | 
    "exploration_interpretation" | 
    "influence_self_report" | 
    "uncertain" | 
    "other" {
    
    const normalized = response.toLowerCase();
    
    // Authority interpretation patterns
    if (normalized.includes("recommendation") || 
        normalized.includes("ranking") ||
        normalized.includes("advice") ||
        response === "A recommendation" ||
        response === "A ranking of who's best" ||
        response === "Advice I should probably follow") {
      return "authority_interpretation";
    }
    
    // Exploration interpretation patterns
    if (normalized.includes("suggestion") || 
        normalized.includes("explore") ||
        response === "A suggestion to explore") {
      return "exploration_interpretation";
    }
    
    // Uncertainty patterns
    if (normalized.includes("not sure") || 
        response === "I'm not sure") {
      return "uncertain";
    }
    
    // Influence self-report patterns
    if (response === "Not at all" || 
        response === "A little" ||
        response === "Somewhat" ||
        response === "A lot") {
      return "influence_self_report";
    }
    
    return "other";
  }

  /**
   * Phase 82 Success/Failure Analysis
   * Returns whether interpretation patterns meet success criteria
   */
  static analyzeInterpretationPatterns(
    authorityCount: number,
    explorationCount: number,
    uncertainCount: number,
    influenceHighCount: number,
    totalCount: number
  ): {
    isSuccess: boolean;
    authorityPercentage: number;
    explorationPercentage: number;
    highInfluencePercentage: number;
    failureReasons: string[];
  } {
    if (totalCount === 0) {
      return {
        isSuccess: false,
        authorityPercentage: 0,
        explorationPercentage: 0,
        highInfluencePercentage: 0,
        failureReasons: ["No data collected"]
      };
    }

    const authorityPercentage = (authorityCount / totalCount) * 100;
    const explorationPercentage = (explorationCount / totalCount) * 100;
    const highInfluencePercentage = (influenceHighCount / totalCount) * 100;

    const failureReasons: string[] = [];

    // Phase 82 Success Condition 1: Majority interpret as exploratory
    if (explorationPercentage <= 50) {
      failureReasons.push("Exploration interpretation is minority (" + explorationPercentage.toFixed(1) + "%)");
    }

    // Phase 82 Success Condition 2: Authority interpretation is minority
    if (authorityPercentage > 30) { // Threshold for "minority"
      failureReasons.push("Authority interpretation is significant (" + authorityPercentage.toFixed(1) + "%)");
    }

    // Phase 82 Success Condition 3: High influence reported by minority
    if (highInfluencePercentage > 30) {
      failureReasons.push("High influence reported by significant percentage (" + highInfluencePercentage.toFixed(1) + "%)");
    }

    const isSuccess = failureReasons.length === 0;

    return {
      isSuccess,
      authorityPercentage,
      explorationPercentage,
      highInfluencePercentage,
      failureReasons
    };
  }
}

// Singleton instance for Phase 82
let phase82Instance: InterpretabilityPromptModule | null = null;

export function getPhase82PromptModule(sampleRate: number = 0.1): InterpretabilityPromptModule {
  if (!phase82Instance) {
    phase82Instance = new InterpretabilityPromptModule(sampleRate);
  }
  return phase82Instance;
}

/**
 * Helper to generate session IDs
 * Phase 82: Session-based, not user-based
 */
export function generateSessionId(): string {
  return "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

/**
 * Phase 82 Audit Report Generator
 * Creates the required INTERPRETABILITY_AUDIT.md content
 */
export async function generatePhase82AuditReport(): Promise<string> {
  const report = "# PHASE 82 INTERPRETABILITY AUDIT REPORT

## 1. What users think the signal is

*(Based on aggregated interpretability events)*

### Interpretation Distribution:
- **Exploration interpretation**: X% (A suggestion to explore)
- **Authority interpretation**: Y% (Recommendation/Ranking/Advice)
- **Uncertain**: Z% (I'm not sure)

### Influence Self-Report:
- **Not at all**: A%
- **A little**: B%
- **Somewhat**: C%
- **A lot**: D%

## 2. Where interpretation diverges from intent

*(Gap analysis between intended exploratory nature and actual interpretation)*

**Intended**: Compatibility signal as exploratory information
**Actual**: [Summary of actual interpretation patterns]

**Key divergence points**:
1. [Specific divergence if found]
2. [Another divergence if found]

## 3. Evidence of authority inflation (if any)

**Authority indicators detected**:
- [ ] \"Recommendation\" interpretation: X%
- [ ] \"Ranking\" interpretation: Y%
- [ ] \"Advice\" interpretation: Z%

**Authority creep assessment**: [Low/Medium/High]

## 4. Evidence of healthy skepticism (if any)

**Healthy interaction patterns**:
- [ ] Signal hidden while making decisions: A%
- [ ] Low influence self-reported: B%
- [ ] Exploration-focused interpretation: C%

## 5. Unknowns & ambiguities

**Data limitations**:
- Sample size: N sessions
- Collection period: [dates]
- Geographic coverage: [if available]

**Ambiguous interpretations**:
- \"I'm not sure\" responses: P%

**Edge cases requiring clarification**:
1. [Edge case 1]
2. [Edge case 2]

## 6. Risk Classification Table

| Risk Type | Evidence Present? | Severity | Notes |
|-----------|------------------|----------|-------|
| Authority Misinterpretation | Yes/No | Low/Med/High | |
| Overreliance | Yes/No | Low/Med/High | |
| Confusion | Yes/No | Low/Med/High | |

## 7. Phase 82 Success Assessment

**Success Criteria Met**: [Yes/No/Partial]

**Primary success indicators**:
1. [Indicator 1]
2. [Indicator 2]

**Primary concerns**:
1. [Concern 1]
2. [Concern 2]

## 8. Recommendations for Phase 83

*Note: Phase 82 is diagnostic only. These are observations, not recommendations.*

**If Phase 82 SUCCESS**: 
- Phase 83 may proceed with carefully bounded improvements
- Maintain current signal presentation with optional clarifications

**If Phase 82 FAILURE**:
- Phase 83 must be corrective, not expansive
- Address authority misinterpretation before any enhancements
- Consider signal redesign if authority inflation is severe

---

*Report generated: " + new Date().toISOString() + "*
*Phase 82 Version: phase82-v1*
*Data Source: interpretability_events table (aggregate-only access)*";

  return report;
}
