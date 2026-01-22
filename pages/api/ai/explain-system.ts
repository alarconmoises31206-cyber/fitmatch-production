// pages/api/ai/explain-system.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Type definitions
interface SystemExplanationRequest {
  context: {
    consultation_state?: string;
    token_balance?: number;
    match_score_breakdown?: Record<string, number>;
    user_type?: 'client' | 'trainer';
  };
  question?: string;
}

interface SystemExplanation {
  explanation: string;
  relevant_rules: string[];
  system_mechanics: string[];
  founder_notes?: string[];
}

// This is a founder-only tool
function authenticateFounder(req: NextApiRequest): boolean {
  // In production, implement proper founder authentication
  // For now, we'll use a simple header check
  const founderToken = req.headers['x-founder-token'];
  return founderToken === process.env.ADMIN_SECRET_TOKEN;
}

// Boundary guard - ensures AI only explains, never simulates authority
function enforceExplainabilityBoundaries(request: SystemExplanationRequest): { allowed: boolean; reason: string } {
  // REJECT if endpoint attempts to:
  // - Simulate authority
  // - Make predictions about outcomes
  // - Suggest rule changes
  // - Hallucinate non-existent features
  
  // Check for any attempt to claim authority
  const forbiddenPatterns = [
    /will happen/i,
    /should do/i,
    /must change/i,
    /recommend.*change/i,
    /predict.*outcome/i,
    /authority.*to/i
  ];
  
  const inputStr = JSON.stringify(request);
  const hasForbidden = forbiddenPatterns.some(pattern => 
    pattern.test(inputStr)
  );
  
  if (hasForbidden) {
    return { 
      allowed: false, 
      reason: 'AI can only explain existing system mechanics, not predict or recommend changes' 
    };
  }
  
  return { allowed: true, reason: 'Explanation only - describes existing system' };
}

// System explanation function
async function explainSystem(
  request: SystemExplanationRequest
): Promise<SystemExplanation> {
  const explanation: SystemExplanation = {
    explanation: '',
    relevant_rules: [],
    system_mechanics: [],
    founder_notes: []
  };
  
  // Handle specific questions
  if (request.question) {
    const q = request.question.toLowerCase();
    
    if (q.includes('match') && q.includes('work')) {
      explanation.explanation = 'FitMatch uses deterministic matching based on tag overlap, experience level, price compatibility, and availability. AI only explains matches, never creates them.';
      explanation.relevant_rules = [
        'Tag overlap: 40% weight',
        'Experience match: 25% weight', 
        'Price compatibility: 20% weight',
        'Availability alignment: 15% weight'
      ];
      explanation.system_mechanics = [
        'Scores calculated mechanically',
        'No AI influence on scores',
        'Ranking is deterministic'
      ];
      explanation.founder_notes = [
        'AI Phase 66 adds explanation layer only',
        'Match integrity maintained by code'
      ];
    }
    else if (q.includes('token') || q.includes('pay')) {
      explanation.explanation = 'Tokens are deducted per message in paid consultations. Trainers set prices, clients pay per message. No subscription or hidden fees.';
      explanation.relevant_rules = [
        'Trainer sets price per message',
        'Client pays per message sent',
        'Tokens deducted immediately',
        'Balance visible in real-time'
      ];
      explanation.system_mechanics = [
        'Stripe handles payments',
        'Token balance in database',
        'Automatic deduction on send'
      ];
    }
    else if (q.includes('consultation') && q.includes('end')) {
      explanation.explanation = 'Consultations end when: 1) Client runs out of tokens, 2) Either party manually ends it, or 3) 30-day inactivity timeout. AI cannot end consultations.';
      explanation.relevant_rules = [
        'Client controls token spending',
        'Either party can end anytime',
        '30-day inactivity timeout',
        'No automatic AI endings'
      ];
    }
    else {
      explanation.explanation = 'FitMatch is a paid consultation marketplace with mechanical rule enforcement. AI Phase 66 adds interpretation and explanation layers only.';
    }
  }
  
  // Add context-specific explanations
  if (request.context) {
    if (request.context.consultation_state) {
      explanation.system_mechanics.push(
        `Consultation state: ${request.context.consultation_state} (managed by code, not AI)`
      );
    }
    
    if (request.context.token_balance !== undefined) {
      explanation.system_mechanics.push(
        `Token balance: ${request.context.token_balance} (mechanical deduction per message)`
      );
    }
    
    if (request.context.user_type) {
      explanation.system_mechanics.push(
        `User type: ${request.context.user_type} (different rules apply)`
      );
    }
  }
  
  // Always include core principles
  explanation.relevant_rules.push(
    'AI interprets, never decides',
    'Humans set rules',
    'Code enforces value',
    'System functions without AI'
  );
  
  return explanation;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Founder authentication
  if (!authenticateFounder(req)) {
    return res.status(403).json({ 
      error: 'Founder access required',
      reason: 'This tool is for system explanation to founders only'
    });
  }

  try {
    const { context, question } = req.body;
    
    // Enforce AI boundaries
    const boundaryCheck = enforceExplainabilityBoundaries({
      context: context || {},
      question
    });
    
    if (!boundaryCheck.allowed) {
      return res.status(403).json({ 
        error: 'AI boundary violation',
        reason: boundaryCheck.reason
      });
    }

    // Generate system explanation
    const explanation = await explainSystem({
      context: context || {},
      question
    });

    // Return the explanation
    return res.status(200).json({
      success: true,
      explanation: explanation,
      metadata: {
        generated_at: new Date().toISOString(),
        tool_purpose: 'Founder system explainability',
        disclaimer: 'Explains existing system mechanics only. No predictions or recommendations.',
        phase: 'Phase 66 - AI Interpretation & Explainability'
      }
    });

  } catch (error) {
    console.error('Error in AI system explanation:', error);
    
    // Graceful degradation
    return res.status(200).json({
      success: false,
      explanation: {
        explanation: 'System explanation temporarily unavailable.',
        relevant_rules: ['System functions mechanically without AI'],
        system_mechanics: ['All economic rules enforced by code'],
        founder_notes: ['Phase 66: AI is optional interpretation layer only']
      },
      metadata: {
        generated_at: new Date().toISOString(),
        fallback_mode: true
      }
    });
  }
}
