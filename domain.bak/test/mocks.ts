import { vi } from "vitest";
import { UserSchema, TrainerSchema, MatchSchema, PaymentSchema } from "../schemas";

export const mockUser = UserSchema.parse({
  id: "u_001",
  email: "test@example.com",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  wallet_balance: 1000,
})

export const mockTrainer = TrainerSchema.parse({
  id: "t_001",
  user_id: "u_001",
  specialization: "Fitness",
  rating: 4.5,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
})

export const mockMatch = MatchSchema.parse({
  id: "m_001",
  user_id: "u_001",
  trainer_id: "t_001",
  status: "pending",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
})

export const mockPayment = PaymentSchema.parse({
  id: "p_001",
  user_id: "u_001",
  amount_cents: 5000,
  status: "pending",
  stripe_payment_intent_id: "pi_123",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
})

export const stubPorts = {
  userPort: {
    save: vi.fn(),
    getById: vi.fn(),
  },
  trainerPort: {
    getEarnings: vi.fn().mockResolvedValue(1000),
  },
  matchPort: {
    create: vi.fn(),
    updateStatus: vi.fn(),
  },
  paymentPort: {
    process: vi.fn(),
    getStatus: vi.fn(),
  }
}
