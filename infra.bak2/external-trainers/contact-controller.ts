// infra/external-trainers/contact-controller.ts
import { 
  ExternalContactRequest, 
  ExternalContactAttempt,
  ContactExternalTrainerResponse,
  ExternalTrainerProfile,
  ExternalSafetyFlag,
  ExternalRateLimit
} from './types';

export class ExternalContactController {
  private readonly MAX_MESSAGE_LENGTH = 500;
  private readonly INITIAL_CONTACT_LIMIT = 1; // One initial message per client-trainer pair
  private readonly REPLY_LIMIT = 1; // One reply allowed from trainer
  private readonly RATE_LIMIT_WINDOW_HOURS = 24;
  private readonly RATE_LIMIT_MAX_CONTACTS = 10;

  /**
   * Validate and process contact request to external trainer
   */
  async processContactRequest(
    request: ExternalContactRequest,
    clientIp: string,
    userAgent: string
  ): Promise<ContactExternalTrainerResponse> {
    try {
      // 1. Validate message length
      if (!this.validateMessageLength(request.message)) {
        return {
          success: false,
          contactAttemptId: '',
          message: `Message exceeds ${this.MAX_MESSAGE_LENGTH} character limit`,
          deliveryStatus: 'blocked',
          safetyScanResult: 'clean'
        }
      }

      // 2. Check rate limits
      const rateLimitCheck = await this.checkRateLimits(request.clientId, clientIp)
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          contactAttemptId: '',
          message: `Rate limit exceeded: ${rateLimitCheck.reason}`,
          deliveryStatus: 'blocked',
          safetyScanResult: 'clean'
        }
      }

      // 3. Check if client already contacted this trainer (for initial contacts)
      if (request.contactType === 'initial') {
        const hasExistingContact = await this.hasExistingContact(
          request.clientId,
          request.externalTrainerId
        )
        
        if (hasExistingContact) {
          return {
            success: false,
            contactAttemptId: '',
            message: 'You have already contacted this trainer. They must join FitMatch to continue.',
            deliveryStatus: 'blocked',
            safetyScanResult: 'clean'
          }
        }
      }

      // 4. Safety scan
      const safetyScan = await this.performSafetyScan(request.message, clientIp)
      
      if (safetyScan.blocked) {
        // Record safety flag
        await this.recordSafetyFlag({
          external_trainer_id: request.externalTrainerId,
          flag_type: safetyScan.flagType,
          severity: safetyScan.severity,
          details: { message: request.message, reason: safetyScan.reason },
          action_taken: 'blocked'
        })
        
        return {
          success: false,
          contactAttemptId: '',
          message: 'Message blocked by safety filters',
          deliveryStatus: 'blocked',
          safetyScanResult: 'flagged'
        }
      }

      // 5. Trim message if needed
      const trimmedMessage = this.trimMessage(request.message)

      // 6. Create contact attempt record
      const contactAttempt = await this.createContactAttempt({
        client_id: request.clientId,
        external_trainer_id: request.externalTrainerId,
        message: request.message,
        trimmed_message: trimmedMessage,
        character_count: request.message.length,
        contact_type: request.contactType,
        contact_sequence: request.contactType === 'initial' ? 1 : 2,
        safety_scan_result: safetyScan.clean ? 'clean' : 'flagged',
        delivery_status: 'pending',
        delivery_method: 'email',
        client_ip_address: clientIp,
        user_agent: userAgent
      })

      // 7. Update rate limits
      await this.updateRateLimits(request.clientId, clientIp)

      // 8. Schedule delivery (in real implementation, this would be async)
      const deliveryResult = await this.scheduleDelivery(contactAttempt)

