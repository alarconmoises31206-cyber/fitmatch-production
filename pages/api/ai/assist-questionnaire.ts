// pages/api/ai/assist-questionnaire.ts
import { NextApiRequest, NextApiResponse } from 'next';

// Type definitions
interface QuestionnaireAssistRequest {
  role: 'client' | 'trainer';
  current_answers: Record<string, any>;
  current_question?: string;
  user_input?: string;
}

interface QuestionnaireSuggestion {
  suggested_phrasing?: string;
  missing_dimensions?: string[];
  clarification_questions?: string[];
  reflection?: string;
}

// Boundary guard - ensures AI only assists, never requires
function enforceAssistBoundaries(request: QuestionnaireAssistRequest): { allowed: boolean; reason: string } {
  // REJECT if endpoint attempts to:
  // - Require answers
  // - Auto-submit forms
  // - Gate progression
  // - Enforce compliance
  
  // Check for any attempt to enforce or require
  const forbiddenKeys = [
    'require', 'mandatory', 'must', 'enforce', 'gate',
    'block', 'prevent', 'reject', 'invalid', 'wrong'
  ];
  
  const inputStr = JSON.stringify(request).toLowerCase();
  const hasForbidden = forbiddenKeys.some(key => 
    inputStr.includes(key.toLowerCase())
  );
  
  if (hasForbidden) {
    return { 
      allowed: false, 
      reason: 'AI can only suggest, not require or enforce' 
    };
  }
  
  return { allowed: true, reason: 'Assistance only - optional suggestions' };
}

// Mock AI assistance function
async function assistQuestionnaire(
  request: QuestionnaireAssistRequest
): Promise<QuestionnaireSuggestion> {
  // This is a mock implementation
  
  const suggestions: QuestionnaireSuggestion = {};
  
  if (request.role === 'trainer') {
    // Help trainers phrase consultation questions
    if (request.current_question?.includes('coaching style')) {
      suggestions.suggested_phrasing = 'Consider asking about: preferred communication frequency, goal-setting approach, and feedback preferences';
    }
    
    // Suggest missing dimensions
    const answeredKeys = Object.keys(request.current_answers || {});
    const commonDimensions = ['injury_history', 'schedule_flexibility', 'motivation_factors', 'past_experiences'];
    const missing = commonDimensions.filter(dim => !answeredKeys.includes(dim));
    
    if (missing.length > 0) {
      suggestions.missing_dimensions = missing;
    }
  } else {
    // Help clients clarify answers
    if (request.user_input && request.user_input.length < 10) {
      suggestions.clarification_questions = [
        'Can you share more about your specific goals?',
        'What does success look like for you in 3 months?'
      ];
    }
    
    // Reflect back intent
    if (request.current_answers?.goals) {
      const goals = Array.isArray(request.current_answers.goals) 
        ? request.current_answers.goals 
        : [request.current_answers.goals];
      
      if (goals.some((g: string) => g.includes('consist') || g.includes('account'))) {
        suggestions.reflection = 'Sounds like accountability and consistency are important to you';
      }
    }
  }
  
  return suggestions;
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
    const { role, current_answers, current_question, user_input } = req.body;
    
    if (!role) {
      return res.status(400).json({ 
        error: 'Missing required field: role' 
      });
    }

    // Enforce AI boundaries
    const boundaryCheck = enforceAssistBoundaries({
      role,
      current_answers: current_answers || {},
      current_question,
      user_input
    });
    
    if (!boundaryCheck.allowed) {
      return res.status(403).json({ 
        error: 'AI boundary violation',
        reason: boundaryCheck.reason
      });
    }

    // Generate AI assistance
    const suggestions = await assistQuestionnaire({
      role,
      current_answers: current_answers || {},
      current_question,
      user_input
    });

    // Return the suggestions
    return res.status(200).json({
      success: true,
      suggestions: suggestions,
      metadata: {
        generated_at: new Date().toISOString(),
        role: role,
        disclaimer: 'AI suggestions are optional. You control all inputs and submissions.',
        boundaries_respected: [
          'No auto-submission',
          'No requirement enforcement',
          'No progression gating',
          'Suggestions only'
        ]
      }
    });

  } catch (error) {
    console.error('Error in AI questionnaire assist:', error);
    
    // Graceful degradation - return empty suggestions
    return res.status(200).json({
      success: false,
      suggestions: {},
      metadata: {
        generated_at: new Date().toISOString(),
        disclaimer: 'AI assistance temporarily unavailable. Continue filling out your questionnaire normally.',
        fallback_mode: true
      }
    });
  }
}
