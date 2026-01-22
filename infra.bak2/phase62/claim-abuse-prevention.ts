// infra/phase62/claim-abuse-prevention.ts
import { supabase } from '../../lib/supabase/client';

export interface ClaimValidationResult {
  isValid: boolean;
  error?: 'expired' | 'revoked' | 'max_uses' | 'already_claimed' | 'invalid' | 'abandoned';
  message?: string;
  canRetry?: boolean;
  retryMethod?: 'new_token' | 'contact_support' | 'wait';
}

export interface DuplicateClaimCheck {
  isDuplicate: boolean;
  existingTrainerId?: string;
  existingUserId?: string;
  claimedAt?: string;
  message?: string;
}

export interface AbandonedFlowRecovery {
  hasAbandonedFlow: boolean;
  abandonedToken?: string;
  abandonedAt?: string;
  canRecover: boolean;
  recoveryToken?: string;
  recoveryMethod?: 'resend_email' | 'new_flow' | 'contact_support';
}

export class ClaimAbusePrevention {
  
  /**
   * Validate claim token with comprehensive checks
   */
  async validateClaimToken(token: string, trainerEmail?: string): Promise<ClaimValidationResult> {
    // Check token format
    if (!token || token.length < 32) {
      return {
        isValid: false,
        error: 'invalid',
        message: 'Invalid claim token format'
      }
    }
    
    // Get token from database
    const { data: claimToken, error } = await supabase
      .from('external_claim_tokens')
      .select('*')
      .eq('token', token)
      .single()
    
    if (error || !claimToken) {
      return {
        isValid: false,
        error: 'invalid',
        message: 'Claim token not found'
      }
    }
    
    // Check if revoked
    if (claimToken.is_revoked) {
      return {
        isValid: false,
        error: 'revoked',
        message: 'This claim link has been revoked',
        canRetry: false
      }
    }
    
    // Check if expired
    const expiresAt = new Date(claimToken.expires_at)
    if (new Date() > expiresAt) {
      return {
        isValid: false,
        error: 'expired',
        message: 'This claim link has expired',
        canRetry: true,
        retryMethod: 'new_token'
      }
    }
    
    // Check max uses
    if (claimToken.use_count >= claimToken.max_uses) {
      return {
        isValid: false,
        error: 'max_uses',
        message: 'This claim link has already been used',
        canRetry: false
      }
    }
    
    // Check if already claimed by this email
    if (trainerEmail && claimToken.claimed_by_email === trainerEmail) {
      // Check if there's already a trainer profile for this claim
      const { data: existingTrainer } = await supabase
        .from('external_trainers')
        .select('status, claimed_by_user_id')
        .eq('id', claimToken.external_trainer_id)
        .single()
      
      if (existingTrainer?.status === 'claimed' && existingTrainer.claimed_by_user_id) {
        return {
          isValid: false,
          error: 'already_claimed',
          message: 'This trainer profile has already been claimed',
          canRetry: false
        }
      }
    }
    
    // Check for suspicious patterns (rate limiting)
    const isSuspicious = await this.checkSuspiciousPatterns(token, trainerEmail)
    if (isSuspicious) {
      return {
        isValid: false,
        error: 'invalid',
        message: 'Suspicious activity detected',
        canRetry: false
      }
    }
    
    return {
      isValid: true,
      message: 'Token is valid'
    }
  }
  
