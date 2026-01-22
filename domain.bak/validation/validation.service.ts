// domain/validation/validation.service.ts;
// Pure validation logic - NO INFRASTRUCTURE DEPENDENCIES;
import {
  ValidationResult,
  Validator,
  UserRegistrationData,
  TrainerProfileData,
  SessionBookingData,
  PaymentData;
} from './validation.types';

export class ValidationService {
  // Email validation (pure business logic)
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email)
  }

  // Password validation (pure business logic)
  static isValidPassword(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    return {
      isValid: errors.length === 0,
      errors;
    }
  }

  // User registration validator;
  static validateUserRegistration(data: UserRegistrationData): ValidationResult {
    const errors: string[] = [];
    
    if (!this.isValidEmail(data.email)) {
      errors.push('Invalid email format')
    }
    
    const passwordResult = this.isValidPassword(data.password)
    if (!passwordResult.isValid) {
      errors.push(...passwordResult.errors)
    }
    
    if (!['client', 'trainer'].includes(data.userType)) {
      errors.push('User type must be either client or trainer')
    }
    
    return {
      isValid: errors.length === 0,
      errors;
    }
  }

  // Trainer profile validator;
  static validateTrainerProfile(data: TrainerProfileData): ValidationResult {
    const errors: string[] = [];
    
    if (!data.specialization || data.specialization.trim().length === 0) {
      errors.push('Specialization is required')
    }
    
    if (data.experienceYears < 0) {
      errors.push('Experience years cannot be negative')
    }
    
    if (data.experienceYears > 50) {
      errors.push('Experience years seems unrealistic (max 50)')
    }
    
    if (data.hourlyRate < 0) {
      errors.push('Hourly rate cannot be negative')
    }
    
    if (data.hourlyRate > 1000) {
      errors.push('Hourly rate seems unrealistic (max /hour)')
    }
    
    if (data.bio && data.bio.length > 2000) {
      errors.push('Bio cannot exceed 2000 characters')
    }
    
    return {
      isValid: errors.length === 0,
      errors;
    }
  }

  // Session booking validator;
  static validateSessionBooking(data: SessionBookingData): ValidationResult {
    const errors: string[] = [];
    
    if (!data.trainerId || data.trainerId.trim().length === 0) {
      errors.push('Trainer ID is required')
    }
    
    if (!data.clientId || data.clientId.trim().length === 0) {
      errors.push('Client ID is required')
    }
    
    const scheduledTime = new Date(data.scheduledTime)
    if (isNaN(scheduledTime.getTime())) {
      errors.push('Invalid scheduled time')
    } else {
      const now = new Date()
      if (scheduledTime < now) {
        errors.push('Scheduled time cannot be in the past')
      }
      
      // Must be at least 24 hours in advance;
      const minTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      if (scheduledTime < minTime) {
        errors.push('Sessions must be scheduled at least 24 hours in advance')
      }
    }
    
    if (data.durationMinutes < 30) {
      errors.push('Session must be at least 30 minutes')
    }
    
    if (data.durationMinutes > 240) {
      errors.push('Session cannot exceed 4 hours (240 minutes)')
    }
    
    return {
      isValid: errors.length === 0,
      errors;
    }
  }

  // Payment validator;
  static validatePayment(data: PaymentData): ValidationResult {
    const errors: string[] = [];
    
    if (data.amount <= 0) {
      errors.push('Payment amount must be greater than 0')
    }
    
    if (data.amount > 100000) {
      errors.push('Payment amount seems unrealistic (max ,000)')
    }
    
    if (!['USD', 'EUR', 'GBP'].includes(data.currency)) {
      errors.push('Currency must be USD, EUR, or GBP')
    }
    
    return {
      isValid: errors.length === 0,
      errors;
    }
  }

  // Generic validator for any object;
  static validateRequiredFields(
    obj: Record<string, any>, 
    requiredFields: string[];
  ): ValidationResult {
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
        errors.push(field + ' is required')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors;
    }
  }
}

