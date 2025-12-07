// Anti-leakage scanner utility

// EXPORT this interface - keep only this one
export interface DetectionResult {
  channelType: 'email' | 'phone' | 'social' | 'other';
  matches: string[];
  pattern: string;
}

interface PatternGroup {
  [key: string]: RegExp;
}

interface ChannelTypeMap {
  [key: string]: 'email' | 'phone' | 'social' | 'other';
}

class AntiLeakageScanner {
  private patterns: PatternGroup;
  private channelTypes: ChannelTypeMap;

  constructor() {
    // Regex patterns for detection
    this.patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      
      // Phone patterns (US and international)
      phone: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b|\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/g,
      
      // Social media handles and platforms
      social: /(?:@[\w_]+|(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|twitter\.com|facebook\.com|tiktok\.com|discord\.gg|t\.me)\/[\w\-._~:/?#[\]@!$&'()*+,;=]+)/gi,
      
      // Payment platforms
      payment: /\b(?:paypal|venmo|cashapp|zelle|cash\s*app|venmo\.me|paypal\.me)\b/gi,
      
      // Common off-platform phrases
      phrases: /\b(?:text\s*me|call\s*me|dm\s*me|direct\s*message|off\s*platform|outside\s*the\s*app|my\s*(?:phone|number|email)|whatsapp|signal|telegram)\b/gi
    };
    
    this.channelTypes = {
      email: 'email',
      phone: 'phone', 
      social: 'social',
      payment: 'other', // Payments fall under 'other' per our schema
      phrases: 'other'  // Phrases also fall under 'other'
    };
  }

  /**
   * Scan text for off-platform communication attempts
   * @param text - The text to scan
   * @returns Array of detected issues with channel types
   */
  scan(text: string): DetectionResult[] {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const detected: DetectionResult[] = [];
    
    // Check each pattern
    for (const [patternName, regex] of Object.entries(this.patterns)) {
      const matches = text.match(regex);
      if (matches) {
        detected.push({
          channelType: this.channelTypes[patternName],
          matches: [...matches],
          pattern: patternName
        });
      }
    }
    
    return detected;
  }

  /**
   * Check if text contains any off-platform attempts
   * @param text - The text to check
   * @returns True if any issues detected
   */
  hasIssues(text: string): boolean {
    return this.scan(text).length > 0;
  }

  /**
   * Get a user-friendly warning message based on detections
   * @param detections - Array of detection results from scan()
   * @returns Warning message or null if no detections
   */
  getWarningMessage(detections: DetectionResult[]): string | null {
    if (detections.length === 0) return null;
    
    const channels = new Set(detections.map(d => d.channelType));
    
    if (channels.has('email') || channels.has('phone') || channels.has('social')) {
      return "âš ï¸ For paid questions: Stay on FitMatch to remain protected. Off-platform payments cannot be refunded or monitored.";
    }
    
    return "âš ï¸ Please keep all communication and payments for paid questions on FitMatch to ensure protection and support.";
  }
}

// Export singleton instance
const scanner = new AntiLeakageScanner();
export default scanner;