      return {
        success: deliveryResult.success,
        contactAttemptId: contactAttempt.id,
        message: deliveryResult.success 
          ? 'Message sent successfully. Trainer must join FitMatch to reply.' 
          : 'Message queued for delivery.',
        deliveryStatus: deliveryResult.success ? 'sent' : 'pending',
        safetyScanResult: safetyScan.clean ? 'clean' : 'flagged'
      }

    } catch (error) {
      console.error('Error processing external contact:', error)
      return {
        success: false,
        contactAttemptId: '',
        message: 'Internal server error',
        deliveryStatus: 'failed',
        safetyScanResult: 'pending'
      }
    }
  }

  /**
   * Check if trainer has replied to a contact
   */
  async hasTrainerReplied(contactAttemptId: string): Promise<boolean> {
    // This would query the database
    // For now, return mock
    return false;
  }

  /**
   * Record trainer reply
   */
  async recordTrainerReply(
    contactAttemptId: string,
    replyMessage: string,
    trainerEmail: string
  ): Promise<{ success: boolean; claimToken?: string }> {
    try {
      // 1. Validate this is a valid reply (not exceeding limits)
      const canReply = await this.canTrainerReply(contactAttemptId)
      if (!canReply) {
        return { success: false }
      }

      // 2. Create reply contact attempt
      const replyAttempt = await this.createContactAttempt({
        // This would be populated from the original contact attempt
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

      // 4. Generate claim invitation
      const claimToken = await this.generateClaimInvitation(
        contactAttemptId,
        trainerEmail
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
   * Generate claim invitation for external trainer
   */
  private async generateClaimInvitation(
    contactAttemptId: string,
    trainerEmail: string
  ): Promise<string> {
    // Generate secure token
    const token = this.generateSecureToken()
    
    // Create claim token record
    await this.createClaimToken({
      token,
      contact_attempt_id: contactAttemptId,
      claimed_by_email: trainerEmail,
      max_uses: 1,
      use_count: 0,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      is_revoked: false
    })

    // Update contact attempt
    await this.updateContactAttemptWithClaim(contactAttemptId, token)

    return token;
  }

  /**
   * Check rate limits for client
   */
  private async checkRateLimits(
    clientId: string,
    clientIp: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Check IP-based limits
    const ipLimit = await this.getRateLimit('ip', clientIp, 'contact')
    if (ipLimit && ipLimit.count >= this.RATE_LIMIT_MAX_CONTACTS) {
      return { 
        allowed: false, 
        reason: 'Too many contacts from this IP address' 
      }
    }

    // Check client-based limits
    const clientLimit = await this.getRateLimit('client_id', clientId, 'contact')
    if (clientLimit && clientLimit.count >= this.RATE_LIMIT_MAX_CONTACTS) {
      return { 
        allowed: false, 
        reason: 'Too many contacts from your account' 
      }
    }

    return { allowed: true }
  }

  /**
   * Update rate limits after successful contact
   */
  private async updateRateLimits(clientId: string, clientIp: string): Promise<void> {
    const now = new Date()
    const windowStart = new Date(now.getTime() - this.RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000)

    // Update IP limit
    await this.upsertRateLimit({
      identifier: clientIp,
      identifier_type: 'ip',
      action_type: 'contact',
      count: 1, // Increment
      time_window_start: windowStart.toISOString(),
      time_window_end: now.toISOString()
    })

    // Update client limit
    await this.upsertRateLimit({
      identifier: clientId,
      identifier_type: 'client_id',
      action_type: 'contact',
      count: 1, // Increment
      time_window_start: windowStart.toISOString(),
      time_window_end: now.toISOString()
    })
  }

  /**
   * Perform safety scan on message
   */
  private async performSafetyScan(
    message: string,
    clientIp: string
  ): Promise<{ 
    clean: boolean; 
    blocked: boolean; 
    flagType?: string; 
    severity?: string; 
    reason?: string 
  }> {
    const lowerMessage = message.toLowerCase()

    // Check for off-platform contact attempts
    const offPlatformPatterns = [
      /@gmail\.com/i,
      /@yahoo\.com/i,
      /@outlook\.com/i,
      /@hotmail\.com/i,
      /@aol\.com/i,
      /my email is/i,
      /contact me at/i,
      /text me at/i,
      /call me at/i,
      /whatsapp/i,
      /telegram/i,
      /signal/i,
      /discord/i,
      /instagram/i,
      /facebook\.com/i,
      /twitter\.com/i,
      /linkedin\.com/i
    ];

    for (const pattern of offPlatformPatterns) {
      if (pattern.test(lowerMessage)) {
        return {
          clean: false,
          blocked: true,
          flagType: 'off_platform_attempt',
          severity: 'high',
          reason: 'Attempt to move conversation off-platform'
        }
      }
    }

    // Check for suspicious links
    const linkPatterns = [
      /http:\/\//i,
      /https:\/\//i,
      /\.com\//i,
      /\.net\//i,
      /\.org\//i,
      /bit\.ly/i,
      /tinyurl\.com/i,
      /goo\.gl/i
    ];

    for (const pattern of linkPatterns) {
      if (pattern.test(lowerMessage)) {
        return {
          clean: false,
          blocked: true,
          flagType: 'suspicious_link',
          severity: 'medium',
          reason: 'Message contains links'
        }
      }
    }

    // Check for spam patterns
    const spamPatterns = [
      /buy now/i,
      /click here/i,
      /special offer/i,
      /limited time/i,
      /discount/i,
      /cheap/i,
      /viagra/i,
      /cialis/i,
      /make money/i,
      /work from home/i
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(lowerMessage)) {
        return {
          clean: false,
          blocked: false, // Don't block, just flag
          flagType: 'spam_pattern',
          severity: 'low',
          reason: 'Possible spam content detected'
        }
      }
    }

    return { clean: true, blocked: false }
  }

  /**
   * Check if client already contacted this trainer
   */
  private async hasExistingContact(
    clientId: string,
    externalTrainerId: string
  ): Promise<boolean> {
    // This would query the database
    // For now, return mock
    return false;
  }

  /**
   * Check if trainer can reply (not exceeding reply limit)
   */
  private async canTrainerReply(contactAttemptId: string): Promise<boolean> {
    // This would check if trainer already replied
    // For now, return true
    return true;
  }

  /**
   * Validate message length
   */
  private validateMessageLength(message: string): boolean {
    return message.length <= this.MAX_MESSAGE_LENGTH;
  }

  /**
   * Trim message if needed
   */
  private trimMessage(message: string): string {
    if (message.length <= this.MAX_MESSAGE_LENGTH) {
      return message;
    }
    return message.substring(0, this.MAX_MESSAGE_LENGTH - 3) + '...';
  }

  /**
   * Generate secure token
   */
  private generateSecureToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Schedule message delivery
   */
  private async scheduleDelivery(
    contactAttempt: Partial<ExternalContactAttempt>
  ): Promise<{ success: boolean; deliveryId?: string }> {
    // In real implementation, this would:
    // 1. Add to message queue
    // 2. Send email to external trainer
    // 3. Update delivery status
    
    // For now, simulate successful delivery
    return { success: true, deliveryId: 'mock-delivery-id' }
  }

  // Mock database methods (would be implemented with actual DB calls)
  private async createContactAttempt(
    data: Partial<ExternalContactAttempt>
  ): Promise<ExternalContactAttempt> {
    return {
      id: 'mock-id-' + Date.now(),
      client_id: data.client_id || '',
      external_trainer_id: data.external_trainer_id || '',
      message: data.message || '',
      trimmed_message: data.trimmed_message,
      character_count: data.character_count || 0,
      contact_type: data.contact_type || 'initial',
      contact_sequence: data.contact_sequence || 1,
      safety_scan_result: data.safety_scan_result || 'pending',
      delivery_status: data.delivery_status || 'pending',
      delivery_method: data.delivery_method || 'email',
      trainer_replied: data.trainer_replied || false,
      claim_invitation_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as ExternalContactAttempt;
  }

  private async updateContactAttemptReply(
    contactAttemptId: string,
    replyAttemptId: string
  ): Promise<void> {
    // Mock implementation
  }

  private async updateContactAttemptWithClaim(
    contactAttemptId: string,
    claimToken: string
  ): Promise<void> {
    // Mock implementation
  }

  private async createClaimToken(
    data: Partial<any>
  ): Promise<void> {
    // Mock implementation
  }

  private async getRateLimit(
    identifierType: string,
    identifier: string,
    actionType: string
  ): Promise<ExternalRateLimit | null> {
    // Mock implementation
    return null;
  }

  private async upsertRateLimit(
    data: Partial<ExternalRateLimit>
  ): Promise<void> {
    // Mock implementation
  }

  private async recordSafetyFlag(
    data: Partial<ExternalSafetyFlag>
  ): Promise<void> {
    // Mock implementation
  }
}