  /**
   * Check for duplicate claims (same trainer, different tokens)
   */
  async checkDuplicateClaim(
    externalTrainerId: string,
    trainerEmail: string
  ): Promise<DuplicateClaimCheck> {
    // Check if trainer already claimed
    const { data: existingClaim, error } = await supabase
      .from('external_claim_tokens')
      .select('token, claimed_by_user_id, claimed_at')
      .eq('external_trainer_id', externalTrainerId)
      .eq('claimed_by_email', trainerEmail)
      .eq('is_revoked', false)
      .order('claimed_at', { ascending: false })
      .limit(1)
    
    if (error || !existingClaim || existingClaim.length === 0) {
      return {
        isDuplicate: false
      }
    }
    
    const claim = existingClaim[0];
    
    // If already claimed and has a user ID, it's a duplicate
    if (claim.claimed_by_user_id) {
      return {
        isDuplicate: true,
        existingTrainerId: externalTrainerId,
        existingUserId: claim.claimed_by_user_id,
        claimedAt: claim.claimed_at,
        message: 'This trainer profile has already been claimed with this email'
      }
    }
    
    return {
      isDuplicate: false
    }
  }
  
  /**
   * Handle abandoned claim flows
   */
  async checkAbandonedFlow(
    externalTrainerId: string,
    trainerEmail: string
  ): Promise<AbandonedFlowRecovery> {
    // Look for incomplete claims (token used but no trainer profile created)
    const { data: incompleteClaims, error } = await supabase
      .from('external_claim_tokens')
      .select('token, claimed_at, use_count')
      .eq('external_trainer_id', externalTrainerId)
      .eq('claimed_by_email', trainerEmail)
      .eq('is_revoked', false)
      .gt('use_count', 0)
      .order('claimed_at', { ascending: false })
      .limit(5)
    
    if (error || !incompleteClaims || incompleteClaims.length === 0) {
      return {
        hasAbandonedFlow: false,
        canRecover: false
      }
    }
    
    // Check if any incomplete claims are recent (< 24 hours)
    const recentAbandoned = incompleteClaims.filter(claim => {
      const claimedAt = new Date(claim.claimed_at)
      const hoursSince = (new Date().getTime() - claimedAt.getTime()) / (1000 * 60 * 60)
      return hoursSince < 24;
    })
    
    if (recentAbandoned.length === 0) {
      return {
        hasAbandonedFlow: true,
        abandonedToken: incompleteClaims[0].token,
        abandonedAt: incompleteClaims[0].claimed_at,
        canRecover: false,
        recoveryMethod: 'new_flow'
      }
    }
    
    // Most recent abandoned claim
    const abandoned = recentAbandoned[0];
    
    // Check if we can recover this flow
    const canRecover = await this.canRecoverAbandonedFlow(abandoned.token)
    
    return {
      hasAbandonedFlow: true,
      abandonedToken: abandoned.token,
      abandonedAt: abandoned.claimed_at,
      canRecover,
      recoveryToken: canRecover ? abandoned.token : undefined,
      recoveryMethod: canRecover ? 'resend_email' : 'new_flow'
    }
  }
  
  /**
   * Prevent claim link reuse by marking token as used
   */
  async preventTokenReuse(token: string): Promise<boolean> {
    const { error } = await supabase
      .from('external_claim_tokens')
      .update({
        use_count: supabase.rpc('increment', { x: 1 }),
        claimed_at: new Date().toISOString()
      })
      .eq('token', token)
    
    if (error) {
      console.error('Error preventing token reuse:', error)
      return false;
    }
    
    return true;
  }
  
