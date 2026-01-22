// domain/onboarding/onboarding.types.ts
// Domain types for onboarding business logic

export type OnboardingStep = 
  | 'profile_basic'
  | 'profile_demographics'
  | 'profile_philosophy'
  | 'profile_training_style'
  | 'profile_communication'
  | 'profile_pricing'
  | 'profile_availability'
  | 'complete'

export type UserType = 'client' | 'trainer'

export interface OnboardingProgress {
  userId: string
  userType: UserType
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  data: Record<string, any>
  startedAt: string
  completedAt?: string
}
