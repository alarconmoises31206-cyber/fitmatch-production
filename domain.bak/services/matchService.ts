// domain/services/matchService.ts
import { MatchSchema } from "../schemas";
import { emitEvent } from "../events/emit";
import embeddingService from "../../lib/embeddings";

export function createMatch(data: unknown) {
  const match = MatchSchema.parse(data);
  emitEvent("match.created", {
    matchId: match.id,
    userId: match.user_id,
    trainerId: match.trainer_id,
    status: match.status,
  }, {
    source: "matchService.createMatch",
    userId: match.user_id,
  });
  return {
    ...match,
    isActive: match.status === "pending" || match.status === "accepted",
    canBeModified: match.status === "pending",
  };
}

export function updateMatchStatus(currentMatch: unknown, newStatus: string) {
  const match = MatchSchema.parse(currentMatch);
  const validTransitions: Record<string, string[]> = {
    pending: ["accepted", "rejected"],
    accepted: ["completed", "cancelled"],
    rejected: [],
    completed: [],
    cancelled: [],
  };
  const allowed = validTransitions[match.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(Invalid status transition from  to );
  }
  const eventName = newStatus === "accepted" ? "match.accepted" :
                    newStatus === "rejected" ? "match.rejected" :
                    newStatus === "completed" ? "session.completed" :
                    newStatus === "cancelled" ? "session.cancelled" : null;
  if (eventName) {
    emitEvent(eventName, {
      matchId: match.id,
      oldStatus: match.status,
      newStatus,
    }, {
      source: "matchService.updateMatchStatus",
      userId: match.user_id,
    });
  }
  return {
    ...match,
    status: newStatus,
    updated_at: new Date().toISOString(),
  };
}

export interface MatchScoreResult {
  score: number;
  reasons: string[];
  confidence: number;
}

export function calculateMatchScore(userPreferences: unknown, trainerProfile: unknown): MatchScoreResult {
  const reasons: string[] = [];
  let confidence = 0.5;
  const userPrefs = userPreferences as any;
  const trainer = trainerProfile as any;
  if (userPrefs?.embedding && trainer?.vector_embedding) {
    const similarity = embeddingService.calculateCosineSimilarity(userPrefs.embedding, trainer.vector_embedding);
    const semanticScore = embeddingService.similarityToScore(similarity);
    reasons.push(Semantic similarity score: );
    confidence = 0.8;
  } else {
    reasons.push("Using fallback weighted scoring (no embeddings)");
    confidence = 0.3;
  }
  if (trainer?.price_tier && userPrefs?.max_price) {
    if (trainer.price_tier <= userPrefs.max_price) {
      reasons.push("Price tier within budget");
    } else {
      reasons.push("Price tier exceeds budget - penalized");
    }
  }
  const completeness = (userPrefs?.completeness ?? 0.5) * (trainer?.completeness ?? 0.5);
  confidence *= completeness;
  const score = Math.floor(Math.random() * 100); // placeholder
  return { score, reasons, confidence };
}
