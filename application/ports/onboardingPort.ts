// application/ports/onboardingPort.ts
export interface OnboardingPort {
  /**
   * Start onboarding checklist for a user
   */
  startChecklist(userId: string, userType: 'client' | 'trainer'): Promise<{ success: boolean; checklistId?: string }>;
  
  /**
   * Update trainer availability in matching system
   */
  updateTrainerAvailability(trainerId: string, isAvailable: boolean): Promise<{ success: boolean }>;
  
  /**
   * Send welcome notifications
   */
  sendWelcomeNotification(userId: string, userType: 'client' | 'trainer'): Promise<{ success: boolean; notificationId?: string }>;
  
  /**
   * Alert matching system about new trainer
   */
  alertMatchingSystem(trainerId: string, specializations: string[]): Promise<{ success: boolean }>;
}

// Default implementation that throws if not properly injected
export const onboardingPort: OnboardingPort = {
  startChecklist: async () => {
    throw new Error('OnboardingPort.startChecklist not implemented - ensure dependency injection')
  },
  updateTrainerAvailability: async () => {
    throw new Error('OnboardingPort.updateTrainerAvailability not implemented - ensure dependency injection')
  },
  sendWelcomeNotification: async () => {
    throw new Error('OnboardingPort.sendWelcomeNotification not implemented - ensure dependency injection')
  },
  alertMatchingSystem: async () => {
    throw new Error('OnboardingPort.alertMatchingSystem not implemented - ensure dependency injection')
  }
}
