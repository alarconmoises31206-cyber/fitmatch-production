// domain/services/trainerService.ts
import { TrainerSchema } from "../schemas";
import { emitEvent } from "../events/emit";

export function createTrainer(data: unknown) {
  const trainer = TrainerSchema.parse(data)
  
  // EMIT DOMAIN EVENT: a new trainer has been created (onboarded)
  emitEvent('trainer.onboarded', {
    userId: trainer.user_id,
    trainerId: trainer.id,
    specialization: trainer.specialization,
    rating: trainer.rating,
  }, {
    source: 'trainerService.createTrainer',
    userId: trainer.user_id,
  })

  return {
    ...trainer,
    displayRating: trainer.rating.toFixed(1),
    isAvailable: true, // Default business logic
  }
}

export function updateTrainerSpecialization(data: unknown) {
  const update = TrainerSchema.partial().parse(data)
  return {
    ...update,
    updated_at: new Date().toISOString(),
  }
}

export function calculateTrainerEarnings(trainer: unknown, sessionsCount: number) {
  const validated = TrainerSchema.parse(trainer)
  // Business logic: trainers earn based on rating and sessions
  const baseEarning = 50; //  per session base
  const ratingBonus = (validated.rating - 4) * 10; //  per rating point above 4
  return (baseEarning + Math.max(0, ratingBonus)) * sessionsCount;
}
