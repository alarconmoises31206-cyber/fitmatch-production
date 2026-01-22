import { z } from "zod";

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
  data: z.record(z.any()), // JSON data for the step - more specific than z.any()
  created_at: z.string(),
  updated_at: z.string(),
})

export const PayoutStartRequestSchema = z.object({
  trainerId: z.string(),
  amount: z.number().positive(),
})

export type User = z.infer<typeof UserSchema>;
export type Trainer = z.infer<typeof TrainerSchema>;
export type Match = z.infer<typeof MatchSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type OnboardingAttempt = z.infer<typeof OnboardingAttemptSchema>;
export type PayoutStartRequest = z.infer<typeof PayoutStartRequestSchema>;

// API Request Schemas
export const CompleteQuestionnaireRequestSchema = z.object({
  role: z.enum(['client', 'trainer']),
  user_id: z.string(),
  // Note: Add questionnaire data fields as needed
})

export const AnswerQuestionRequestSchema = z.object({
  question_id: z.string(),
  answer: z.string(),
  conversation_id: z.string().optional(),
})

export const SendMessageRequestSchema = z.object({
  conversation_id: z.string(),
  content: z.string(),
  sender_id: z.string(),
  sender_role: z.enum(['client', 'trainer']),
})

export const StartConversationRequestSchema = z.object({
  trainer_id: z.string(),
  initial_message: z.string(),
  client_id: z.string(),
})

export const SaveTrainerProfileRequestSchema = z.object({
  // This will be more complex - for now basic structure
  step: z.string(),
  data: z.record(z.any()),
})

export const CreateCheckoutSessionRequestSchema = z.object({
  amount_cents: z.number().positive(),
  user_id: z.string(),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
})

// Webhook schemas
export const StripeWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.record(z.any())
  })
})

// Export types
export type CompleteQuestionnaireRequest = z.infer<typeof CompleteQuestionnaireRequestSchema>;
export type AnswerQuestionRequest = z.infer<typeof AnswerQuestionRequestSchema>;
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
export type StartConversationRequest = z.infer<typeof StartConversationRequestSchema>;
export type SaveTrainerProfileRequest = z.infer<typeof SaveTrainerProfileRequestSchema>;
export type CreateCheckoutSessionRequest = z.infer<typeof CreateCheckoutSessionRequestSchema>;
export type StripeWebhook = z.infer<typeof StripeWebhookSchema>;
// Update SaveTrainerProfileRequestSchema
export const SaveTrainerProfileRequestSchema = z.object({
  step: z.string(),
  data: z.record(z.any()),
  markComplete: z.boolean().optional().default(false),
})
// Update AnswerQuestionRequestSchema to match actual API
export const AnswerQuestionRequestSchema = z.object({
  question_id: z.string(),
  answer_text: z.string().min(1),
  conversation_id: z.string().optional(),
})
// Update SendMessageRequestSchema to match actual API
export const SendMessageRequestSchema = z.object({
  user_id: z.string(),
  trainer_id: z.string(),
  message: z.string().min(1),
})
// Update StartConversationRequestSchema to match actual API
export const StartConversationRequestSchema = z.object({
  matchId: z.string(),
  message: z.string().min(1),
})
// Update CreateCheckoutSessionRequestSchema to match actual API
export const CreateCheckoutSessionRequestSchema = z.object({
  cents: z.number().positive(),
  description: z.string().optional(),
})
// Update StripeWebhookSchema for actual webhook structure
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

export type StripeCheckoutSessionMetadata = z.infer<typeof StripeCheckoutSessionMetadataSchema>;
export type StripeCheckoutSession = z.infer<typeof StripeCheckoutSessionSchema>;

