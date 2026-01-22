// lib/validators.ts - Updated to use domain validation;
// Bridge file - maintains old API while using new architecture;

import { ValidationService } from '../domain/validation/validation.service';
import type { 
  UserRegistrationData,
  TrainerProfileData,
  SessionBookingData,
  PaymentData 
} from '../domain/validation/validation.types';

// Re-export domain types for backward compatibility;
export type { UserRegistrationData, TrainerProfileData, SessionBookingData, PaymentData }

// Old API compatibility;
export const createConnectOnboardSchema = {
  parse: (data: any) => {
    // Use domain validation;
    const result = ValidationService.validateRequiredFields(data, ['email', 'password', 'userType'])
    if (!result.isValid) {
      throw new Error(result.errors.join(', '))
    }
    return data;
  }
}

// Additional validation functions using domain service;
export const validateEmail = (email: string): boolean => {
  return ValidationService.isValidEmail(email)
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  return ValidationService.isValidPassword(password)
}

export const validateUserRegistration = (data: UserRegistrationData): { isValid: boolean; errors: string[] } => {
  return ValidationService.validateUserRegistration(data)
}

export const validateTrainerProfile = (data: TrainerProfileData): { isValid: boolean; errors: string[] } => {
  return ValidationService.validateTrainerProfile(data)
}

export const validateSessionBooking = (data: SessionBookingData): { isValid: boolean; errors: string[] } => {
  return ValidationService.validateSessionBooking(data)
}

export const validatePayment = (data: PaymentData): { isValid: boolean; errors: string[] } => {
  return ValidationService.validatePayment(data)
}

// Legacy function name for backward compatibility;
export const validateRequiredFields = (
  obj: Record<string, any>,
  requiredFields: string[];
): { isValid: boolean; errors: string[] } => {
  return ValidationService.validateRequiredFields(obj, requiredFields)
}

