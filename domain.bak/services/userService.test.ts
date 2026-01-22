import { describe, it, expect, vi } from "vitest";
import { createUser, updateUserProfile, getUserDisplayInfo } from "./userService";
import { mockUser } from "../test/mocks";

describe("userService", () => {
  describe("createUser", () => {
    it("creates a user with displayEmail", () => {
      const userData = {
        id: "u_test",
        email: "test@example.com",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        wallet_balance: 1000,
      }

      const result = createUser(userData)
      
      expect(result.id).toBe("u_test")
      expect(result.displayEmail).toBe("test@example.com")
      expect(result.wallet_balance).toBe(1000)
    })

    it("throws error for invalid user data", () => {
      const invalidData = {
        id: "u_test",
        email: "invalid-email", // Invalid email
        wallet_balance: 1000,
      }

      expect(() => createUser(invalidData)).toThrow()
    })
  })

  describe("updateUserProfile", () => {
    it("updates user profile with new timestamp", () => {
      const updateData = {
        email: "updated@example.com",
        wallet_balance: 2000,
      }

      const result = updateUserProfile(updateData)
      
      expect(result.email).toBe("updated@example.com")
      expect(result.wallet_balance).toBe(2000)
      expect(result.updated_at).toBeDefined()
    })

    it("allows partial updates", () => {
      const partialData = {
        wallet_balance: 3000,
      }

      const result = updateUserProfile(partialData)
      
      expect(result.wallet_balance).toBe(3000)
      expect(result.updated_at).toBeDefined()
    })
  })

  describe("getUserDisplayInfo", () => {
    it("extracts display information from user", () => {
      const result = getUserDisplayInfo(mockUser)
      
      expect(result.id).toBe("u_001")
      expect(result.email).toBe("test@example.com")
      expect(result.displayEmail).toBe("test@example.com")
      expect(result.walletBalance).toBe(1000)
    })
  })
})
