// pages/api/ai/explain-match.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Type definitions
interface MatchExplanation {
  headline: string;
  top_reasons: string[];
  potential_mismatches: string[];
  confidence_note: string;
}

interface MatchFactors {
  tag_overlap: string[];
  experience_match: boolean;
  price_compatible: boolean;
  availability_aligned: boolean;
  deterministic_score: number;
}

interface MatchExplanationRequest {
  client_id: string;
  trainer_id: string;
  match_factors: MatchFactors;
}

// Boundary guard - ensures AI only explains, never decides
function enforceExplanationBoundaries(request: MatchExplanationRequest): { allowed: boolean; reason: string } {
  // REJECT if endpoint attempts to:
  // - Modify match scores
  // - Change ranking
  // - Filter matches
  // - Gate access
  
  // Check for any attempt to modify system state
  const forbiddenKeys = [
    'modify_score', 'change_rank', 'filter_match', 'gate_access',
    'authority', 'permission', 'eligibility'
  ];
  
  const inputStr = JSON.stringify(request).toLowerCase();
  const hasForbidden = forbiddenKeys.some(key => 
    inputStr.includes(key.toLowerCase())
  );
  
  if (hasForbidden) {
    return { 
      allowed: false, 
      reason: 'AI can only explain matches, not modify them' 
    };
  }
  
  // Verify match_factors includes deterministic_score
  if (!request.match_factors?.deterministic_score) {
    return {
      allowed: false,
      reason: 'Match explanation requires deterministic scoring'
    };
  }
  
  return { allowed: true, reason: 'Explanation only - no authority' };
}

// Mock AI explanation function
async function explainMatch(
  clientId: string,
  trainerId: string,
  matchFactors: MatchFactors
): Promise<MatchExplanation> {
  // This is a mock implementation
  // In production, this would generate explanations based on match factors
  
  const reasons: string[] = [];
  const mismatches: string[] = [];
  
  // Generate explanations based on deterministic factors
  if (matchFactors.tag_overlap.length > 0) {
    reasons.push(`Specializes in ${matchFactors.tag_overlap.join(', ')}`);
  }
  
  if (matchFactors.experience_match) {
    reasons.push('Experience level matches your needs');
  }
  
  if (matchFactors.price_compatible) {
    reasons.push('Pricing fits your budget expectations');
  } else {
    mismatches.push('Pricing may not align with your budget');
  }
  
  if (matchFactors.availability_aligned) {
    reasons.push('Availability matches your schedule');
  } else {
    mismatches.push('Schedule alignment may require coordination');
  }
  
  // Determine confidence note based on score
  let confidenceNote = 'Good match based on profile alignment';
  if (matchFactors.deterministic_score > 80) {
    confidenceNote = 'Strong match with high compatibility';
  } else if (matchFactors.deterministic_score < 50) {
    confidenceNote = 'Moderate match - review details carefully';
  }
  
  return {
    headline: `Why this ${matchFactors.deterministic_score}% match makes sense`,
    top_reasons: reasons,
    potential_mismatches: mismatches,
    confidence_note: confidenceNote
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { client_id, trainer_id, match_factors } = req.body;
    
    if (!client_id || !trainer_id || !match_factors) {
      return res.status(400).json({ 
        error: 'Missing required fields: client_id, trainer_id, match_factors' 
      });
    }

    // Enforce AI boundaries
    const boundaryCheck = enforceExplanationBoundaries({
      client_id,
      trainer_id,
      match_factors
    });
    
    if (!boundaryCheck.allowed) {
      return res.status(403).json({ 
        error: 'AI boundary violation',
        reason: boundaryCheck.reason
      });
    }

    // Generate AI explanation
    const explanation = await explainMatch(
      client_id,
      trainer_id,
      match_factors
    );

    // Return the explanation
    return res.status(200).json({
      success: true,
      explanation: explanation,
      metadata: {
        generated_at: new Date().toISOString(),
        match_score: match_factors.deterministic_score,
        disclaimer: 'AI explains existing matches only. Matching is deterministic and not affected by AI.',
        boundaries_respected: [
          'No score modification',
          'No ranking changes',
          'No filtering authority',
          'Explanation only'
        ]
      }
    });

  } catch (error) {
    console.error('Error in AI match explanation:', error);
    
    // Graceful degradation - return empty but valid response
    return res.status(200).json({
      success: false,
      explanation: {
        headline: 'Match explanation temporarily unavailable',
        top_reasons: ['System matching is based on your profile preferences'],
        potential_mismatches: [],
        confidence_note: 'View match details for more information'
      },
      metadata: {
        generated_at: new Date().toISOString(),
        disclaimer: 'AI explanation unavailable. Match details show deterministic factors.',
        fallback_mode: true
      }
    });
  }
}