  /**
   * Block duplicate claims by email/IP
   */
  async blockDuplicateClaimByIp(
    ipAddress: string,
    externalTrainerId: string
  ): Promise<{ blocked: boolean; reason?: string }> {
    // Check for multiple claims from same IP in last 24 hours
    const { data: recentClaims, error } = await supabase
      .from('claim_attempts') // This table would need to be created
      .select('id, created_at')
      .eq('ip_address', ipAddress)
      .eq('external_trainer_id', externalTrainerId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    
    if (error) {
      // Table might not exist
      return { blocked: false }
    }
    
    if (recentClaims && recentClaims.length >= 3) {
      return {
        blocked: true,
        reason: 'Too many claim attempts from this IP address'
      }
    }
    
    return { blocked: false }
  }
  
  /**
   * Handle partial profile creation (graceful fallback)
   */
  async handlePartialProfile(
    trainerId: string,
    partialData: Record<string, any>
  ): Promise<{ success: boolean; completedFields: string[]; missingFields: string[] }> {
    const requiredFields = [
      'specialties',
      'experience_years', 
      'availability',
      'timezone'
    ];
    
    const completedFields: string[] = [];
    const missingFields: string[] = [];
    
    // Check which required fields are present
    for (const field of requiredFields) {
      if (partialData[field] !== undefined && partialData[field] !== null && partialData[field] !== '') {
        completedFields.push(field)
      } else {
        missingFields.push(field)
      }
    }
    
    // If we have at least some data, save what we have
    if (completedFields.length > 0) {
      const { error } = await supabase
        .from('trainer_profiles_partial')
        .upsert({
          trainer_id: trainerId,
          profile_data: partialData,
          completed_fields: completedFields,
          missing_fields: missingFields,
          last_updated: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error saving partial profile:', error)
        return {
          success: false,
          completedFields: [],
          missingFields: requiredFields
        }
      }
      
      // Schedule a reminder to complete the profile
      await this.scheduleProfileCompletionReminder(trainerId, missingFields)
    }
    
    return {
      success: completedFields.length > 0,
      completedFields,
      missingFields
    }
  }
  
  /**
   * Check for suspicious patterns (rate limiting, etc.)
   */
  private async checkSuspiciousPatterns(token: string, email?: string): Promise<boolean> {
    // Check token attempts from same IP (would need IP tracking)
    // For now, implement basic rate limiting
    
    if (email) {
      // Check if this email has attempted too many claims recently
      const { data: attempts, error } = await supabase
        .from('external_claim_tokens')
        .select('created_at')
        .eq('claimed_by_email', email)
        .gte('created_at', new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()) // Last hour
      
      if (!error && attempts && attempts.length > 5) {
        return true; // Too many attempts in short period
      }
    }
    
    return false;
  }
  
  /**
   * Check if abandoned flow can be recovered
   */
  private async canRecoverAbandonedFlow(token: string): Promise<boolean> {
    const { data: claimToken, error } = await supabase
      .from('external_claim_tokens')
      .select('expires_at, is_revoked')
      .eq('token', token)
      .single()
    
    if (error || !claimToken) {
      return false;
    }
    
    // Can recover if not expired and not revoked
    const expiresAt = new Date(claimToken.expires_at)
    return new Date() <= expiresAt && !claimToken.is_revoked;
  }
  
  /**
   * Schedule reminder to complete profile
   */
  private async scheduleProfileCompletionReminder(
    trainerId: string,
    missingFields: string[]
  ): Promise<void> {
    // This would integrate with your notification system
    // For now, just log
    console.log(`Scheduled profile completion reminder for trainer ${trainerId}`)
    console.log(`Missing fields: ${missingFields.join(', ')}`)
  }
  
  /**
   * Record claim attempt for abuse detection
   */
  async recordClaimAttempt(
    token: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // This would insert into claim_attempts table
    // For now, just log
    console.log(`Claim attempt recorded:`, { token, ipAddress, userAgent })
  }
  
  /**
   * Get claim status for debugging
   */
  async getClaimStatus(token: string): Promise<any> {
    const { data: claimToken, error } = await supabase
      .from('external_claim_tokens')
      .select('*')
      .eq('token', token)
      .single()
    
    if (error) {
      return { error: 'Token not found' }
    }
    
    const validation = await this.validateClaimToken(token)
    
    return {
      token: claimToken.token,
      external_trainer_id: claimToken.external_trainer_id,
      claimed_by_email: claimToken.claimed_by_email,
      claimed_by_user_id: claimToken.claimed_by_user_id,
      claimed_at: claimToken.claimed_at,
      expires_at: claimToken.expires_at,
      is_revoked: claimToken.is_revoked,
      use_count: claimToken.use_count,
      max_uses: claimToken.max_uses,
      validation
    }
  }
}
