// src/lib/onboarding.ts - SIMPLIFIED VERSION
// Simple onboarding functions for demo


export type OnboardingStep = 
  | 'welcome'
  | 'profile_basic'
  | 'questionnaire'
  | 'matches_viewed'
  | 'first_conversation'
  | 'first_message_sent'
  | 'complete';

export interface OnboardingProgress {
  userId: string;
  userType: 'client' | 'trainer';
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  data: Record<string, any>;
  startedAt: string;
  updatedAt: string;
}

/**
 * Simple function to record matches viewed (demo version)
 */
// src/lib/onboarding.ts
export async function recordMatchesViewed(userId: string): Promise<void> {
  try {
    // DEMO MODE: Skip database operations
    console.log('PHASE33: [DEMO] Matches view would be recorded for:', userId);
    
    // Optional: Store in localStorage for demo
    if (typeof window !== 'undefined') {
      const demoData = JSON.parse(localStorage.getItem('demo_onboarding') || '{}');
      demoData[userId] = {
        ...demoData[userId],
        matches_viewed: true,
        viewed_at: new Date().toISOString()
      };
      localStorage.setItem('demo_onboarding', JSON.stringify(demoData));
    }
    
    // Don't try to access database in demo mode
    return Promise.resolve();
    
  } catch (error) {
    console.warn('PHASE33: Demo mode - continuing without database:', error);
    return Promise.resolve(); // Don't throw errors
  }
}

/**
 * Simple demo functions (return empty/default values)
 */
export async function getOnboardingProgress(userId: string): Promise<OnboardingProgress | null> {
  return null; // Demo - return null
}

export async function initializeOnboarding(userId: string, userType: 'client' | 'trainer'): Promise<OnboardingProgress> {
  return {
    userId,
    userType,
    currentStep: 'welcome',
    completedSteps: ['welcome'],
    data: {},
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export async function markStepComplete(userId: string, step: OnboardingStep, data?: any): Promise<OnboardingProgress> {
  return {
    userId,
    userType: 'client',
    currentStep: step,
    completedSteps: [step],
    data: { [step]: data || {} },
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export async function getOnboardingStatus(userId: string): Promise<{
  progress: OnboardingProgress | null;
  validation: { isValid: boolean; missingRequirements: string[]; canProceed: boolean };
  completionPercentage: number;
  isComplete: boolean;
}> {
  return {
    progress: null,
    validation: { isValid: false, missingRequirements: [], canProceed: false },
    completionPercentage: 0,
    isComplete: false
  };
}

// Export empty functions for compatibility
export function getNextStep(): OnboardingStep | null { return null; }
export function validateProgress(): any { return { isValid: true }; }
export function calculateCompletionPercentage(): number { return 0; }
export function isOnboardingComplete(): boolean { return false; }
export function getInitialProgress(): any { return null; }