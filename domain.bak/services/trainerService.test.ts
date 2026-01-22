import { describe, it, expect } from "vitest";
import { createTrainer, updateTrainerSpecialization, calculateTrainerEarnings } from "./trainerService";
import { mockTrainer } from "../test/mocks";

describe("trainerService", () => {
  describe("createTrainer", () => {
    it("creates a trainer with displayRating and availability", () => {
      const trainerData = {
        id: "t_test",
        user_id: "u_test",
        specialization: "Yoga",
        rating: 4.7,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      const result = createTrainer(trainerData)
      
      expect(result.id).toBe("t_test")
      expect(result.displayRating).toBe("4.7")
      expect(result.isAvailable).toBe(true)
      expect(result.specialization).toBe("Yoga")
    })
  })

  describe("updateTrainerSpecialization", () => {
    it("updates trainer specialization with new timestamp", () => {
      const updateData = {
        specialization: "Pilates",
        rating: 4.9,
      }

      const result = updateTrainerSpecialization(updateData)
      
      expect(result.specialization).toBe("Pilates")
      expect(result.rating).toBe(4.9)
      expect(result.updated_at).toBeDefined()
    })

    it("allows partial updates", () => {
      const partialData = {
        specialization: "CrossFit",
      }

      const result = updateTrainerSpecialization(partialData)
      
      expect(result.specialization).toBe("CrossFit")
      expect(result.updated_at).toBeDefined()
    })
  })

  describe("calculateTrainerEarnings", () => {
    it("calculates earnings for trainer with good rating", () => {
      const trainerWithGoodRating = {
        ...mockTrainer,
        rating: 4.8,
      }
      
      const sessionsCount = 10;
      const earnings = calculateTrainerEarnings(trainerWithGoodRating, sessionsCount)
      
      // Base: 50, Bonus: (4.8 - 4) * 10 = 8, Total per session: 58, For 10 sessions: 580
      expect(earnings).toBe(580)
    })

    it("calculates earnings for trainer with average rating", () => {
      const trainerWithAverageRating = {
        ...mockTrainer,
        rating: 3.9,
      }
      
      const sessionsCount = 5;
      const earnings = calculateTrainerEarnings(trainerWithAverageRating, sessionsCount)
      
      // Base: 50, Bonus: max(0, (3.9 - 4) * 10) = 0, Total per session: 50, For 5 sessions: 250
      expect(earnings).toBe(250)
    })

    it("calculates earnings for trainer with perfect rating", () => {
      const trainerWithPerfectRating = {
        ...mockTrainer,
        rating: 5.0,
      }
      
      const sessionsCount = 8;
      const earnings = calculateTrainerEarnings(trainerWithPerfectRating, sessionsCount)
      
      // Base: 50, Bonus: (5 - 4) * 10 = 10, Total per session: 60, For 8 sessions: 480
      expect(earnings).toBe(480)
    })
  })
})
