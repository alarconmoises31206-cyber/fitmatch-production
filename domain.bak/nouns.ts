// domain/nouns.ts
// Canonical domain entities - these are the 8 core nouns of FitMatch
// Do not add new nouns without architectural approval

// These interfaces are now replaced by Zod-inferred types from schemas.ts
// Keep this file for backward compatibility during migration

export type { 
  User, 
  Trainer, 
  Match, 
  Session, 
  Payment, 
  Subscription, 
  Profile, 
  OnboardingAttempt 
} from './schemas';

// Type guards and utility functions
export function isUser(entity: unknown): entity is User {
  const result = UserSchema.safeParse(entity)
  return result.success;
}

export function isTrainer(entity: unknown): entity is Trainer {
  const result = TrainerSchema.safeParse(entity)
  return result.success;
}

// Add other type guards as needed
