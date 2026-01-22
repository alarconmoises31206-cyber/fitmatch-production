// domain/validation/validation.types.ts
// Domain validation types and interfaces
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}
export interface Validator<T> {
  validate(data: T): ValidationResult
}
// Domain-specific validation interfaces
export interface UserRegistrationData {
  email: string
  password: string
  name?: string
  userType: 'client' | 'trainer'
}
export interface TrainerProfileData {
  specialization: string
  experienceYears: number
  hourlyRate: number
  bio?: string
  certifications?: string[]
}
export interface SessionBookingData {
  trainerId: string
  clientId: string
  scheduledTime: string
  durationMinutes: number
  notes?: string
}
export interface PaymentData {
  amount: number
  currency: string
  description?: string
  metadata?: Record<string, any>
}

