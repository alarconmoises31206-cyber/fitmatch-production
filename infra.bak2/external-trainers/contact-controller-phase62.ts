// infra/external-trainers/contact-controller.ts (updated for Phase 62)
import { 
  ExternalContactRequest, 
  ExternalContactAttempt,
  ContactExternalTrainerResponse,
  ExternalTrainerProfile,
  ExternalSafetyFlag,
  ExternalRateLimit
} from './types';

// Add claim source type (matches database enum)
type ClaimSource = 'email_link' | 'in_app_reply' | 'reminder_banner' | 'admin_invite' | 'direct_link';

export class ExternalContactController {
  private readonly MAX_MESSAGE_LENGTH = 500;
  private readonly INITIAL_CONTACT_LIMIT = 1;
  private readonly REPLY_LIMIT = 1;
  private readonly RATE_LIMIT_WINDOW_HOURS = 24;
  private readonly RATE_LIMIT_MAX_CONTACTS = 10;

  /**
   * Generate claim invitation with source tracking (Phase 62)
   */
  private async generateClaimInvitation(
    contactAttemptId: string,
    trainerEmail: string,
    claimSource: ClaimSource = 'email_link',
    entryPointData: Record<string, any> = {}
  ): Promise<string> {
    // Generate secure token
    const token = this.generateSecureToken()
    
    // Create claim token record with source tracking
    await this.createClaimToken({
      token,
      contact_attempt_id: contactAttemptId,
      claimed_by_email: trainerEmail,
      claim_source: claimSource,
      entry_point_data: entryPointData,
      max_uses: 1,
      use_count: 0,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_revoked: false
    })

    // Update contact attempt
    await this.updateContactAttemptWithClaim(contactAttemptId, token)

    // Log claim source for analytics
    await this.logClaimSource({
      token,
      source: claimSource,
      entryPointData,
      trainerEmail,
      contactAttemptId
    })

    return token;
  }

  /**
   * Process trainer reply with claim source context
   */
  async recordTrainerReply(
    contactAttemptId: string,
    replyMessage: string,
    trainerEmail: string,
    claimSource?: ClaimSource,
    entryPointData?: Record<string, any>
  ): Promise<{ success: boolean; claimToken?: string }> {
    try {
      // 1. Validate this is a valid reply
      const canReply = await this.canTrainerReply(contactAttemptId)
      if (!canReply) {
        return { success: false }
      }

      // 2. Create reply contact attempt
      const replyAttempt = await this.createContactAttempt({
        client_id: '', // Will be set from original
        external_trainer_id: '', // Will be set from original
        message: replyMessage,
        trimmed_message: this.trimMessage(replyMessage),
        character_count: replyMessage.length,
        contact_type: 'reply',
        contact_sequence: 2,
        safety_scan_result: 'pending',
        delivery_status: 'pending',
        delivery_method: 'platform',
        trainer_replied: true
      })

      // 3. Update original contact attempt with reply info
      await this.updateContactAttemptReply(contactAttemptId, replyAttempt.id)

      // 4. Generate claim invitation with source tracking
      const claimToken = await this.generateClaimInvitation(
        contactAttemptId,
        trainerEmail,
        claimSource || 'in_app_reply',
        entryPointData || {}
      )

      return {
        success: true,
        claimToken
      }

    } catch (error) {
      console.error('Error recording trainer reply:', error)
      return { success: false }
    }
  }

  /**
   * Get canonical claim URL with source parameter
   */
  getCanonicalClaimUrl(token: string, source: ClaimSource = 'email_link'): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fitmatch.com';
    const url = new URL(`/claim/${token}`, baseUrl)
    
    // Add source parameter
    url.searchParams.set('source', source)
    
    // Add tracking parameters (for analytics)
    if (source === 'email_link') {
      url.searchParams.set('medium', 'email')
      url.searchParams.set('campaign', 'trainer_claim')
    } else if (source === 'in_app_reply') {
      url.searchParams.set('medium', 'in_app')
      url.searchParams.set('campaign', 'reply_flow')
    }
    
