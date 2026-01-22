import { describe, it, expect } from "vitest";
import { createMatch, updateMatchStatus, calculateMatchScore } from "./matchService";
import { mockMatch } from "../test/mocks";

describe("matchService", () => {
  describe("createMatch", () => {
    it("creates a match with isActive and canBeModified flags", () => {
      const matchData = {
        id: "m_test",
        user_id: "u_test",
        trainer_id: "t_test",
        status: "pending",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      const result = createMatch(matchData)
      
      expect(result.id).toBe("m_test")
      expect(result.isActive).toBe(true)
      expect(result.canBeModified).toBe(true)
    })

    it("sets correct flags for accepted status", () => {
      const matchData = {
        ...mockMatch,
        status: "accepted",
      }

      const result = createMatch(matchData)
      
      expect(result.isActive).toBe(true)
      expect(result.canBeModified).toBe(false)
    })

    it("sets correct flags for rejected status", () => {
      const matchData = {
        ...mockMatch,
        status: "rejected",
      }

      const result = createMatch(matchData)
      
      expect(result.isActive).toBe(false)
      expect(result.canBeModified).toBe(false)
    })
  })

  describe("updateMatchStatus", () => {
    it("allows valid transition from pending to accepted", () => {
      const pendingMatch = {
        ...mockMatch,
        status: "pending",
      }

      const result = updateMatchStatus(pendingMatch, "accepted")
      
      expect(result.status).toBe("accepted")
      expect(result.updated_at).toBeDefined()
    })

    it("allows valid transition from pending to rejected", () => {
      const pendingMatch = {
        ...mockMatch,
        status: "pending",
      }

      const result = updateMatchStatus(pendingMatch, "rejected")
      
      expect(result.status).toBe("rejected")
      expect(result.updated_at).toBeDefined()
    })

    it("allows valid transition from accepted to completed", () => {
      const acceptedMatch = {
        ...mockMatch,
        status: "accepted",
      }

      const result = updateMatchStatus(acceptedMatch, "completed")
      
      expect(result.status).toBe("completed")
      expect(result.updated_at).toBeDefined()
    })

    it("throws error for invalid transition from pending to completed", () => {
      const pendingMatch = {
        ...mockMatch,
        status: "pending",
      }

      expect(() => updateMatchStatus(pendingMatch, "completed")).toThrow(
        "Invalid status transition from pending to completed"
      )
    })

    it("throws error for invalid transition from rejected to accepted", () => {
      const rejectedMatch = {
        ...mockMatch,
        status: "rejected",
      }

      expect(() => updateMatchStatus(rejectedMatch, "accepted")).toThrow(
        "Invalid status transition from rejected to accepted"
      )
    })
  })

  describe("calculateMatchScore", () => {
    it("returns a score between 0 and 100", () => {
      const userPreferences = { fitnessLevel: "intermediate" }
      const trainerProfile = { specialization: "fitness" }

      const score = calculateMatchScore(userPreferences, trainerProfile)
      
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it("returns an integer score", () => {
      const userPreferences = { fitnessLevel: "beginner" }
      const trainerProfile = { specialization: "yoga" }

      const score = calculateMatchScore(userPreferences, trainerProfile)
      
      expect(Number.isInteger(score)).toBe(true)
    })
  })
})
