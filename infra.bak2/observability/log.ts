// infra/observability/log.ts
// Logging utilities for infrastructure layer - COMPATIBILITY VERSION

// Create the logger object
const createLogger = () => {
  const PREFIX = '[FITMATCH]';

  const logger = {
    info: (event: string, data?: Record<string, any>) => {
      console.log(`${PREFIX} [INFO] ${event}`, data ? JSON.stringify(data, null, 2) : '')
    },

    error: (event: string, data?: Record<string, any>) => {
      console.error(`${PREFIX} [ERROR] ${event}`, data ? JSON.stringify(data, null, 2) : '')
    },

    warn: (event: string, data?: Record<string, any>) => {
      console.warn(`${PREFIX} [WARN] ${event}`, data ? JSON.stringify(data, null, 2) : '')
    },

    debug: (event: string, data?: Record<string, any>) => {
      console.debug(`${PREFIX} [DEBUG] ${event}`, data ? JSON.stringify(data, null, 2) : '')
    }
  }

  return logger;
}

// Create logger instance
const logger = createLogger()

// Export the logger object (for methods like logger.info())
export { logger }

// Export as default
export default logger;

// Export createLogger function
export { createLogger }

// Export individual functions for backward compatibility
// These are functions that call the corresponding logger method
export const log = (event: string, data?: Record<string, any>) => logger.info(event, data)
export const error = (event: string, data?: Record<string, any>) => logger.error(event, data)
export const warn = (event: string, data?: Record<string, any>) => logger.warn(event, data)
export const debug = (event: string, data?: Record<string, any>) => logger.debug(event, data)
export const info = (event: string, data?: Record<string, any>) => logger.info(event, data)

// Note: For files that use logger.info(), they should import { logger } and use logger.info()
// For files that use log(), they should import { log } and use log()

// Classes from the original file (keeping for compatibility)
import {
  OnboardingProgress,
  OnboardingRepository,
  OnboardingStep
} from '../../domain/onboarding/onboarding.types';

interface SupabaseClient {
  from(table: string): any;
}

export class SupabaseOnboardingRepository implements OnboardingRepository {
  constructor(private supabase: SupabaseClient) {}

  async getProgress(userId: string): Promise<OnboardingProgress | null> {
    try {
      logger.info('onboarding.get_progress', { userId })

      const { data, error } = await this.supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('onboarding.get_progress_error', { userId, error: error.message })
        throw error;
      }

      return data as OnboardingProgress;
    } catch (err) {
      logger.error('onboarding.get_progress_exception', { userId, error: (err as Error).message })
      return null;
    }
  }

  async saveProgress(progress: OnboardingProgress): Promise<void> {
    try {
      logger.info('onboarding.save_progress', { userId: progress.userId })

      const { error } = await this.supabase
        .from('onboarding_progress')
        .upsert(progress)

      if (error) {
        logger.error('onboarding.save_progress_error', { 
          userId: progress.userId, 
          error: error.message 
        })
        throw error;
      }
    } catch (err) {
      logger.error('onboarding.save_progress_exception', { 
        userId: progress.userId, 
        error: (err as Error).message 
      })
      throw err;
    }
  }

  async markStepComplete(userId: string, step: OnboardingStep, data?: any): Promise<OnboardingProgress> {
    try {
      logger.info('onboarding.mark_step_complete', { userId, step })

      let progress = await this.getProgress(userId)
      
      if (!progress) {
        const initialProgress: OnboardingProgress = {
          userId,
          userType: 'client' as any,
          currentStep: step,
          completedSteps: [step],
          data: { [step]: data },
          startedAt: new Date().toISOString()
        }

        await this.saveProgress(initialProgress)
        logger.info('onboarding.mark_step_complete_auto_init', { userId, step })
        return initialProgress;
      }

      progress.currentStep = step;
      if (!progress.completedSteps.includes(step)) {
        progress.completedSteps.push(step)
      }
      progress.data = { ...progress.data, [step]: data }

      await this.saveProgress(progress)
      return progress;
    } catch (err) {
      logger.error('onboarding.mark_step_complete_error', { 
        userId, 
        step, 
        error: (err as Error).message 
      })
      throw err;
    }
  }

  async resetProgress(userId: string): Promise<void> {
    try {
      logger.info('onboarding.reset_progress', { userId })

      const { error } = await this.supabase
        .from('onboarding_progress')
        .delete()
        .eq('user_id', userId)

      if (error) {
        logger.error('onboarding.reset_progress_error', { userId, error: error.message })
        throw error;
      }
    } catch (err) {
      logger.error('onboarding.reset_progress_exception', { 
        userId, 
        error: (err as Error).message 
      })
      throw err;
    }
  }
}

export class OnboardingObservabilityService {
  constructor(private repository: OnboardingRepository) {}

  async trackStepCompletion(userId: string, step: OnboardingStep, metadata?: any) {
    logger.info('onboarding.track_step_completion', { userId, step, metadata })
    
    try {
      const progress = await this.repository.markStepComplete(userId, step, metadata)
      logger.info('onboarding.track_step_completion_success', { userId, step })
      return progress;
    } catch (err) {
      logger.error('onboarding.track_step_completion_error', { 
        userId, 
        step, 
        error: (err as Error).message 
      })
      throw err;
    }
  }

  async getOnboardingStatus(userId: string) {
    logger.info('onboarding.get_status', { userId })
    
    const progress = await this.repository.getProgress(userId)
    const status = {
      hasProgress: !!progress,
      currentStep: progress?.currentStep || 'not_started',
      completedSteps: progress?.completedSteps || [],
      isComplete: progress?.currentStep === 'complete'
    }
    
    logger.info('onboarding.get_status_result', { userId, status })
    return status;
  }
}
