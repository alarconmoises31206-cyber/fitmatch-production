import { 
  UserSchema, 
  TrainerSchema, 
  MatchSchema, 
  SessionSchema, 
  PaymentSchema, 
  SubscriptionSchema, 
  ProfileSchema, 
  OnboardingAttemptSchema 
} from "@/domain/schemas";

export const dbUserToDomain = (row: any) =>
  UserSchema.parse(row)

export const dbTrainerToDomain = (row: any) =>
  TrainerSchema.parse(row)

export const dbMatchToDomain = (row: any) =>
  MatchSchema.parse(row)

export const dbSessionToDomain = (row: any) =>
  SessionSchema.parse(row)

export const dbPaymentToDomain = (row: any) =>
  PaymentSchema.parse(row)

export const dbSubscriptionToDomain = (row: any) =>
  SubscriptionSchema.parse(row)

export const dbProfileToDomain = (row: any) =>
  ProfileSchema.parse(row)

export const dbOnboardingAttemptToDomain = (row: any) =>
  OnboardingAttemptSchema.parse(row)

