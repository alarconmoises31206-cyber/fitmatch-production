// infra/adapters/supabase-onboarding.adapter.ts
// Infrastructure implementation of OnboardingRepository WITH BUILT-IN LOGGING

import {
  OnboardingProgress,
  OnboardingRepository,
  OnboardingStep
} from '../../domain/onboarding/onboarding.types';

// BUILT-IN LOGGING - NO EXTERNAL DEPENDENCY
const createLogger = () => {
  const PREFIX = '[FITMATCH]';
  
  return {
    info: (event: string, data?: Record<string, any>) => {
      console.log(`${PREFIX} [INFO] ${event}`, data ? JSON.stringify(data) : '')
    },
    
    error: (event: string, data?: Record<string, any>) => {
      console.error(`${PREFIX} [ERROR] ${event}`, data ? JSON.stringify(data) : '')
    },
    
    warn: (event: string, data?: Record<string, any>) => {
      console.warn(`${PREFIX} [WARN] ${event}`, data ? JSON.stringify(data) : '')
    }
  }
}

const log = createLogger()

interface SupabaseClient {
  from(table: string): any;
}

export class SupabaseOnboardingRepository implements OnboardingRepository {
  constructor(private supabase: SupabaseClient) {}

  async getProgress(userId: string): Promise<OnboardingProgress | null> {
    try {
      log.info('onboarding.get_progress', { userId })
      
      const { data, error } = await this.supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // If no record exists, that's okay - return null
        if (error.code === 'PGRST116') {
          log.info('onboarding.get_progress_no_record', { userId })
          return null;
        }
        
        log.error('onboarding.get_progress_error', { userId, error: error.message })
        throw error;
      }

      log.info('onboarding.get_progress_result', { userId, found: true })
      return this.mapToDomain(data)
      
    } catch (error) {
      log.error('onboarding.get_progress_exception', { 
        userId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return null; // Gracefully handle errors
    }
  }

  async saveProgress(progress: OnboardingProgress): Promise<void> {
    try {
      log.info('onboarding.save_progress', {
        userId: progress.userId,
        userType: progress.userType,
        currentStep: progress.currentStep,
        completedSteps: progress.completedSteps?.length || 0
      })
      
      const dbData = this.mapToDatabase(progress)
      
      const { error } = await this.supabase
        .from('onboarding_progress')
        .upsert(dbData, { onConflict: 'user_id' })

      if (error) {
        log.error('onboarding.save_progress_error', {
          userId: progress.userId,
          error: error.message
        })
        throw error;
      }

      log.info('onboarding.save_progress_success', { userId: progress.userId })
      
    } catch (error) {
      log.error('onboarding.save_progress_exception', {
        userId: progress.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error;
    }
  }

  async markStepComplete(userId: string, step: OnboardingStep, data?: any): Promise<OnboardingProgress> {
    try {
      log.info('onboarding.mark_step_complete', { userId, step })
      
      // First get current progress
      const currentProgress = await this.getProgress(userId)
      
      if (!currentProgress) {
        // Auto-initialize with client type (most common)
        const initialProgress = {
          userId,
          userType: 'client', // Default to client
          currentStep: step,
          completedSteps: [step],
          data: { [step]: data || {} },
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        await this.saveProgress(initialProgress)
        log.info('onboarding.mark_step_complete_auto_init', { userId, step })
        return initialProgress;
      }

      // Update progress
      const updatedProgress: OnboardingProgress = {
        ...currentProgress,
        currentStep: step,
        completedSteps: [...new Set([...currentProgress.completedSteps, step])],
        data: { ...currentProgress.data, [step]: data || {} },
        updatedAt: new Date().toISOString()
      }

      await this.saveProgress(updatedProgress)
      
      log.info('onboarding.mark_step_complete_success', {
        userId,
        step,
        totalCompleted: updatedProgress.completedSteps.length
      })
      
      return updatedProgress;
      
    } catch (error) {
      log.error('onboarding.mark_step_complete_exception', { 
        userId, 
        step, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      throw error;
    }
  }

  async resetProgress(userId: string): Promise<void> {
    try {
      log.info('onboarding.reset_progress', { userId })
      
      const { error } = await this.supabase
        .from('onboarding_progress')
        .delete()
        .eq('user_id', userId)

      if (error) {
        log.error('onboarding.reset_progress_error', { userId, error: error.message })
        throw error;
      }

      log.info('onboarding.reset_progress_success', { userId })
      
    } catch (error) {
      log.error('onboarding.reset_progress_exception', { 
        userId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      throw error;
    }
  }

  private mapToDomain(dbData: any): OnboardingProgress {
    return {
      userId: dbData.user_id,
      userType: dbData.user_type,
      currentStep: dbData.current_step,
      completedSteps: dbData.completed_steps || [],
      data: dbData.data || {},
      startedAt: dbData.created_at || new Date().toISOString(),
      updatedAt: dbData.updated_at || new Date().toISOString()
    }
  }

  private mapToDatabase(progress: OnboardingProgress): any {
    return {
      user_id: progress.userId,
      user_type: progress.userType,
      current_step: progress.currentStep,
      completed_steps: progress.completedSteps,
      data: progress.data,
      created_at: progress.startedAt,
      updated_at: new Date().toISOString()
    }
  }
}

// Additional observability service for onboarding
export class OnboardingObservabilityService {
  static logOnboardingStarted(userId: string, userType: string) {
    log.info('onboarding.started', { userId, userType })
  }

  static logOnboardingCompleted(userId: string, userType: string, durationMs: number) {
    log.info('onboarding.completed', {
      userId,
      userType,
      durationMs,
      durationSeconds: Math.round(durationMs / 1000)
    })
  }

  static logStepCompletion(userId: string, step: string, stepDurationMs: number) {
    log.info('onboarding.step_completed', {
      userId,
      step,
      stepDurationMs
    })
  }

  static logOnboardingAbandoned(userId: string, userType: string, lastStep: string, progressPercentage: number) {
    log.warn('onboarding.abandoned', {
      userId,
      userType,
      lastStep,
      progressPercentage
    })
  }
}