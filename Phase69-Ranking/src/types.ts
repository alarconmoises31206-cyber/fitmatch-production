// Phase 69: Ranking & Selection Types
// Deterministic ranking system - no AI, no learning, no randomness

export interface RankedTrainer {
  trainerId: string;
  totalScore: number;
  confidence: number;
  breakdown: {
    primary: number;
    secondary: number;
    penalties: number;
  };
  hardFilterStatus: "PASSED" | "FAILED";
  explanation: string[];
}

export interface TrainerCandidate {
  trainerId: string;
  questionnaireResponses: Record<string, any>;
  questionEmbeddings: Record<string, number[]>;
  availability: boolean;
  requiredResponses: string[];
}

export interface ClientData {
  clientId: string;
  questionnaireResponses: Record<string, any>;
  questionEmbeddings: Record<string, number[]>;
}

export interface DeterministicMatchScore {
  trainerId: string;
  totalScore: number;
  confidence: number;
  breakdown: {
    primary: number;
    secondary: number;
    penalties: number;
  };
  explanationTokens: string[];
}

export interface HardFilterRule {
  id: string;
  field: string;
  operator: "equals" | "notEquals" | "greaterThan" | "lessThan" | "contains" | "notContains";
  value: any;
  weightClass: "primary" | "secondary" | "exclusion";
  failureReason: string;
}

export interface WeightClass {
  type: "primary" | "secondary";
  weight: number;
  questionIds: string[];
}

export interface RankingMetadata {
  filteredCount: number;
  rankedCount: number;
  confidenceLevel: "low" | "medium" | "high";
}

export interface RankingResponse {
  rankedTrainers: RankedTrainer[];
  metadata: RankingMetadata;
}
