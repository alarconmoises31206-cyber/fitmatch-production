// lib/validators.ts
import { z } from 'zod';

export const createConnectOnboardSchema = z.object({
  trainer_id: z.string().uuid('Valid trainer ID required'),
});

export const createTrainerCheckoutSchema = z.object({
  trainer_id: z.string().uuid('Valid trainer ID required'),
});

export const spendCreditsSchema = z.object({
  trainer_id: z.string().uuid('Valid trainer ID required'),
  user_id: z.string().uuid('Valid user ID required').optional(),
});

export const matchRequestSchema = z.object({
  user_id: z.string().uuid('Valid user ID required'),
  limit: z.number().min(1).max(100).optional().default(20),
});

export const webhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any()
  }),
  created: z.number()
});