    return url.toString()
  }

  /**
   * Log claim source for analytics (Phase 62)
   */
  private async logClaimSource(data: {
    token: string;
    source: ClaimSource;
    entryPointData: Record<string, any>;
    trainerEmail: string;
    contactAttemptId: string;
  }): Promise<void> {
    // This would send to analytics service
    console.log('Claim source logged:', {
      token: data.token,
      source: data.source,
      timestamp: new Date().toISOString(),
      ...data.entryPointData
    })

    // In production, this would:
    // 1. Send to analytics platform (Mixpanel/Amplitude)
    // 2. Store in database for funnel analysis
    // 3. Trigger email/Slack notification for admin review
  }

  /**
   * Parse claim source from URL or context
   */
  parseClaimSource(context: {
    url?: string;
    referrer?: string;
    medium?: string;
    campaign?: string;
  }): { source: ClaimSource; entryPointData: Record<string, any> } {
    const { url, referrer, medium, campaign } = context;
    
    // Default to email link
    let source: ClaimSource = 'email_link';
    const entryPointData: Record<string, any> = {
      parsed_at: new Date().toISOString()
    }

    // Parse from URL parameters
    if (url) {
      try {
        const urlObj = new URL(url)
        const sourceParam = urlObj.searchParams.get('source')
        
        if (sourceParam && this.isValidClaimSource(sourceParam)) {
          source = sourceParam as ClaimSource;
        }
        
        // Capture all URL parameters for analytics
        urlObj.searchParams.forEach((value, key) => {
          entryPointData[`url_param_${key}`] = value;
        })
      } catch (error) {
        console.warn('Failed to parse URL for claim source:', error)
      }
    }

    // Determine source from referrer/medium
    if (referrer) {
      entryPointData.referrer = referrer;
      
      if (referrer.includes('mail.')) {
        source = 'email_link';
      } else if (referrer.includes('fitmatch.com')) {
        source = 'in_app_reply';
      }
    }

    if (medium) {
      entryPointData.medium = medium;
      if (medium === 'email') source = 'email_link';
      if (medium === 'in_app') source = 'in_app_reply';
      if (medium === 'banner') source = 'reminder_banner';
    }

    if (campaign) {
      entryPointData.campaign = campaign;
    }

    return { source, entryPointData }
  }

  /**
   * Validate claim source
   */
  private isValidClaimSource(source: string): source is ClaimSource {
    const validSources: ClaimSource[] = [
      'email_link',
      'in_app_reply', 
      'reminder_banner',
      'admin_invite',
      'direct_link'
    ];
    return validSources.includes(source as ClaimSource)
  }

  /**
   * Get claim source statistics (for admin dashboard)
   */
  async getClaimSourceStats(startDate: Date, endDate: Date): Promise<{
    bySource: Record<ClaimSource, number>;
    conversionRates: Record<ClaimSource, number>;
    trends: Array<{ date: string; sources: Record<ClaimSource, number> }>;
  }> {
    // This would query database
    // For now, return mock data structure
    
    const mockStats = {
      bySource: {
        email_link: 0,
        in_app_reply: 0,
        reminder_banner: 0,
        admin_invite: 0,
        direct_link: 0
      },
      conversionRates: {
        email_link: 0.25,
        in_app_reply: 0.35,
        reminder_banner: 0.15,
        admin_invite: 0.40,
        direct_link: 0.20
      },
      trends: []
    }

    // In production, this would:
    // 1. Query claim_tokens table grouped by source
    // 2. Calculate conversion rates (token created -> claim completed)
    // 3. Return time-series data for trends

    return mockStats;
  }

  // Updated mock database methods with source tracking
  private async createClaimToken(
    data: Partial<any> & { claim_source?: ClaimSource; entry_point_data?: Record<string, any> }
  ): Promise<void> {
    // Mock implementation - would include source tracking
    console.log('Creating claim token with source:', data.claim_source, data.entry_point_data)
  }

  // Rest of the existing methods remain the same...
  // [Previous contact controller code continues here]
}
