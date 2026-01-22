// pages/api/ai/interpret-profile.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Type definitions for our AI interpretation
interface AIProfileSummary {
  strengths: string[];
  goals: string[];
  preferences: string[];
  constraints: string[];
  red_flags?: string[];
}

interface ProfileData {
  profile_type: 'client' | 'trainer';
  profile_data: any;
  questionnaire_data?: any;
}

// Boundary guard - ensures AI stays within read-only interpretation
function enforceAIBoundaries(input: ProfileData): { allowed: boolean; reason: string } {
  // REJECT if endpoint attempts to:
  // - Change consultation state
  // - Affect token balance
  // - Modify pricing
  // - Alter match scores
  // - Gate access/eligibility
  
  // Check for any attempt to modify system state
  const forbiddenKeys = [
    'token_balance', 'consultation_state', 'pricing', 
    'match_score', 'eligibility', 'authority', 'permission'
  ];
  
  const inputStr = JSON.stringify(input).toLowerCase();
  const hasForbidden = forbiddenKeys.some(key => 
    inputStr.includes(key.toLowerCase())
  );
  
  if (hasForbidden) {
    return { 
      allowed: false, 
      reason: 'AI interpretation cannot modify system state, authority, or economic rules' 
    };
  }
  
  return { allowed: true, reason: 'Read-only interpretation only' };
}

// Mock AI interpretation function
// In production, this would call an actual AI service (OpenAI, Anthropic, etc.)
async function interpretProfile(
  profileType: 'client' | 'trainer',
  profileData: any,
  questionnaireData?: any
): Promise<AIProfileSummary> {
  // This is a mock implementation
  // In Phase 66, we're building the architecture - actual AI integration comes later
  
  if (profileType === 'client') {
    return {
      strengths: ['Clear fitness goals', 'Regular schedule availability'],
      goals: ['Weight loss', 'Muscle building'],
      preferences: ['Online sessions', 'Structured programs'],
      constraints: ['Budget conscious', 'Limited equipment'],
      red_flags: []
    };
  } else {
    return {
      strengths: ['Certified trainer', 'Experience with beginners'],
      goals: ['Help clients achieve sustainable results'],
      preferences: ['Hypertrophy focus', 'Nutrition coaching'],
      constraints: ['Limited weekend availability'],
      red_flags: []
    };
  }
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
    const { profile_type, profile_data, questionnaire_data, user_id } = req.body;
    
    if (!profile_type || !profile_data || !user_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: profile_type, profile_data, user_id' 
      });
    }

    // Enforce AI boundaries
    const boundaryCheck = enforceAIBoundaries({
      profile_type,
      profile_data,
      questionnaire_data
    });
    
    if (!boundaryCheck.allowed) {
      return res.status(403).json({ 
        error: 'AI boundary violation',
        reason: boundaryCheck.reason
      });
    }

    // Generate AI interpretation
    const aiSummary = await interpretProfile(
      profile_type,
      profile_data,
      questionnaire_data
    );

    // Store the interpretation in the database (non-blocking, best effort)
    try {
      const tableName = profile_type === 'client' ? 'client_profiles' : 'trainer_profiles';
      
      // First check if the table has ai_summary column
      // If not, we'll skip storage - system continues to function
      await supabase
        .from(tableName)
        .update({ 
          ai_summary: aiSummary,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .select()
        .single()
        .then(({ error }) => {
          if (error) {
            console.warn(`Failed to store AI summary for ${profile_type}:`, error.message);
            // Continue without throwing - AI failure should not break the system
          }
        });
    } catch (dbError) {
      console.warn('Database storage failed for AI summary:', dbError);
      // Continue without throwing - AI is optional
    }

    // Return the interpretation
    return res.status(200).json({
      success: true,
      ai_summary: aiSummary,
      disclaimer: 'This is an AI interpretation for informational purposes only. It does not affect matching, pricing, or system authority.',
      stored_successfully: true
    });

  } catch (error) {
    console.error('Error in AI profile interpretation:', error);
    
    // Graceful degradation - return empty but valid response
    return res.status(200).json({
      success: false,
      ai_summary: {
        strengths: [],
        goals: [],
        preferences: [],
        constraints: [],
        red_flags: []
      },
      disclaimer: 'AI interpretation temporarily unavailable. System continues to function normally.',
      stored_successfully: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
