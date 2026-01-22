import { z } from "zod";

// ==================== DOMAIN ENTITY SCHEMAS ====================

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  created_at: z.string(),
  updated_at: z.string(),
  wallet_balance: z.number(),
})

export const TrainerSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  specialization: z.string(),
  rating: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const MatchSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  trainer_id: z.string(),
  status: z.enum(['pending', 'accepted', 'rejected', 'completed']),
  created_at: z.string(),
  updated_at: z.string(),
})

export const SessionSchema = z.object({
  id: z.string(),
  match_id: z.string(),
  scheduled_time: z.string(),
  duration_minutes: z.number(),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  created_at: z.string(),
  updated_at: z.string(),
})

export const PaymentSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  amount_cents: z.number(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  stripe_payment_intent_id: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const SubscriptionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  plan_type: z.string(),
  status: z.enum(['active', 'canceled', 'past_due']),
  current_period_end: z.string(),
  stripe_subscription_id: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const ProfileSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional(),
  fitness_goals: z.array(z.string()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const OnboardingAttemptSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  step: z.string(),
  completed: z.boolean(),
  data: z.record(z.any()), // JSON data for the step
  created_at: z.string(),
  updated_at: z.string(),
})

// ==================== API REQUEST SCHEMAS ====================

export const CompleteQuestionnaireRequestSchema = z.object({
  role: z.enum(['client', 'trainer']),
  user_id: z.string(),
})

export const AnswerQuestionRequestSchema = z.object({
  question_id: z.string(),
  answer_text: z.string().min(1),
  conversation_id: z.string().optional(),
})

export const SendMessageRequestSchema = z.object({
  user_id: z.string(),
  trainer_id: z.string(),
  message: z.string().min(1),
})

export const StartConversationRequestSchema = z.object({
  matchId: z.string(),
  message: z.string().min(1),
})

export const SaveTrainerProfileRequestSchema = z.object({
  step: z.string(),
  data: z.record(z.any()),
  markComplete: z.boolean().optional().default(false),
})

export const CreateCheckoutSessionRequestSchema = z.object({
  cents: z.number().positive(),
  description: z.string().optional(),
})

export const PayoutStartRequestSchema = z.object({
  trainerId: z.string(),
  amount: z.number().positive(),
})

// ==================== WEBHOOK SCHEMAS ====================

export const StripeCheckoutSessionMetadataSchema = z.object({
  cents: z.string(),
  description: z.string().optional(),
  user_id: z.string(),
})

export const StripeCheckoutSessionSchema = z.object({
  id: z.string(),
  client_reference_id: z.string().nullable(),
  metadata: StripeCheckoutSessionMetadataSchema.nullable(),
})

// ==================== TYPE EXPORTS ====================

export type User = z.infer<typeof UserSchema>;
export type Trainer = z.infer<typeof TrainerSchema>;
export type Match = z.infer<typeof MatchSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type OnboardingAttempt = z.infer<typeof OnboardingAttemptSchema>;

export type CompleteQuestionnaireRequest = z.infer<typeof CompleteQuestionnaireRequestSchema>;
export type AnswerQuestionRequest = z.infer<typeof AnswerQuestionRequestSchema>;
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
export type StartConversationRequest = z.infer<typeof StartConversationRequestSchema>;
export type SaveTrainerProfileRequest = z.infer<typeof SaveTrainerProfileRequestSchema>;
export type CreateCheckoutSessionRequest = z.infer<typeof CreateCheckoutSessionRequestSchema>;
export type PayoutStartRequest = z.infer<typeof PayoutStartRequestSchema>;

export type StripeCheckoutSessionMetadata = z.infer<typeof StripeCheckoutSessionMetadataSchema>;
export type StripeCheckoutSession = z.infer<typeof StripeCheckoutSessionSchema>;
